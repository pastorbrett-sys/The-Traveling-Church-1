import { getUncachableStripeClient } from '../server/stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();
  
  console.log('Creating subscription products...');

  // Check if products already exist
  const existingProducts = await stripe.products.search({ 
    query: "name:'Free Plan' OR name:'Pro Plan'" 
  });
  
  if (existingProducts.data.length > 0) {
    console.log('Products already exist:');
    existingProducts.data.forEach(p => console.log(`- ${p.name}: ${p.id}`));
    console.log('\nTo create regional prices, run: npx ts-node scripts/seed-regional-prices.ts');
    return;
  }

  // Create Free Plan
  const freePlan = await stripe.products.create({
    name: 'Free Plan',
    description: 'Basic access to The Traveling Church community features',
    metadata: {
      tier: 'free',
      features: JSON.stringify([
        'Access to blog posts',
        'View upcoming events',
        'Read testimonials',
        'Contact form access'
      ])
    }
  });
  console.log(`Created Free Plan: ${freePlan.id}`);

  // Create Free Plan price ($0/month)
  const freePrice = await stripe.prices.create({
    product: freePlan.id,
    unit_amount: 0,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'free' }
  });
  console.log(`Created Free Plan price: ${freePrice.id}`);

  // Create Pro Plan
  const proPlan = await stripe.products.create({
    name: 'Pro Plan',
    description: 'Full access to all Traveling Church features including AI Bible Buddy',
    metadata: {
      tier: 'pro',
      features: JSON.stringify([
        'Everything in Free Plan',
        'Unlimited AI Bible Buddy',
        'Priority event notifications',
        'Exclusive community content',
        'Direct prayer requests'
      ])
    }
  });
  console.log(`Created Pro Plan: ${proPlan.id}`);

  // Create Pro Plan Premium price ($7.99/month) - for developed markets
  const proPremiumPrice = await stripe.prices.create({
    product: proPlan.id,
    unit_amount: 799,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'pro', billing: 'monthly', region: 'premium' }
  });
  console.log(`Created Pro Plan Premium price: ${proPremiumPrice.id}`);

  // Create Pro Plan Emerging price ($1.99/month) - for emerging markets
  const proEmergingPrice = await stripe.prices.create({
    product: proPlan.id,
    unit_amount: 199,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'pro', billing: 'monthly', region: 'emerging' }
  });
  console.log(`Created Pro Plan Emerging price: ${proEmergingPrice.id}`);

  // Create Pro Plan yearly price ($79.99/year - Premium markets)
  const proYearlyPrice = await stripe.prices.create({
    product: proPlan.id,
    unit_amount: 7999,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { tier: 'pro', billing: 'yearly', region: 'premium' }
  });
  console.log(`Created Pro Plan yearly price: ${proYearlyPrice.id}`);

  console.log('\n==========================================');
  console.log('Products created successfully!');
  console.log('==========================================\n');
  console.log('Product IDs:');
  console.log(`Free Plan: ${freePlan.id}`);
  console.log(`Pro Plan: ${proPlan.id}`);
  console.log('\nPrice IDs (save these to environment variables):');
  console.log(`Free Monthly: ${freePrice.id}`);
  console.log(`Pro Premium Monthly ($7.99): ${proPremiumPrice.id} → STRIPE_PRICE_PRO_PREMIUM`);
  console.log(`Pro Emerging Monthly ($1.99): ${proEmergingPrice.id} → STRIPE_PRICE_PRO_EMERGING`);
  console.log(`Pro Yearly ($79.99): ${proYearlyPrice.id}`);
  console.log('\n==========================================');
  console.log('IMPORTANT: Add these to your environment:');
  console.log(`STRIPE_PRICE_PRO_PREMIUM=${proPremiumPrice.id}`);
  console.log(`STRIPE_PRICE_PRO_EMERGING=${proEmergingPrice.id}`);
  console.log('==========================================\n');
}

seedProducts().catch(console.error);
