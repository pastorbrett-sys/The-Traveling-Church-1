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
    description: 'Full access to all Traveling Church features including AI Pastor Chat',
    metadata: {
      tier: 'pro',
      features: JSON.stringify([
        'Everything in Free Plan',
        'Unlimited AI Pastor Chat',
        'Priority event notifications',
        'Exclusive community content',
        'Direct prayer requests'
      ])
    }
  });
  console.log(`Created Pro Plan: ${proPlan.id}`);

  // Create Pro Plan monthly price ($9.99/month)
  const proMonthlyPrice = await stripe.prices.create({
    product: proPlan.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'pro', billing: 'monthly' }
  });
  console.log(`Created Pro Plan monthly price: ${proMonthlyPrice.id}`);

  // Create Pro Plan yearly price ($99/year - save $20)
  const proYearlyPrice = await stripe.prices.create({
    product: proPlan.id,
    unit_amount: 9900,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { tier: 'pro', billing: 'yearly' }
  });
  console.log(`Created Pro Plan yearly price: ${proYearlyPrice.id}`);

  console.log('\nProducts created successfully!');
  console.log('\nProduct IDs:');
  console.log(`Free Plan: ${freePlan.id}`);
  console.log(`Pro Plan: ${proPlan.id}`);
  console.log('\nPrice IDs:');
  console.log(`Free Monthly: ${freePrice.id}`);
  console.log(`Pro Monthly: ${proMonthlyPrice.id}`);
  console.log(`Pro Yearly: ${proYearlyPrice.id}`);
}

seedProducts().catch(console.error);
