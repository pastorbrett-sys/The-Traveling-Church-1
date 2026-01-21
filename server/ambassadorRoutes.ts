import { Router } from "express";
import { db } from "./storage";
import { ambassadors, referralClicks, referralSignups } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { isAuthenticated } from "./firebaseAdmin";

const router = Router();

function generateCode(prefix: string): string {
  return `${prefix}${nanoid(8).toUpperCase()}`;
}

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.SESSION_SECRET || 'salt').digest('hex').substring(0, 16);
}

router.post("/register", async (req, res) => {
  try {
    const { userId, email, name, inviteCode, country, reason, referralSource } = req.body;
    
    if (!userId || !email || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await db.select().from(ambassadors).where(eq(ambassadors.userId, userId)).limit(1);
    if (existing.length > 0) {
      return res.json({ ambassador: existing[0], existing: true });
    }

    let referredById: string | null = null;
    if (inviteCode) {
      const referrer = await db.select().from(ambassadors).where(eq(ambassadors.inviteCode, inviteCode)).limit(1);
      if (referrer.length > 0) {
        referredById = referrer[0].id;
      }
    }

    const referralCode = generateCode("REF");
    const newInviteCode = generateCode("INV");

    const [ambassador] = await db.insert(ambassadors).values({
      userId,
      email,
      name,
      country: country || null,
      reason: reason || null,
      referralSource: referralSource || null,
      referralCode,
      inviteCode: newInviteCode,
      referredBy: referredById,
      status: "pending",
      tier: 1,
      isSuperAdmin: false,
    }).returning();

    // Send emails (don't await to not block response)
    const { sendAmbassadorApplicationEmail, sendAmbassadorAdminNotificationEmail } = await import('./email');
    
    // Send confirmation to applicant
    sendAmbassadorApplicationEmail(email, name.split(' ')[0]).catch(err => {
      console.error('[Ambassador] Failed to send application email:', err);
    });
    
    // Send notification to admin
    sendAmbassadorAdminNotificationEmail(name, email, ambassador.id, {
      country: country || undefined,
      reason: reason || undefined,
      referralSource: referralSource || undefined,
    }).catch(err => {
      console.error('[Ambassador] Failed to send admin notification:', err);
    });

    res.json({ ambassador, existing: false });
  } catch (error) {
    console.error("Ambassador registration error:", error);
    res.status(500).json({ error: "Failed to register ambassador" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const [ambassador] = await db.select().from(ambassadors).where(eq(ambassadors.userId, userId)).limit(1);
    if (!ambassador) {
      return res.status(404).json({ error: "Ambassador not found" });
    }

    res.json({ ambassador });
  } catch (error) {
    console.error("Get ambassador error:", error);
    res.status(500).json({ error: "Failed to get ambassador" });
  }
});

router.get("/dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [ambassador] = await db.select().from(ambassadors).where(eq(ambassadors.userId, userId)).limit(1);
    if (!ambassador) {
      return res.status(404).json({ error: "Ambassador not found" });
    }

    const clicksResult = await db.select({ count: sql<number>`count(*)` })
      .from(referralClicks)
      .where(eq(referralClicks.referralCode, ambassador.referralCode));
    
    const signupsResult = await db.select({ count: sql<number>`count(*)` })
      .from(referralSignups)
      .where(eq(referralSignups.referralCode, ambassador.referralCode));
    
    const conversionsResult = await db.select({ count: sql<number>`count(*)` })
      .from(referralSignups)
      .where(sql`${referralSignups.referralCode} = ${ambassador.referralCode} AND ${referralSignups.convertedToPro} = true`);

    const team = await db.select().from(ambassadors).where(eq(ambassadors.referredBy, ambassador.id));

    const teamWithStats = await Promise.all(team.map(async (member) => {
      const memberClicks = await db.select({ count: sql<number>`count(*)` })
        .from(referralClicks)
        .where(eq(referralClicks.referralCode, member.referralCode));
      
      const memberSignups = await db.select({ count: sql<number>`count(*)` })
        .from(referralSignups)
        .where(eq(referralSignups.referralCode, member.referralCode));

      return {
        ...member,
        clicks: Number(memberClicks[0]?.count || 0),
        signups: Number(memberSignups[0]?.count || 0),
      };
    }));

    res.json({
      ambassador,
      stats: {
        clicks: Number(clicksResult[0]?.count || 0),
        signups: Number(signupsResult[0]?.count || 0),
        conversions: Number(conversionsResult[0]?.count || 0),
      },
      team: teamWithStats,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to get dashboard data" });
  }
});

router.post("/track-click", async (req, res) => {
  try {
    const { referralCode } = req.body;
    const userAgent = req.get("user-agent") || null;
    const ip = req.ip || req.connection.remoteAddress || "";
    const ipHash = hashIP(ip);

    await db.insert(referralClicks).values({
      referralCode,
      userAgent,
      ipHash,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
});

router.post("/track-signup", async (req, res) => {
  try {
    const { referralCode, userId } = req.body;
    console.log(`[Ambassador] 📝 Track-signup request: userId=${userId}, referralCode=${referralCode}`);

    if (!referralCode || !userId) {
      console.log(`[Ambassador] ❌ Missing required fields for signup tracking`);
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if ambassador with this referral code exists
    const [ambassador] = await db.select().from(ambassadors).where(eq(ambassadors.referralCode, referralCode)).limit(1);
    if (!ambassador) {
      console.log(`[Ambassador] ⚠️ Invalid referral code: ${referralCode}`);
      return res.status(400).json({ error: "Invalid referral code" });
    }

    const existing = await db.select().from(referralSignups).where(eq(referralSignups.userId, userId)).limit(1);
    if (existing.length > 0) {
      console.log(`[Ambassador] ℹ️ User ${userId} already has a referral signup record (code: ${existing[0].referralCode})`);
      return res.json({ success: true, existing: true });
    }

    await db.insert(referralSignups).values({
      referralCode,
      userId,
      convertedToPro: false,
    });

    console.log(`[Ambassador] ✅ Successfully recorded signup for user ${userId} with referral code ${referralCode} (ambassador: ${ambassador.name})`);
    res.json({ success: true, existing: false });
  } catch (error) {
    console.error("[Ambassador] ❌ Track signup error:", error);
    res.status(500).json({ error: "Failed to track signup" });
  }
});

router.post("/track-conversion", async (req, res) => {
  try {
    const { userId } = req.body;

    await db.update(referralSignups)
      .set({ convertedToPro: true, conversionDate: new Date() })
      .where(eq(referralSignups.userId, userId));

    res.json({ success: true });
  } catch (error) {
    console.error("Track conversion error:", error);
    res.status(500).json({ error: "Failed to track conversion" });
  }
});

async function checkSuperAdmin(userId: string): Promise<boolean> {
  const [ambassador] = await db.select().from(ambassadors).where(eq(ambassadors.userId, userId)).limit(1);
  return ambassador?.isSuperAdmin === true;
}

router.get("/clicks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [ambassador] = await db.select().from(ambassadors).where(eq(ambassadors.userId, userId)).limit(1);
    if (!ambassador) {
      return res.status(404).json({ error: "Ambassador not found" });
    }

    const clicks = await db.select()
      .from(referralClicks)
      .where(eq(referralClicks.referralCode, ambassador.referralCode))
      .orderBy(desc(referralClicks.clickedAt));

    const clicksWithDetails = clicks.map((click) => ({
      id: click.id,
      userAgent: click.userAgent,
      clickedAt: click.clickedAt,
    }));

    res.json({ clicks: clicksWithDetails });
  } catch (error) {
    console.error("Get clicks error:", error);
    res.status(500).json({ error: "Failed to get clicks" });
  }
});

router.get("/conversions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [ambassador] = await db.select().from(ambassadors).where(eq(ambassadors.userId, userId)).limit(1);
    if (!ambassador) {
      return res.status(404).json({ error: "Ambassador not found" });
    }

    const conversions = await db.select()
      .from(referralSignups)
      .where(sql`${referralSignups.referralCode} = ${ambassador.referralCode} AND ${referralSignups.convertedToPro} = true`)
      .orderBy(desc(referralSignups.conversionDate));

    const { users } = await import("@shared/schema");
    const conversionsWithDetails = await Promise.all(conversions.map(async (conv) => {
      const [user] = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      }).from(users).where(eq(users.id, conv.userId)).limit(1);

      return {
        id: conv.id,
        userId: conv.userId,
        email: user?.email || "Unknown",
        name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User" : "Unknown User",
        conversionDate: conv.conversionDate,
      };
    }));

    res.json({ conversions: conversionsWithDetails });
  } catch (error) {
    console.error("Get conversions error:", error);
    res.status(500).json({ error: "Failed to get conversions" });
  }
});

router.get("/signups/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [ambassador] = await db.select().from(ambassadors).where(eq(ambassadors.userId, userId)).limit(1);
    if (!ambassador) {
      return res.status(404).json({ error: "Ambassador not found" });
    }

    // Get all signups for this ambassador's referral code
    const signups = await db.select()
      .from(referralSignups)
      .where(eq(referralSignups.referralCode, ambassador.referralCode))
      .orderBy(desc(referralSignups.createdAt));

    // Get user details for each signup
    const { users } = await import("@shared/schema");
    const signupsWithDetails = await Promise.all(signups.map(async (signup) => {
      const [user] = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      }).from(users).where(eq(users.id, signup.userId)).limit(1);

      return {
        id: signup.id,
        userId: signup.userId,
        email: user?.email || "Unknown",
        name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User" : "Unknown User",
        convertedToPro: signup.convertedToPro,
        conversionDate: signup.conversionDate,
        signupDate: signup.createdAt,
      };
    }));

    res.json({ signups: signupsWithDetails });
  } catch (error) {
    console.error("Get signups error:", error);
    res.status(500).json({ error: "Failed to get signups" });
  }
});

router.get("/admin/all", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId || !await checkSuperAdmin(userId)) {
      return res.status(403).json({ error: "Super admin access required" });
    }
    
    const allAmbassadors = await db.select().from(ambassadors).orderBy(desc(ambassadors.createdAt));

    const ambassadorsWithStats = await Promise.all(allAmbassadors.map(async (amb) => {
      const clicks = await db.select({ count: sql<number>`count(*)` })
        .from(referralClicks)
        .where(eq(referralClicks.referralCode, amb.referralCode));
      
      const signups = await db.select({ count: sql<number>`count(*)` })
        .from(referralSignups)
        .where(eq(referralSignups.referralCode, amb.referralCode));
      
      const conversions = await db.select({ count: sql<number>`count(*)` })
        .from(referralSignups)
        .where(sql`${referralSignups.referralCode} = ${amb.referralCode} AND ${referralSignups.convertedToPro} = true`);

      const teamCount = await db.select({ count: sql<number>`count(*)` })
        .from(ambassadors)
        .where(eq(ambassadors.referredBy, amb.id));

      return {
        ...amb,
        clicks: Number(clicks[0]?.count || 0),
        signups: Number(signups[0]?.count || 0),
        conversions: Number(conversions[0]?.count || 0),
        teamSize: Number(teamCount[0]?.count || 0),
      };
    }));

    res.json({ ambassadors: ambassadorsWithStats });
  } catch (error) {
    console.error("Admin get all error:", error);
    res.status(500).json({ error: "Failed to get ambassadors" });
  }
});

router.post("/admin/approve/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId || !await checkSuperAdmin(userId)) {
      return res.status(403).json({ error: "Super admin access required" });
    }
    
    const { id } = req.params;

    const [updated] = await db.update(ambassadors)
      .set({ status: "active" })
      .where(eq(ambassadors.id, id))
      .returning();

    // Send approval email with the ambassador's real referral code from the database
    if (updated) {
      const { sendAmbassadorApprovedEmail } = await import('./email');
      const firstName = updated.name?.split(' ')[0] || null;
      
      sendAmbassadorApprovedEmail(updated.email, firstName, updated.referralCode).catch(err => {
        console.error('[Ambassador] Failed to send approval email:', err);
      });
    }

    res.json({ ambassador: updated });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ error: "Failed to approve ambassador" });
  }
});

router.post("/admin/pause/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId || !await checkSuperAdmin(userId)) {
      return res.status(403).json({ error: "Super admin access required" });
    }
    
    const { id } = req.params;

    const [updated] = await db.update(ambassadors)
      .set({ status: "paused" })
      .where(eq(ambassadors.id, id))
      .returning();

    res.json({ ambassador: updated });
  } catch (error) {
    console.error("Pause error:", error);
    res.status(500).json({ error: "Failed to pause ambassador" });
  }
});

router.post("/admin/set-super-admin/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId || !await checkSuperAdmin(userId)) {
      return res.status(403).json({ error: "Super admin access required" });
    }
    
    const { id } = req.params;
    const { isSuperAdmin } = req.body;

    const [updated] = await db.update(ambassadors)
      .set({ isSuperAdmin })
      .where(eq(ambassadors.id, id))
      .returning();

    res.json({ ambassador: updated });
  } catch (error) {
    console.error("Set super admin error:", error);
    res.status(500).json({ error: "Failed to update super admin status" });
  }
});

router.get("/admin/tree", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId || !await checkSuperAdmin(userId)) {
      return res.status(403).json({ error: "Super admin access required" });
    }
    
    const allAmbassadors = await db.select().from(ambassadors);
    
    const buildTree = (parentId: string | null): any[] => {
      return allAmbassadors
        .filter(a => a.referredBy === parentId)
        .map(a => ({
          ...a,
          children: buildTree(a.id),
        }));
    };

    const tree = buildTree(null);
    res.json({ tree });
  } catch (error) {
    console.error("Tree error:", error);
    res.status(500).json({ error: "Failed to get referral tree" });
  }
});

export default router;
