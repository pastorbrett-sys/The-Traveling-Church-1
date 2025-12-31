import { getUncachableStripeClient } from './stripeClient';

async function createAIPastorProduct() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating AI Pastor Pro product...');

  const product = await stripe.products.create({
    name: 'AI Pastor Pro',
    description: 'Unlimited AI Pastor conversations with personalized spiritual guidance, prayer support, and biblical wisdom available 24/7.',
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
