import { getStripeSync, getUncachableStripeClient, getStripeSecretKey } from './stripeClient';
import { storage, db } from './storage';
import { referralSignups } from '@shared/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

async function trackAmbassadorConversion(userId: string, source: string): Promise<void> {
  try {
    console.log(`[Ambassador] 🔄 Attempting to track conversion for user ${userId} (source: ${source})`);
    
    // First check if this user has a referral signup entry
    const existing = await db.select().from(referralSignups).where(eq(referralSignups.userId, userId));
    
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
      .where(eq(referralSignups.userId, userId))
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
      const webhookSecret = await WebhookHandlers.getWebhookSecret();
      
      if (!webhookSecret) {
        console.log('[Webhook Handler] ⚠️ No webhook secret configured, skipping user link handling');
        return;
      }

      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      console.log(`[Webhook Handler] 📋 Processing event: ${event.type}`);
      
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

    // Get customer to find userId from metadata
    const stripe = await getUncachableStripeClient();
    const customer = await stripe.customers.retrieve(customerId);
    
    if ('deleted' in customer && customer.deleted) {
      console.log('Customer was deleted');
      return;
    }

    const userId = customer.metadata?.userId;
    
    if (!userId || userId === 'guest') {
      console.log('No valid userId in customer metadata:', userId);
      return;
    }

    // Update the user's Stripe info
    console.log(`Linking Stripe customer ${customerId} to user ${userId}`);
    await storage.updateUserStripeInfo(userId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId || undefined,
    });
    console.log(`Successfully linked Stripe info for user ${userId}`);
    
    // Track ambassador conversion - only if subscription exists and is active
    // The subscription.updated webhook will also fire, so conversion is tracked there
    // for the definitive status. We track here for immediate checkout completions.
    if (subscriptionId) {
      const stripe = await getUncachableStripeClient();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        await trackAmbassadorConversion(userId, 'Stripe checkout.session.completed');
      }
    }
  }

  static async handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const subscriptionId = subscription.id;
    
    if (!customerId) {
      return;
    }

    // Get customer to find userId from metadata
    const stripe = await getUncachableStripeClient();
    const customer = await stripe.customers.retrieve(customerId);
    
    if ('deleted' in customer && customer.deleted) {
      return;
    }

    const userId = customer.metadata?.userId;
    
    if (!userId || userId === 'guest') {
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
      await trackAmbassadorConversion(userId, `Stripe subscription.${subscription.status}`);
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

    // Get customer to find userId from metadata
    const stripe = await getUncachableStripeClient();
    const customer = await stripe.customers.retrieve(customerId);
    
    if ('deleted' in customer && customer.deleted) {
      return;
    }

    const userId = customer.metadata?.userId;
    
    if (!userId || userId === 'guest') {
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
