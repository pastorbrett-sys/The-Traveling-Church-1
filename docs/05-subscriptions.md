# 💳 Subscriptions

Stripe for web payments, RevenueCat for iOS/Android in-app purchases.

&nbsp;

---

&nbsp;

## 🎯 Overview

| Platform | Provider |
|----------|----------|
| **Web** | Stripe |
| **iOS** | RevenueCat + App Store |
| **Android** | RevenueCat + Play Store |

&nbsp;

---

&nbsp;

## 💰 Pricing Tiers

| Feature | Free Tier | Pro Tier |
|---------|-----------|----------|
| 💬 Chat Messages | 10/month | ♾️ Unlimited |
| 🔍 Smart Search | 5/month | ♾️ Unlimited |
| 📖 Book Synopsis | 2/month | ♾️ Unlimited |
| 💡 Verse Insights | 6/month | ♾️ Unlimited |
| 📝 Notes | 3 total | ♾️ Unlimited |

> Limits defined in `shared/schema.ts` → `FEATURE_LIMITS`

&nbsp;

---

&nbsp;

## 🌍 Regional Pricing

Two-tier pricing based on user's location:

| Market | Price | Stripe Price ID |
|--------|-------|-----------------|
| **Premium** (US, EU, etc.) | $7.99/month | `STRIPE_PRICE_PRO_PREMIUM` |
| **Emerging** (Africa, Asia, etc.) | $1.99/month | `STRIPE_PRICE_PRO_EMERGING` |

&nbsp;

### How It Works

1. Device locale detected via `navigator.language`
2. Server determines pricing tier
3. Correct Stripe price shown

&nbsp;

See `shared/regionalPricing.ts` for country lists.

&nbsp;

---

&nbsp;

## 🌐 Web (Stripe)

&nbsp;

### Flow

1. User clicks "Upgrade to Pro"
2. Frontend calls `/api/stripe/regional-checkout`
3. Server creates Stripe Checkout session
4. User completes payment on Stripe
5. Webhook updates user to Pro

&nbsp;

### Key Files

| File | Purpose |
|------|---------|
| `server/stripeWebhook.ts` | Handles Stripe webhooks |
| `shared/regionalPricing.ts` | Regional pricing config |

&nbsp;

### Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/stripe/regional-checkout` | Create checkout session |
| `POST /api/stripe/customer-portal` | Manage subscription |
| `POST /api/stripe/webhook` | Stripe events |

&nbsp;

---

&nbsp;

## 📱 iOS & Android (RevenueCat)

&nbsp;

### Setup

RevenueCat handles:

- ✅ Receipt validation
- ✅ Subscription status
- ✅ Cross-platform sync
- ✅ Analytics

&nbsp;

### Products

| Product ID | Price | Market |
|------------|-------|--------|
| `vagabond_bible_pro_monthly` | $7.99 | Premium |
| `pro_monthly_emerging` | $1.99 | Emerging |

&nbsp;

### Regional Targeting (iOS)

RevenueCat Targeting automatically shows correct offering based on App Store country.

&nbsp;

---

&nbsp;

## 🗄️ Database

Subscription status stored in `users` table:

| Column | Type | Purpose |
|--------|------|---------|
| `subscriptionStatus` | text | 'free', 'pro', etc. |
| `subscriptionTier` | text | 'premium', 'emerging' |
| `stripeCustomerId` | text | Stripe customer ID |
