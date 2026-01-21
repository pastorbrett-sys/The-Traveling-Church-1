# Regional Pricing Setup Guide

**Vagabond Bible — Complete Two-Tier Pricing Configuration (Web + iOS + Android)**

---

## Overview

This document provides the complete setup for two-tier regional pricing across all platforms.

| Platform | Pricing Method | Status |
|----------|---------------|--------|
| **Web (Stripe)** | Device locale detection → correct Stripe price ID | ✅ Complete |
| **iOS (App Store)** | Two separate products + RevenueCat Targeting | ✅ Complete |
| **Android (Play Store)** | Single product with country-specific pricing | ✅ Complete |

---

## Pricing Tiers

| Tier | Monthly Price | Target Markets |
|------|---------------|----------------|
| **Premium** | $7.99 | USA, UK, EU, Japan, Australia, etc. |
| **Emerging** | $1.99 | Ethiopia, India, Kenya, Brazil, etc. |

---

## Why Device Locale (Not IP Geolocation)

**The Tourist Problem:**
A US tourist in Ethiopia using IP geolocation would incorrectly see $1.99 instead of $7.99.

| Detection Method | US Tourist in Ethiopia | Ethiopian Local |
|------------------|------------------------|-----------------|
| ❌ IP Geolocation | $1.99 (wrong) | $1.99 ✓ |
| ✅ Device Locale | $7.99 (correct) | $1.99 ✓ |
| ✅ App Store Account | $7.99 (correct) | $1.99 ✓ |

Device locale reflects where the phone/browser was set up, not physical location. This ensures ambassadors in Ethiopia can confidently refer tourists knowing they'll pay premium pricing.

---

## Country Lists

### Premium Markets ($7.99)

| Region | Countries (ISO Codes) |
|--------|----------------------|
| North America | US, CA |
| Western Europe | GB, DE, FR, NL, BE, AT, CH, IE |
| Scandinavia | DK, SE, NO, FI |
| Asia-Pacific | JP, KR, SG, AU, NZ |
| Middle East | AE, QA, KW, SA, IL |

### Emerging Markets ($1.99)

| Region | Countries (ISO Codes) |
|--------|----------------------|
| Africa | ET, KE, NG, GH, TZ, UG, RW, ZA, MA, EG, TN |
| South Asia | IN, BD, PK, LK, NP |
| Southeast Asia | PH, ID, MM, KH, TH, MY, VN, LA |
| Latin America | BR, MX, AR, CL, CO, PE, EC, BO, PY, GT, HN, SV, NI |
| Eastern Europe | PL, CZ, HU, RO, GR, PT, UA, MD, GE, AM |
| Central Asia | UZ, KZ |

**Source of truth:** `shared/regionalPricing.ts`

---

# Part 1: Web (Stripe) ✅ COMPLETE

## How It Works

1. Frontend detects device locale via `navigator.language` (e.g., "en-US" → "US")
2. Frontend calls `/api/pricing/tier?deviceCountry=US`
3. Server determines tier based on country code
4. At checkout, server uses correct Stripe price ID

## Stripe Dashboard Setup

### Step 1: Create Price IDs

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → Products
2. Find or create "Pro Plan" product
3. Create two prices:
   - **Premium**: $7.99/month → Copy price ID
   - **Emerging**: $1.99/month → Copy price ID

### Step 2: Set Environment Variables

```bash
STRIPE_PRICE_PRO_PREMIUM=price_xxx  # The $7.99 price ID
STRIPE_PRICE_PRO_EMERGING=price_xxx # The $1.99 price ID
```

### Step 3: Test Endpoints

```bash
# Default (no country) → Premium
curl http://localhost:5000/api/pricing/tier

# Ethiopian device → Emerging
curl "http://localhost:5000/api/pricing/tier?deviceCountry=ET"

# US device → Premium
curl "http://localhost:5000/api/pricing/tier?deviceCountry=US"
```

### Step 4: Test with International Cards

| Country | Test Card Number | Expected Tier |
|---------|------------------|---------------|
| USA | 4242424242424242 | Premium |
| Australia | 4000000360000006 | Premium |
| Brazil | 4000000760000002 | Emerging |
| India | 4000003560000008 | Emerging |

Full list: [Stripe Testing International Cards](https://stripe.com/docs/testing#international-cards)

## Key Files

| File | Purpose |
|------|---------|
| `shared/regionalPricing.ts` | Country-to-tier mapping |
| `server/routes.ts` | `/api/pricing/tier` and `/api/stripe/regional-checkout` endpoints |
| `client/src/components/upgrade-dialog.tsx` | Frontend pricing display |

---

# Part 2: iOS (App Store + RevenueCat) ✅ COMPLETE

## Strategy: Two Separate Products

Apple doesn't support easy per-country pricing on a single subscription, so we use two products:

| Product ID | Price | Target |
|------------|-------|--------|
| `vagabond_bible_pro_monthly` | $7.99 | Premium markets |
| `pro_monthly_emerging` | $1.99 | Emerging markets |

RevenueCat Targeting automatically shows the correct product based on the user's App Store country.

## App Store Connect Setup

### Step 1: Create Subscription Group

1. Go to [App Store Connect](https://appstoreconnect.apple.com/) → Your App → Subscriptions
2. Create subscription group: **"Vagabond Bible Pro"**

### Step 2: Create Premium Product ($7.99)

1. Create subscription in the group:
   - **Reference Name**: Pro Monthly
   - **Product ID**: `vagabond_bible_pro_monthly`
   - **Duration**: 1 Month
2. Set price: **$7.99 USD**
3. Add localization (English US):
   - **Display Name**: Vagabond Bible Pro
   - **Description**: Unlimited access to AI Bible study features and Pastor
4. Upload review screenshot
5. Save

### Step 3: Create Emerging Product ($1.99)

1. Create another subscription in the same group:
   - **Reference Name**: Pro Monthly Emerging
   - **Product ID**: `pro_monthly_emerging`
   - **Duration**: 1 Month
2. Set price: **$1.99 USD**
3. Add localization (English US):
   - **Display Name**: Vagabond Bible Pro
   - **Description**: Unlimited access to AI Bible study features and Pastor
4. Upload review screenshot
5. Save

## RevenueCat Setup

### Step 1: Add Products

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/) → Product Catalog → Products
2. Add both iOS products:
   - `vagabond_bible_pro_monthly`
   - `pro_monthly_emerging`

### Step 2: Create Entitlement

1. Go to Entitlements → Create **"Vagabond Bible Pro"**
2. Attach BOTH products to this entitlement
3. This ensures either purchase unlocks Pro features

### Step 3: Create Offerings

**Default Offering (Premium):**
1. Go to Offerings → Create offering
   - Identifier: `default`
   - Display Name: `Pro Monthly`
2. Add package with `vagabond_bible_pro_monthly` product

**Emerging Offering:**
1. Create another offering
   - Identifier: `emerging`
   - Display Name: `Pro Monthly Emerging`
2. Add package with `pro_monthly_emerging` product

### Step 4: Configure Targeting

1. Go to Targeting → New Rule
2. Configure:
   - **Display Name**: `Emerging Markets Pricing`
   - **Condition**: Country is any of [46 emerging market countries]
   - **Then show**: `emerging` offering
   - **State**: Live
3. Save

**Countries to select (46 total):**
- Africa: Ethiopia, Kenya, Nigeria, Ghana, Tanzania, Uganda, Rwanda, South Africa, Morocco, Egypt, Tunisia
- South Asia: India, Bangladesh, Pakistan, Sri Lanka, Nepal
- Southeast Asia: Philippines, Indonesia, Myanmar, Cambodia, Thailand, Malaysia, Vietnam, Laos
- Latin America: Brazil, Mexico, Argentina, Chile, Colombia, Peru, Ecuador, Bolivia, Paraguay, Guatemala, Honduras, El Salvador, Nicaragua
- Eastern Europe: Poland, Czech Republic, Hungary, Romania, Greece, Portugal, Ukraine, Moldova, Georgia, Armenia
- Central Asia: Uzbekistan, Kazakhstan

### Step 5: Set Default Offering

At the bottom of Targeting page, ensure **"Select default offering"** is set to `default`.

## How It Works

1. User opens app on iPhone
2. RevenueCat SDK initializes and detects App Store country
3. Targeting rule matches (or falls through to default)
4. `offerings.current` returns correct offering
5. App displays price from `offerings.current.availablePackages[0].product.priceString`
6. User purchases → entitlement granted

## App Code (No Changes Needed)

```typescript
// client/src/contexts/revenuecat-context.tsx
const offerings = await Purchases.getOfferings();
const packageToPurchase = offerings.current.availablePackages[0];
const price = packageToPurchase.product.priceString;
```

---

# Part 3: Android (Google Play) ✅ COMPLETE

## Strategy: Single Product with Country-Specific Pricing

Unlike iOS, Google Play supports per-country pricing within a single base plan, making setup simpler - no targeting rules needed.

| Product ID | Base Plan | Premium Markets | Emerging Markets |
|------------|-----------|-----------------|------------------|
| `pro_monthly` | `monthly` | $7.99 USD | ~$1.99 USD equivalent |

## Google Play Console Setup ✅

### Step 1: Create Subscription

1. Go to [Google Play Console](https://play.google.com/console) → Your App → Monetize → Products → Subscriptions
2. Click **Create subscription**
3. Configure:
   - **Product ID**: `pro_monthly`
   - **Name**: Vagabond Bible Pro
   - **Description**: Unlimited access to AI Bible study features

### Step 2: Create Base Plan

1. In your subscription, click **Add base plan**
2. Configure:
   - **Base plan ID**: `monthly`
   - **Renewal type**: Auto-renewing
   - **Billing period**: 1 Month
   - **Grace period**: 3 days

### Step 3: Set Country-Specific Pricing

1. Set **default price**: **$7.99 USD**
2. Click **Edit base plan** → **Price and availability**
3. Use "Select All" then **uncheck** these 33 Premium countries:
   - Australia, Austria, Bahrain, Belgium, Canada, Denmark, Finland, France, Germany
   - Hong Kong, Iceland, Ireland, Israel, Japan, Kuwait, Liechtenstein, Luxembourg
   - Netherlands, New Zealand, Norway, Qatar, Saudi Arabia, Singapore, Slovenia
   - South Korea, Spain, Sweden, Switzerland, Taiwan, Turks and Caicos
   - United Arab Emirates, United Kingdom, United States, Vatican City
4. For remaining countries (emerging markets), set price to **$1.99 USD**
5. Save

### Step 4: Activate

1. Click **Activate** on the base plan
2. The subscription becomes available for purchase

## RevenueCat Setup (Android) ✅

### Step 1: Add Product

1. Go to RevenueCat Dashboard → Product Catalog → Products
2. Click **+ New** in "Vagabond Bible (Play Store)" section
3. Configure:
   - **Display Name**: `Pro Monthly`
   - **Product type**: Subscription
   - **Subscription**: `pro_monthly`
   - **Base plan Id**: `monthly`
   - **Backwards compatible**: Checked

### Step 2: Attach to Entitlement

1. Click on the newly created product
2. In Entitlements section, click **Attach**
3. Select **"Vagabond Bible Pro"**

### Step 3: Add to Offering

1. Go to Product Catalog → Offerings → `default`
2. Click on the **Monthly** package
3. In the dropdown for "Vagabond Bible (Play...)", select **Pro Monthly (pro_monthly:monthly)**
4. Save

**Note:** Android doesn't need separate targeting rules - Google Play automatically shows the correct regional price based on the user's Play Store country.

---

## Testing Android Subscriptions

### Step 1: Add License Testers

1. Go to [Google Play Console](https://play.google.com/console) → **Setup** → **License testing**
2. Add tester email addresses (must be Google accounts)
3. Set **License response** to "RESPOND_NORMALLY"

### Step 2: Share Internal Testing Link

1. Go to **Testing** → **Internal testing**
2. Click **Testers** tab → copy the **Join on the web** link
3. Share link with testers (they must accept the invite)

### Step 3: Install and Test

1. Testers install the app from the Internal Testing track
2. Open app → Go to upgrade screen
3. Tap Subscribe → Complete purchase with test payment method
4. Google provides test cards for free testing (no real charges)

### Step 4: Verify Entitlement

1. After purchase, check RevenueCat Dashboard → Customers
2. Search for tester's user ID
3. Verify "Vagabond Bible Pro" entitlement is active

### Testing Regional Pricing

To verify regional pricing works:
1. Use a Google account with Play Store set to an emerging market country
2. The price displayed should be ~$1.99 equivalent in local currency
3. Premium market accounts should see $7.99

---

# Verification Checklist

## Web (Stripe) ✅
- [x] Premium price ID created ($7.99)
- [x] Emerging price ID created ($1.99)
- [x] `STRIPE_PRICE_PRO_PREMIUM` env var set
- [x] `STRIPE_PRICE_PRO_EMERGING` env var set
- [x] `/api/pricing/tier` endpoint working
- [x] `/api/stripe/regional-checkout` endpoint working
- [ ] Tested with international test cards

## iOS (App Store + RevenueCat) ✅
- [x] Subscription group "Vagabond Bible Pro" created
- [x] Product `vagabond_bible_pro_monthly` at $7.99
- [x] Product `pro_monthly_emerging` at $1.99
- [x] Both products have localization
- [x] Both products have review screenshots
- [x] Both products added to RevenueCat
- [x] Both products attached to "Vagabond Bible Pro" entitlement
- [x] `default` offering with $7.99 product
- [x] `emerging` offering with $1.99 product
- [x] "Emerging Markets Pricing" targeting rule (46 countries)
- [x] Default offering set to `default`
- [ ] Subscriptions submitted with app version
- [ ] Tested with sandbox accounts

## Android (Google Play + RevenueCat) ✅
- [x] Subscription `pro_monthly` created
- [x] Base plan `monthly` created
- [x] Default price $7.99 USD for 33 premium countries
- [x] Regional price $1.99 USD for emerging markets
- [x] Base plan activated
- [x] Product added to RevenueCat: `pro_monthly:monthly`
- [x] Product attached to "Vagabond Bible Pro" entitlement
- [x] Product added to `default` offering (Monthly package)
- [ ] Tested with license testers

---

# Troubleshooting

| Issue | Solution |
|-------|----------|
| "No price ID configured" (Web) | Set `STRIPE_PRICE_PRO_PREMIUM` and `STRIPE_PRICE_PRO_EMERGING` |
| "Could not check" in RevenueCat | Normal before app approval - will resolve after App Review |
| Wrong offering shown (iOS) | Check RevenueCat Targeting rules, verify country is in list |
| User sees wrong price | App Store country may differ from physical location (correct behavior) |
| Both products not unlocking Pro | Verify both attached to same entitlement |
| Targeting not working | Ensure rule is set to "Live" status |
| Android product not syncing | Wait 15-30 min, or verify product ID format is `subscription:baseplan` |

---

# Managing Regional Pricing

## Adding/Removing Countries

### In Code (Web)
Edit `shared/regionalPricing.ts`:
```typescript
export const EMERGING_COUNTRIES = new Set([
  'ET', 'KE', ...
  'NEW_COUNTRY_CODE',  // Add new country here
]);
```

### In RevenueCat (iOS)
1. Go to Targeting → "Emerging Markets Pricing"
2. Edit the country list
3. Save (takes effect immediately)

### In Google Play (Android)
1. Go to subscription → base plan → Prices
2. Edit country pricing
3. Save

---

# Related Documentation

- `docs/Regional_Pricing_Ambassador_Strategy_v2.md` — Business strategy, costs, and ambassador commissions
- `shared/regionalPricing.ts` — Source of truth for country mappings
- `replit.md` — Project overview

---

*Last Updated: January 2026*
