import { getStripeSync, getUncachableStripeClient, getStripeSecretKey } from './stripeClient';
import { storage, db } from './storage';
import { referralSignups } from '@shared/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { sendSubscriptionConfirmationEmail } from './email';

async function trackAmbassadorConversion(userId: string, source: string, referralCode?: string, email?: string): Promise<void> {
  try {
    console.log(`[Ambassador] 🔄 Attempting to track conversion for user ${userId} (source: ${source}, referralCode: ${referralCode || 'none'}, email: ${email || 'none'})`);
    
    let existing: typeof referralSignups.$inferSelect[] = [];
    
    // PRIORITY 1: Match by userId (most reliable when available)
    if (userId && userId !== 'guest') {
      existing = await db.select().from(referralSignups).where(eq(referralSignups.userId, userId));
      if (existing.length > 0) {
        console.log(`[Ambassador] ✅ Found signup by userId: ${userId}`);
      }
    }
    
    // PRIORITY 2: If we have both userId and referralCode but no match, 
    // the user might have signed up with a different account - check referralCode
    // Note: This scenario is rare but handles account switching edge cases
    
    // PRIORITY 3: If no userId match, try to find by email (more deterministic than code-only)
    // This helps identify the specific user even for guest checkouts
    if (existing.length === 0 && email) {
      console.log(`[Ambassador] 🔍 No signup by userId, trying by email: ${email}`);
      // Import users table for email matching
      const { users } = await import('@shared/schema');
      
      // Find user by email
      const usersByEmail = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (usersByEmail.length > 0) {
        const emailUserId = usersByEmail[0].id;
        existing = await db.select().from(referralSignups).where(eq(referralSignups.userId, emailUserId));
        if (existing.length > 0) {
          // If referralCode is provided, validate it matches the signup's referralCode
          if (referralCode && existing[0].referralCode !== referralCode) {
            console.log(`[Ambassador] ⚠️ Referral code mismatch: expected ${existing[0].referralCode}, got ${referralCode}`);
            // Still use this match since email is deterministic - the user signed up with this referral
          }
          console.log(`[Ambassador] ✅ Found signup by email-matched userId: ${emailUserId}`);
        }
      }
    }
    
    // PRIORITY 4: Last resort - find by referralCode alone (most recent unconverted)
    // This handles edge cases but is less deterministic for high-volume ambassadors
    if (existing.length === 0 && referralCode) {
      console.log(`[Ambassador] 🔍 No signup by userId or email, trying fallback by referralCode: ${referralCode}`);
      const byCode = await db.select().from(referralSignups)
        .where(eq(referralSignups.referralCode, referralCode));
      if (byCode.length > 0) {
        // Find most recent unconverted entry (sort by createdAt descending)
        const unconverted = byCode
          .filter(s => !s.convertedToPro)
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Most recent first
          })[0];
        if (unconverted) {
          existing = [unconverted];
          console.log(`[Ambassador] ⚠️ Using referralCode-only fallback (less deterministic): ${referralCode} (signup ID: ${unconverted.id})`);
        }
      }
    }
    
    if (existing.length === 0) {
      console.log(`[Ambassador] ⚠️ No referral signup found for user ${userId} - they may not have used a referral link`);
      return;
    }
    
    if (existing[0].convertedToPro) {
      console.log(`[Ambassador] ✅ User ${userId} already marked as Pro conversion (date: ${existing[0].conversionDate})`);
      return;
    }
    
    // Only update if not already converted (idempotency)
    const result = await db.update(referralSignups)
      .set({ convertedToPro: true, conversionDate: new Date() })
      .where(eq(referralSignups.id, existing[0].id))
      .returning();
    
    if (result.length > 0) {
      console.log(`[Ambassador] 🎉 SUCCESS! Tracked Pro conversion for user ${userId} (referral code: ${result[0].referralCode})`);
    }
  } catch (error) {
    console.error('[Ambassador] ❌ Error tracking conversion:', error);
  }
}

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
    
    // After stripe-replit-sync processes the webhook, we need to handle
    // linking the Stripe customer/subscription to user accounts
    await WebhookHandlers.handleUserStripeLink(payload, signature);
  }

  static async handleUserStripeLink(payload: Buffer, signature: string): Promise<void> {
    try {
      const stripe = await getUncachableStripeClient();
      
      // Parse the payload to get event info
      const payloadJson = JSON.parse(payload.toString());
      const eventId = payloadJson.id;
      const eventType = payloadJson.type;
      
      console.log(`[Webhook Handler] 📋 Processing event: ${eventType} (${eventId})`);
      
      // SECURITY: Verify this event exists in Stripe by fetching it directly
      // This prevents spoofed webhook payloads from being processed
      let event: Stripe.Event;
      try {
        event = await stripe.events.retrieve(eventId);
        console.log(`[Webhook Handler] ✅ Event verified with Stripe API`);
      } catch (verifyError: any) {
        console.error(`[Webhook Handler] ❌ Event ${eventId} could not be verified with Stripe API:`, verifyError.message);
        return; // Don't process unverified events
      }
      
      switch (event.type) {
        case 'checkout.session.completed':
          console.log('[Webhook Handler] 🛒 Handling checkout.session.completed');
          await WebhookHandlers.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          console.log(`[Webhook Handler] 📝 Handling ${event.type}`);
          await WebhookHandlers.handleSubscriptionChange(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          console.log('[Webhook Handler] 🗑️ Handling subscription.deleted');
          await WebhookHandlers.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`[Webhook Handler] ⏭️ Ignoring event type: ${event.type}`);
      }
    } catch (error) {
      console.error('[Webhook Handler] ❌ Error handling user stripe link:', error);
      // Don't throw - we don't want to fail the webhook if user linking fails
    }
  }

  static async getWebhookSecret(): Promise<string | null> {
    try {
      const sync = await getStripeSync();
      // The stripe-replit-sync manages webhook secrets
      const webhookInfo = await sync.getManagedWebhook();
      return webhookInfo?.secret || null;
    } catch (error) {
      console.error('Error getting webhook secret:', error);
      return null;
    }
  }

  static async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    
    if (!customerId) {
      console.log('No customer ID in checkout session');
      return;
    }

    const stripe = await getUncachableStripeClient();
    
    // PRIORITY 1: Read metadata from checkout session (most reliable)
    let userId = session.metadata?.userId;
    let referralCode = session.metadata?.referralCode;
    let email = session.metadata?.email;
    
    console.log(`[Checkout] Session metadata - userId: ${userId || 'none'}, referralCode: ${referralCode || 'none'}, email: ${email || 'none'}`);
    
    // PRIORITY 2: If session metadata is missing, try subscription metadata
    if ((!userId || !referralCode) && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (!userId && subscription.metadata?.userId) {
        userId = subscription.metadata.userId;
        console.log(`[Checkout] Got userId from subscription metadata: ${userId}`);
      }
      if (!referralCode && subscription.metadata?.referralCode) {
        referralCode = subscription.metadata.referralCode;
        console.log(`[Checkout] Got referralCode from subscription metadata: ${referralCode}`);
      }
      if (!email && subscription.metadata?.email) {
        email = subscription.metadata.email;
      }
    }
    
    // PRIORITY 3: Fall back to customer metadata
    if (!userId || !referralCode) {
      const customer = await stripe.customers.retrieve(customerId);
      if (!('deleted' in customer && customer.deleted)) {
        if (!userId && customer.metadata?.userId) {
          userId = customer.metadata.userId;
          console.log(`[Checkout] Got userId from customer metadata: ${userId}`);
        }
        if (!referralCode && customer.metadata?.referralCode) {
          referralCode = customer.metadata.referralCode;
          console.log(`[Checkout] Got referralCode from customer metadata: ${referralCode}`);
        }
        if (!email && customer.email) {
          email = customer.email;
        }
      }
    }
    
    if (!userId || userId === 'guest') {
      console.log(`[Checkout] No valid userId found. ReferralCode: ${referralCode || 'none'}, Email: ${email || 'none'}`);
      // Still try to track by referralCode if available
      if (referralCode && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          await trackAmbassadorConversion('guest', 'Stripe checkout (guest)', referralCode, email);
        }
      }
      return;
    }

    // Update the user's Stripe info
    console.log(`Linking Stripe customer ${customerId} to user ${userId}`);
    await storage.updateUserStripeInfo(userId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId || undefined,
    });
    console.log(`Successfully linked Stripe info for user ${userId}`);
    
    // Track ambassador conversion and send confirmation email - only if subscription exists and is active
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        await trackAmbassadorConversion(userId, 'Stripe checkout.session.completed', referralCode, email);
        
        // Send subscription confirmation email (fire and forget)
        if (email) {
          const user = await storage.getUser(userId);
          // Determine pricing tier from session metadata or subscription
          const pricingTier = session.metadata?.pricingTier as 'premium' | 'emerging' | undefined;
          const planType = pricingTier || 'premium';
          
          console.log(`[Webhook] Sending subscription confirmation email to ${email} (plan: ${planType})`);
          sendSubscriptionConfirmationEmail(email, user?.firstName, planType).catch(error => {
            console.error('[Webhook] Failed to send subscription confirmation email:', error);
          });
        }
      }
    }
  }

  static async handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const subscriptionId = subscription.id;
    
    if (!customerId) {
      return;
    }

    const stripe = await getUncachableStripeClient();
    
    // PRIORITY 1: Read metadata from subscription (most reliable for subscription events)
    let userId = subscription.metadata?.userId;
    let referralCode = subscription.metadata?.referralCode;
    let email = subscription.metadata?.email;
    
    console.log(`[Subscription] Subscription metadata - userId: ${userId || 'none'}, referralCode: ${referralCode || 'none'}, email: ${email || 'none'}`);
    
    // PRIORITY 2: Fall back to customer metadata
    if (!userId || !referralCode) {
      const customer = await stripe.customers.retrieve(customerId);
      if (!('deleted' in customer && customer.deleted)) {
        if (!userId && customer.metadata?.userId) {
          userId = customer.metadata.userId;
          console.log(`[Subscription] Got userId from customer metadata: ${userId}`);
        }
        if (!referralCode && customer.metadata?.referralCode) {
          referralCode = customer.metadata.referralCode;
          console.log(`[Subscription] Got referralCode from customer metadata: ${referralCode}`);
        }
        if (!email && customer.email) {
          email = customer.email;
        }
      }
    }
    
    if (!userId || userId === 'guest') {
      // Still try to track by referralCode if available
      if (referralCode && (subscription.status === 'active' || subscription.status === 'trialing')) {
        console.log(`[Subscription] Guest subscription active - tracking by referralCode: ${referralCode}, email: ${email || 'none'}`);
        await trackAmbassadorConversion('guest', `Stripe subscription.${subscription.status} (guest)`, referralCode, email);
      }
      return;
    }

    // Only update if subscription is active or trialing
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      // Check if user already has this info
      const user = await storage.getUser(userId);
      if (user && (user.stripeCustomerId !== customerId || user.stripeSubscriptionId !== subscriptionId)) {
        console.log(`Updating Stripe subscription ${subscriptionId} for user ${userId}`);
        await storage.updateUserStripeInfo(userId, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        });
      }
      
      // Track ambassador conversion whenever subscription is active/trialing
      await trackAmbassadorConversion(userId, `Stripe subscription.${subscription.status}`, referralCode, email);
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'past_due') {
      // Subscription is no longer active - clear the subscription ID
      const user = await storage.getUser(userId);
      if (user && user.stripeSubscriptionId === subscriptionId) {
        console.log(`Clearing inactive subscription ${subscriptionId} for user ${userId} (status: ${subscription.status})`);
        await storage.updateUserStripeInfo(userId, {
          stripeCustomerId: customerId, // Keep customer ID for potential re-subscription
          stripeSubscriptionId: null,
        });
      }
    }
  }

  static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const subscriptionId = subscription.id;
    
    if (!customerId) {
      return;
    }

    const stripe = await getUncachableStripeClient();
    
    // PRIORITY 1: Read userId from subscription metadata (most reliable for subscription events)
    let userId = subscription.metadata?.userId;
    console.log(`[SubscriptionDeleted] Subscription metadata userId: ${userId || 'none'}`);
    
    // PRIORITY 2: Fall back to customer metadata
    if (!userId) {
      const customer = await stripe.customers.retrieve(customerId);
      if (!('deleted' in customer && customer.deleted)) {
        if (customer.metadata?.userId) {
          userId = customer.metadata.userId;
          console.log(`[SubscriptionDeleted] Got userId from customer metadata: ${userId}`);
        }
      }
    }
    
    if (!userId || userId === 'guest') {
      console.log(`[SubscriptionDeleted] No valid userId found for subscription ${subscriptionId}`);
      return;
    }

    // Clear the subscription ID when subscription is deleted
    const user = await storage.getUser(userId);
    if (user && user.stripeSubscriptionId === subscriptionId) {
      console.log(`Removing deleted subscription ${subscriptionId} from user ${userId}`);
      await storage.updateUserStripeInfo(userId, {
        stripeCustomerId: customerId, // Keep customer ID for potential re-subscription
        stripeSubscriptionId: null,
      });
    }
  }
}
