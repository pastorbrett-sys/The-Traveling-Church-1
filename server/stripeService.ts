import { getUncachableStripeClient } from './stripeClient';
import { stripeStorage } from './stripeStorage';
import { getTierForCountry, getPricingForCountry, type PricingTier, PRICING_TIERS } from '@shared/regionalPricing';

export class StripeService {
  async createCustomer(email: string, userId: string, referralCode?: string) {
    const stripe = await getUncachableStripeClient();
    const metadata: Record<string, string> = { userId };
    if (referralCode) {
      metadata.referralCode = referralCode;
    }
    return await stripe.customers.create({
      email,
      metadata,
    });
  }

  async getOrCreateCustomer(existingCustomerId: string | null, email: string, userId: string, referralCode?: string) {
    const stripe = await getUncachableStripeClient();
    
    // If we have an existing customer ID, try to retrieve it
    if (existingCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(existingCustomerId);
        // Check if customer exists and isn't deleted
        if (customer && !('deleted' in customer && customer.deleted)) {
          // Update metadata - upsert both userId and referralCode when provided
          const existingMetadata = (customer as any).metadata || {};
          const metadataUpdates: Record<string, string> = {};
          
          // Always update userId if provided and different/missing (handles guest→authenticated upgrades)
          if (userId && userId !== 'guest' && existingMetadata.userId !== userId) {
            metadataUpdates.userId = userId;
            console.log(`[Stripe] Updating customer ${existingCustomerId} userId: ${existingMetadata.userId || 'none'} → ${userId}`);
          }
          
          // Update referralCode if provided and not already set
          if (referralCode && !existingMetadata.referralCode) {
            metadataUpdates.referralCode = referralCode;
            console.log(`[Stripe] Updating customer ${existingCustomerId} referralCode: ${referralCode}`);
          }
          
          // Apply updates if any
          if (Object.keys(metadataUpdates).length > 0) {
            await stripe.customers.update(existingCustomerId, {
              metadata: metadataUpdates
            });
          }
          return customer;
        }
      } catch (error: any) {
        // Customer doesn't exist in this Stripe environment (test vs live mismatch)
        console.log(`Customer ${existingCustomerId} not found, creating new one`);
      }
    }
    
    // Create a new customer with referral code if available
    const metadata: Record<string, string> = { userId };
    if (referralCode) {
      metadata.referralCode = referralCode;
    }
    return await stripe.customers.create({
      email,
      metadata,
    });
  }

  async createCheckoutSession(
    customerId: string, 
    priceId: string, 
    successUrl: string, 
    cancelUrl: string,
    metadata?: { userId?: string; referralCode?: string; email?: string }
  ) {
    const stripe = await getUncachableStripeClient();
    const sessionMetadata: Record<string, string> = {};
    if (metadata?.userId) sessionMetadata.userId = metadata.userId;
    if (metadata?.referralCode) sessionMetadata.referralCode = metadata.referralCode;
    if (metadata?.email) sessionMetadata.email = metadata.email;
    
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: Object.keys(sessionMetadata).length > 0 ? sessionMetadata : undefined,
      subscription_data: Object.keys(sessionMetadata).length > 0 ? { metadata: sessionMetadata } : undefined,
    });
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getProduct(productId: string) {
    return await stripeStorage.getProduct(productId);
  }

  async getSubscription(subscriptionId: string) {
    return await stripeStorage.getSubscription(subscriptionId);
  }

  getPriceIdForTier(tier: PricingTier): string | null {
    const envKey = PRICING_TIERS[tier].stripePriceEnvKey;
    return process.env[envKey] || null;
  }

  async createRegionalCheckoutSession(
    customerId: string,
    tier: PricingTier,
    successUrl: string,
    cancelUrl: string,
    metadata?: { userId?: string; referralCode?: string; email?: string; pricingTier?: string }
  ) {
    const priceId = this.getPriceIdForTier(tier);
    
    if (!priceId) {
      throw new Error(`No price ID configured for tier: ${tier}. Set ${PRICING_TIERS[tier].stripePriceEnvKey} in environment.`);
    }
    
    const stripe = await getUncachableStripeClient();
    const sessionMetadata: Record<string, string> = {
      pricingTier: tier,
    };
    if (metadata?.userId) sessionMetadata.userId = metadata.userId;
    if (metadata?.referralCode) sessionMetadata.referralCode = metadata.referralCode;
    if (metadata?.email) sessionMetadata.email = metadata.email;
    
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: sessionMetadata,
      subscription_data: { metadata: sessionMetadata },
    });
  }

  async getCustomerCountry(customerId: string): Promise<string | null> {
    const stripe = await getUncachableStripeClient();
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      
      if (paymentMethods.data.length > 0 && paymentMethods.data[0].card?.country) {
        return paymentMethods.data[0].card.country;
      }
      return null;
    } catch (error) {
      console.error('Error fetching customer country:', error);
      return null;
    }
  }
}

export const stripeService = new StripeService();
