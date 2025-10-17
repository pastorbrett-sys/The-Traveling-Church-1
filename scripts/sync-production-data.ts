import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { locations, events } from "../shared/schema";
import { eq } from "drizzle-orm";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function syncProductionData() {
  const productionDbUrl = process.env.DATABASE_URL;
  
  if (!productionDbUrl) {
    console.error("❌ DATABASE_URL not found");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: productionDbUrl });
  const db = drizzle(pool);

  console.log("🔄 Syncing production database...\n");

  try {
    // Update locations with correct image URLs
    const locationUpdates = [
      { name: "The Jordan River", imageUrl: "/public-objects/Jordan-River_1760679838250.jpg" },
      { name: "Jerusalem", imageUrl: "/public-objects/Jerusalem_1760679620278.jpg" },
      { name: "Cambodia", imageUrl: "/public-objects/Cambodia_1760679558974.jpg" },
      { name: "Thailand", imageUrl: "/public-objects/Thailand_1760680162179.jpg" },
      { name: "Egypt", imageUrl: "/public-objects/Egypt_1760679346019.jpg" },
      { name: "Ethiopia", imageUrl: "/public-objects/Ethiopia_1760680076506.jpg" },
    ];

    console.log("📍 Updating location images...");
    for (const update of locationUpdates) {
      await db
        .update(locations)
        .set({ imageUrl: update.imageUrl })
        .where(eq(locations.name, update.name));
      console.log(`  ✓ Updated ${update.name}`);
    }

    // Update events
    console.log("\n📅 Updating events...");
    
    const mensGroupUpdate = {
      title: "Mens Group",
      description: "Weekly gathering every Friday for men to connect, share openly, and build strength together. A safe space for honest conversation and spiritual growth. 8-9pm EDT.",
      type: "online" as const,
      scheduleLabel: "Every Friday",
      timeLabel: "8-9pm EDT",
      location: "Remote"
    };

    const vibeServiceUpdate = {
      title: "International Vibe Service",
      description: "Join us for an informal worship experience filled with fellowship, conversation, education and a deep dive into the word. Lets celebrate faith and community together from all over the Globe.",
      type: "online" as const,
      scheduleLabel: "Every Week Sunday",
      timeLabel: "Noon-1:30PM EDT",
      location: "Remote"
    };

    await db
      .update(events)
      .set(mensGroupUpdate)
      .where(eq(events.title, "Mens Group"));
    console.log("  ✓ Updated Mens Group");

    await db
      .update(events)
      .set(vibeServiceUpdate)
      .where(eq(events.title, "International Vibe Service"));
    console.log("  ✓ Updated International Vibe Service");

    console.log("\n✅ Production database synced successfully!");
    console.log("🚀 Refresh your live site - all images and events should now be correct!");

  } catch (error) {
    console.error("❌ Error syncing production:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

syncProductionData();
