# Regional Pricing Setup Guide

**Vagabond Bible — Two-Tier Regional Pricing Configuration**

---

## Overview

This document provides step-by-step instructions for configuring regional pricing across all platforms:
- **Stripe** (Web)
- **Apple App Store** (iOS)
- **Google Play Store** (Android)

The pricing model uses **card-issuing country detection** (not IP location) to ensure tourists pay premium pricing regardless of their physical location.

---

## Pricing Tiers

| Tier | Monthly Price | Target Markets |
|------|---------------|----------------|
| **Premium** | $7.99 | USA, UK, EU, Japan, Australia, etc. |
| **Emerging** | $1.99 | Ethiopia, India, Kenya, Brazil, etc. |

### Key Implementation Files

| File | Purpose |
|------|---------|
| `shared/regionalPricing.ts` | Country-to-tier mapping, pricing constants |
| `server/stripeService.ts` | Regional checkout session creation, card country detection |
| `server/routes.ts` | `/api/pricing/tier` and `/api/stripe/regional-checkout` endpoints |
| `client/src/components/upgrade-dialog.tsx` | Frontend pricing display |

---

## 1. Stripe Dashboard Setup (Web) — REQUIRED

### Step 1: Access Stripe Products

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Product Catalog**
3. Find or create **"Pro Plan"** product

### Step 2: Create Regional Price IDs

For the Pro Plan product, create two monthly subscription prices:

#### Premium Price ($7.99/month)
1. Click **"Add another price"**
2. Set:
   - **Price**: $7.99 USD
   - **Billing period**: Monthly
   - **Metadata** (optional): `region: premium`
3. Click **Save**
4. **Copy the Price ID** (e.g., `price_1ABC123...`)

#### Emerging Price ($1.99/month)
1. Click **"Add another price"**
2. Set:
   - **Price**: $1.99 USD
   - **Billing period**: Monthly
   - **Metadata** (optional): `region: emerging`
3. Click **Save**
4. **Copy the Price ID** (e.g., `price_2DEF456...`)

### Step 3: Set Environment Variables

Add these to your Replit Secrets (or `.env` file):

```bash
STRIPE_PRICE_PRO_PREMIUM=price_1ABC123...  # The $7.99 price ID
STRIPE_PRICE_PRO_EMERGING=price_2DEF456... # The $1.99 price ID
```

### Step 4: Verify Configuration

Test the pricing endpoint:
```bash
curl http://localhost:5000/api/pricing/tier
# Should return: {"tier":"premium","price":7.99,...}

curl -H "cf-ipcountry: ET" http://localhost:5000/api/pricing/tier
# Should return: {"tier":"emerging","price":1.99,...}
```

### Step 5: Test with International Cards

Use Stripe's test card numbers to verify regional pricing:

| Country | Card Number | Expected Tier |
|---------|-------------|---------------|
| USA | `4242424242424242` | premium |
| Australia | `4000000360000006` | premium |
| Brazil | `4000000760000002` | emerging |
| India | `4000003560000008` | emerging |

Full list: [Stripe Testing International Cards](https://stripe.com/docs/testing#international-cards)

---

## 2. Apple App Store Setup (iOS) — REQUIRED

### Step 1: Access App Store Connect

1. Log in to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to your app → **Subscriptions**

### Step 2: Create Subscription Group

1. Click **"+"** to create a new subscription group
2. Name: **"Vagabond Bible Pro"**
3. Click **Create**

### Step 3: Create Subscription Product

1. Within the group, click **"Create Subscription"**
2. Configure:
   - **Reference Name**: "Pro Monthly"
   - **Product ID**: `pro_monthly` (must match RevenueCat)
   - **Subscription Duration**: 1 Month

### Step 4: Set Base Price (Premium Markets)

1. In the subscription details, go to **"Subscription Prices"**
2. Click **"Add Subscription Price"**
3. Select **Tier 8** ($7.99 USD)
4. This becomes the default for Premium markets

### Step 5: Configure Emerging Market Pricing

1. In the subscription prices section, click **"Set prices for other countries"**
2. For each Emerging market country, select **Tier 2** (~$1.99 equivalent):

**Emerging Market Countries to Override:**
- **Africa**: Ethiopia, Kenya, Nigeria, Ghana, Tanzania, Uganda, Rwanda, South Africa, Morocco, Egypt, Tunisia
- **South Asia**: India, Bangladesh, Pakistan, Sri Lanka, Nepal
- **Southeast Asia**: Philippines, Indonesia, Myanmar, Cambodia, Thailand, Malaysia, Vietnam, Laos
- **Latin America**: Brazil, Mexico, Argentina, Chile, Colombia, Peru, Ecuador, Bolivia, Paraguay, Guatemala, Honduras, El Salvador, Nicaragua
- **Eastern Europe**: Poland, Czech Republic, Hungary, Romania, Greece, Portugal, Ukraine, Moldova, Georgia, Armenia
- **Central Asia**: Uzbekistan, Kazakhstan

### Step 6: Submit for Review

1. Complete all required metadata
2. Submit the subscription for App Review
3. Once approved, the pricing will be live

---

## 3. Google Play Store Setup (Android) — REQUIRED

### Step 1: Access Play Console

1. Log in to [Google Play Console](https://play.google.com/console)
2. Navigate to your app → **Monetize** → **Products** → **Subscriptions**

### Step 2: Create Subscription

1. Click **"Create subscription"**
2. Configure:
   - **Product ID**: `pro_monthly` (must match RevenueCat)
   - **Name**: "Vagabond Bible Pro"
   - **Description**: "Full access to all Vagabond Bible features"
   - **Billing period**: 1 Month

### Step 3: Set Base Price

1. Click **"Set price"**
2. Enter **$7.99 USD** as the base price
3. Google will auto-calculate local currency equivalents

### Step 4: Configure Regional Price Overrides

1. Click **"Manage prices"**
2. Click **"Override prices"**
3. For each Emerging market, set the price to approximately **$1.99 USD equivalent**:

**Countries to Override:**
- Use Google's recommended local pricing where possible
- Target ~$1.99 USD equivalent in local currency
- Apply to all countries listed in the Emerging Market section above

### Step 5: Activate Subscription

1. Review all settings
2. Click **"Activate"**
3. The subscription will be available for purchase

---

## 4. RevenueCat Integration

### Existing Configuration

RevenueCat is already configured with API key: `appl_IHuuguwDzrFpaSziwpBDtyAdmqg`

### Verify Product Sync

1. Log in to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Navigate to your project → **Products**
3. Verify that:
   - **iOS product**: `pro_monthly` is synced from App Store Connect
   - **Android product**: `pro_monthly` is synced from Play Console

### Create Offering

1. Go to **Offerings** → **Create New Offering**
2. Name: **"default"** (or update existing)
3. Add the `pro_monthly` packages for both iOS and Android
4. Make this the current offering

---

## 5. Verification Checklist

### Stripe (Web)
- [ ] Premium price ID created ($7.99)
- [ ] Emerging price ID created ($1.99)
- [ ] `STRIPE_PRICE_PRO_PREMIUM` environment variable set
- [ ] `STRIPE_PRICE_PRO_EMERGING` environment variable set
- [ ] `/api/pricing/tier` returns correct tiers
- [ ] `/api/stripe/regional-checkout` creates sessions successfully
- [ ] Tested with international test cards

### Apple App Store (iOS)
- [ ] Subscription group created
- [ ] `pro_monthly` product created
- [ ] Base price set to Tier 8 ($7.99)
- [ ] Emerging markets set to Tier 2 (~$1.99)
- [ ] Subscription submitted for review
- [ ] RevenueCat synced with product

### Google Play Store (Android)
- [ ] Subscription created
- [ ] Product ID: `pro_monthly`
- [ ] Base price: $7.99 USD
- [ ] Regional overrides for emerging markets
- [ ] Subscription activated
- [ ] RevenueCat synced with product

---

## 6. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "No price ID configured" error | Set `STRIPE_PRICE_PRO_PREMIUM` and `STRIPE_PRICE_PRO_EMERGING` environment variables |
| Wrong tier detected | Verify country code is in `shared/regionalPricing.ts` |
| Checkout fails | Check Stripe Dashboard for error logs |
| RevenueCat not syncing | Refresh products in RevenueCat Dashboard |
| App Store pricing not updating | Allow 24-48 hours for propagation |

### Testing Commands

```bash
# Test pricing tier endpoint
curl http://localhost:5000/api/pricing/tier

# Test with specific country
curl -H "cf-ipcountry: ET" http://localhost:5000/api/pricing/tier
curl -H "cf-ipcountry: US" http://localhost:5000/api/pricing/tier

# Test regional checkout (requires authentication)
curl -X POST http://localhost:5000/api/stripe/regional-checkout \
  -H "Content-Type: application/json" \
  -d '{"referralCode": "TEST123"}'
```

---

## 7. Code Reference

### Adding New Countries

To add a country to either tier, edit `shared/regionalPricing.ts`:

```typescript
// Premium countries (developed markets)
export const PREMIUM_COUNTRIES = new Set([
  'US', 'CA', 'GB', 'DE', 'FR', ...
  'NEW_COUNTRY_CODE',  // Add here for premium
]);

// Emerging countries (developing markets)
export const EMERGING_COUNTRIES = new Set([
  'ET', 'KE', 'NG', 'GH', ...
  'NEW_COUNTRY_CODE',  // Add here for emerging
]);
```

### Country Code Reference

Use ISO 3166-1 alpha-2 codes. Examples:
- Ethiopia: `ET`
- Kenya: `KE`
- United States: `US`
- United Kingdom: `GB`

Full list: [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)

---

## 8. Security Notes

### Card Country Detection

The system uses **card-issuing country** (from Stripe), not IP geolocation. This ensures:
- Tourists visiting emerging markets pay premium pricing
- Users can't spoof location to get lower prices
- Pricing is determined by their bank/card, not VPN

### Server-Side Enforcement

The `/api/stripe/regional-checkout` endpoint:
- **Ignores** any client-provided tier
- **Derives** tier from card country on server
- **Defaults** to premium if no card is on file (guest checkout)

---

## 9. Maintenance

### When to Update This Document

Update this document when:
- Pricing tiers change
- Countries are added/removed from tiers
- New platforms are added
- API endpoints change
- Environment variables change

### Related Documents

- `docs/Regional_Pricing_Ambassador_Strategy_v2.md` — Business strategy and commission calculations
- `shared/regionalPricing.ts` — Source of truth for country mappings
- `replit.md` — Project overview with regional pricing feature summary

---

*Document Version: 1.0*  
*Last Updated: January 2026*
