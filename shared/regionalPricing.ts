export type PricingTier = 'premium' | 'emerging';

export const PRICING_TIERS = {
  premium: {
    price: 7.99,
    priceDisplay: '$7.99',
    stripePriceEnvKey: 'STRIPE_PRICE_PRO_PREMIUM',
  },
  emerging: {
    price: 1.99,
    priceDisplay: '$1.99',
    stripePriceEnvKey: 'STRIPE_PRICE_PRO_EMERGING',
  },
} as const;

export const PREMIUM_COUNTRIES = new Set([
  'US', 'CA',
  'GB', 'DE', 'FR', 'NL', 'BE', 'AT', 'CH', 'IE',
  'DK', 'SE', 'NO', 'FI',
  'JP', 'KR', 'SG', 'AU', 'NZ',
  'AE', 'QA', 'KW', 'SA', 'IL',
]);

export const EMERGING_COUNTRIES = new Set([
  'ET', 'KE', 'NG', 'GH', 'TZ', 'UG', 'RW', 'ZA', 'MA', 'EG', 'TN',
  'IN', 'BD', 'PK', 'LK', 'NP',
  'PH', 'ID', 'MM', 'KH', 'TH', 'MY', 'VN', 'LA',
  'BR', 'MX', 'AR', 'CL', 'CO', 'PE', 'EC', 'BO', 'PY',
  'GT', 'HN', 'SV', 'NI',
  'PL', 'CZ', 'HU', 'RO', 'GR', 'PT', 'UA', 'MD', 'GE', 'AM',
  'UZ', 'KZ',
]);

export function getTierForCountry(countryCode: string | null | undefined): PricingTier {
  if (!countryCode) {
    return 'premium';
  }
  
  const code = countryCode.toUpperCase();
  
  if (PREMIUM_COUNTRIES.has(code)) {
    return 'premium';
  }
  
  if (EMERGING_COUNTRIES.has(code)) {
    return 'emerging';
  }
  
  return 'premium';
}

export function getPricingForTier(tier: PricingTier) {
  return PRICING_TIERS[tier];
}

export function getPricingForCountry(countryCode: string | null | undefined) {
  const tier = getTierForCountry(countryCode);
  return {
    tier,
    ...PRICING_TIERS[tier],
  };
}
