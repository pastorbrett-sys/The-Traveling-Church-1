import { getUncachableStripeClient } from './server/stripeClient';

const SUBS_TO_CANCEL = [
  'sub_1SkuCxRsVyPIeVLeDkrSSTRF',
  'sub_1Sksv5RsVyPIeVLekK5WwkFb',
  'sub_1SkPMSETjK9TgzktKq5elt0l',
  'sub_1SkOgWETjK9TgzktRQetqv28',
  'sub_1Ss5QgRsVyPIeVLeMrTtlL27',
  'sub_1SrXmrRsVyPIeVLeseapUp53',
  'sub_1SrWwARsVyPIeVLebwJmzQ2H',
];

async function cancelAll() {
  const stripe = await getUncachableStripeClient();
  
  for (const subId of SUBS_TO_CANCEL) {
    try {
      const sub = await stripe.subscriptions.cancel(subId);
      console.log(`Cancelled ${subId} (status: ${sub.status})`);
    } catch (error: any) {
      console.error(`Failed ${subId}: ${error.message}`);
    }
  }
  
  console.log('\nDone! Kept sub_1SkdImRsVyPIeVLeiyIWHZ8x (lindstrom.brett@gmail.com) active.');
}

cancelAll().catch(console.error);
