# Native Regional Pricing Setup Guide (iOS & Android)

This guide documents the two-tier regional pricing ($7.99 Premium / $1.99 Emerging) setup for iOS and Android via RevenueCat.

---

## Overview

| Platform | Pricing Strategy | How It Works |
|----------|-----------------|--------------|
| iOS | Two separate products | RevenueCat Targeting shows correct offering by App Store country |
| Android | Single product with regional pricing | Google Play handles regional pricing directly |
| Web | Stripe with device locale detection | Server selects correct Stripe price ID |

---

## Current iOS Configuration (COMPLETED)

### App Store Connect Products

We use **two separate iOS subscription products** because Apple doesn't easily support per-country pricing tiers on a single product:

| Product ID | Price | Target Markets |
|------------|-------|----------------|
| `vagabond_bible_pro_monthly` | $7.99 | Premium markets (US, UK, EU, Australia, etc.) |
| `pro_monthly_emerging` | $1.99 | Emerging markets (Ethiopia, India, Kenya, etc.) |

Both products are in the same subscription group "Vagabond Bible Pro".

### RevenueCat Configuration (COMPLETED)

#### Products
Both iOS products are registered in RevenueCat:
- `vagabond_bible_pro_monthly` → Vagabond Bible (App Store)
- `pro_monthly_emerging` → Vagabond Bible (App Store)

#### Entitlement
Both products are attached to the same entitlement:
- **Entitlement ID**: `Vagabond Bible Pro`
- Purchasing either product unlocks Pro features

#### Offerings
Two offerings are configured:
- **default**: Contains `vagabond_bible_pro_monthly` ($7.99)
- **emerging**: Contains `pro_monthly_emerging` ($1.99)

#### Targeting Rule: "Emerging Markets Pricing"
A targeting rule automatically shows the correct offering based on the user's App Store country:

**Rule Configuration:**
- **Name**: Emerging Markets Pricing
- **Condition**: Country is any of [46 emerging market countries]
- **Then show**: `emerging` offering
- **Default**: Users not matching any rule see `default` offering

**Countries in Emerging Markets Targeting (46 total):**

| Region | Countries |
|--------|-----------|
| Africa | Ethiopia, Kenya, Nigeria, Ghana, Tanzania, Uganda, Rwanda, South Africa, Morocco, Egypt, Tunisia |
| South Asia | India, Bangladesh, Pakistan, Sri Lanka, Nepal |
| Southeast Asia | Philippines, Indonesia, Myanmar, Cambodia, Thailand, Malaysia, Vietnam, Laos |
| Latin America | Brazil, Mexico, Argentina, Chile, Colombia, Peru, Ecuador, Bolivia, Paraguay, Guatemala, Honduras, El Salvador, Nicaragua |
| Eastern Europe | Poland, Czech Republic, Hungary, Romania, Greece, Portugal, Ukraine, Moldova, Georgia, Armenia |
| Central Asia | Uzbekistan, Kazakhstan |

---

## How It Works

### User in Emerging Market (e.g., Ethiopia)
1. User opens the app on their iPhone
2. RevenueCat detects their App Store country is Ethiopia
3. Targeting rule matches → RevenueCat returns `emerging` offering
4. App shows $1.99 price via `offerings.current`
5. User purchases → `pro_monthly_emerging` product
6. RevenueCat grants "Vagabond Bible Pro" entitlement

### User in Premium Market (e.g., USA)
1. User opens the app on their iPhone
2. RevenueCat detects their App Store country is USA
3. No targeting rules match → RevenueCat returns `default` offering
4. App shows $7.99 price via `offerings.current`
5. User purchases → `vagabond_bible_pro_monthly` product
6. RevenueCat grants "Vagabond Bible Pro" entitlement

### Tourist Scenario (US Tourist in Ethiopia)
1. US tourist has iPhone set up with US App Store account
2. RevenueCat detects App Store country is USA (not their physical location)
3. They see $7.99 pricing → correct premium pricing
4. Ethiopian ambassador can confidently refer tourists knowing they'll see the right price

---

## App Code (No Changes Needed)

The app code already handles this correctly:

```typescript
// client/src/contexts/revenuecat-context.tsx
const offerings = await Purchases.getOfferings();

// offerings.current is automatically set by RevenueCat based on targeting
const packageToPurchase = offerings.current.availablePackages[0];

// Price string shows correct localized price
const price = packageToPurchase.product.priceString;
```

The key is `offerings.current` - RevenueCat sets this automatically based on the targeting rules configured in the dashboard.

---

## Android Setup (TODO)

Android uses a simpler approach - single product with Google Play's built-in regional pricing:

### Step 1: Create Subscription in Play Console
1. Product ID: `pro_monthly`
2. Base price: $7.99 USD

### Step 2: Set Regional Price Overrides
1. In the subscription pricing, click "Edit prices"
2. Override emerging market countries to ~$1.99 equivalent

### Step 3: Add to RevenueCat
1. Add Android product: `pro_monthly:monthly`
2. Attach to "Vagabond Bible Pro" entitlement
3. Add to `default` offering

Google Play automatically shows the correct regional price - no targeting needed.

---

## Verification Checklist

### App Store Connect (iOS) ✅
- [x] Subscription group "Vagabond Bible Pro" created
- [x] Product `vagabond_bible_pro_monthly` at $7.99
- [x] Product `pro_monthly_emerging` at $1.99
- [x] Both products have localization and review screenshots
- [ ] Subscriptions submitted with app version for review

### RevenueCat ✅
- [x] Both iOS products added
- [x] Both products attached to "Vagabond Bible Pro" entitlement
- [x] `default` offering with $7.99 product
- [x] `emerging` offering with $1.99 product
- [x] "Emerging Markets Pricing" targeting rule with 46 countries
- [x] Default offering set to `default`

### Google Play Console (Android)
- [ ] Subscription created with product ID `pro_monthly`
- [ ] Base price set to $7.99 USD
- [ ] Regional price overrides for emerging markets (~$1.99)
- [ ] Subscription activated
- [ ] Added to RevenueCat

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Could not check" status in RevenueCat | Normal before app/subscription is approved - will resolve after App Review |
| Wrong offering shown | Check RevenueCat Targeting rules, verify country is in the list |
| User sees wrong price | App Store country may differ from physical location (this is correct behavior) |
| Both products not unlocking Pro | Verify both products are attached to the same entitlement |
| Targeting not working | Ensure targeting rule is set to "Live" status |

---

## Managing Targeting Rules

To add or remove countries from emerging markets pricing:

1. Go to RevenueCat Dashboard → Targeting
2. Click on "Emerging Markets Pricing" rule
3. Edit the country list
4. Save changes

Changes take effect immediately - no app update required.

---

## Related Documentation

- `docs/REGIONAL_PRICING_SETUP.md` — Complete setup guide including Stripe (web)
- `docs/Regional_Pricing_Ambassador_Strategy_v2.md` — Business strategy for ambassadors
- `shared/regionalPricing.ts` — Source of truth for country-to-tier mappings

---

*Last Updated: January 2026*
