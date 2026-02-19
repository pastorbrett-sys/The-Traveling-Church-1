import { getUncachableStripeClient } from './stripeClient';

async function createAIPastorProduct() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating The Best AI Bible Tools Ever Built Pro product...');

  const product = await stripe.products.create({
    name: 'The Best AI Bible Tools Ever Built Pro',
    description: 'Unlimited access to the best AI Bible tools ever built, featuring personalized spiritual guidance, prayer support, and biblical wisdom 24/7.',
    metadata: {
      feature_unlimited_chat: 'true',
      feature_priority_support: 'true',
      feature_conversation_history: 'true',
    },
  });

  console.log('Product created:', product.id);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan_type: 'pro',
    },
  });

  console.log('Price created:', price.id);
  console.log('\nDone! Product and price will sync automatically via webhooks.');
  console.log(`\nProduct ID: ${product.id}`);
  console.log(`Price ID: ${price.id}`);
}

createAIPastorProduct().catch(console.error);
