# 💳 Payments

Everything related to billing: subscriptions, regional pricing, and future credit-based options.

&nbsp;

---

&nbsp;

## 🎯 Current Model

| Platform | Provider | Type |
|----------|----------|------|
| **Web** | Stripe | Subscription |
| **iOS** | RevenueCat + App Store | Subscription |
| **Android** | RevenueCat + Play Store | Subscription |

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

See **shared/schema.ts → FEATURE_LIMITS** for free tier values.

Pro users bypass all limits in **server/usageService.ts**.

&nbsp;

---

&nbsp;

## 🌍 Regional Pricing

Two-tier pricing based on user's location:

| Market | Price | Countries |
|--------|-------|-----------|
| **Premium** | $7.99/month | US, Canada, EU, UK, Australia, etc. |
| **Emerging** | $1.99/month | Africa, South Asia, Latin America, etc. |

&nbsp;

### How It Works

1. Device locale detected via browser language
2. Server determines pricing tier
3. Correct Stripe/RevenueCat price shown

&nbsp;

### Configuration

- **Country lists**: shared/regionalPricing.ts
- **Stripe prices**: STRIPE_PRICE_PRO_PREMIUM, STRIPE_PRICE_PRO_EMERGING
- **RevenueCat**: Two offerings with targeting rules

&nbsp;

---

&nbsp;

## 🌐 Web Payments (Stripe)

&nbsp;

### Flow

1. User clicks "Upgrade to Pro"
2. Frontend calls /api/stripe/regional-checkout
3. Server creates Stripe Checkout session with correct price
4. User completes payment on Stripe
5. Webhook updates user to Pro

&nbsp;

### Key Files

| File | Purpose |
|------|---------|
| server/stripeWebhook.ts | Handles Stripe webhooks |
| shared/regionalPricing.ts | Regional pricing config |

&nbsp;

### Endpoints

| Endpoint | Purpose |
|----------|---------|
| POST /api/stripe/regional-checkout | Create checkout session |
| POST /api/stripe/customer-portal | Manage subscription |
| POST /api/stripe/webhook | Stripe events |

&nbsp;

---

&nbsp;

## 📱 App Payments (RevenueCat)

&nbsp;

### Setup

RevenueCat handles:

- ✅ Receipt validation
- ✅ Subscription status sync
- ✅ Cross-platform entitlements
- ✅ Analytics

&nbsp;

### Products

| Product ID | Price | Market |
|------------|-------|--------|
| vagabond_bible_pro_monthly | $7.99 | Premium |
| pro_monthly_emerging | $1.99 | Emerging |

&nbsp;

### Regional Targeting (iOS)

RevenueCat Targeting automatically shows correct offering based on App Store country.

&nbsp;

---

&nbsp;

## 🗄️ Database

Subscription status stored in **users** table:

| Column | Type | Purpose |
|--------|------|---------|
| subscriptionStatus | text | 'free', 'pro', etc. |
| subscriptionTier | text | 'premium', 'emerging' |
| stripeCustomerId | text | Stripe customer ID |

&nbsp;

---

&nbsp;

---

&nbsp;

# 🔮 Future: Usage-Based Billing

Plans for adding limits to Pro and overage options.

**Key stat**: 95% of users are on the native app, so credit packs should be priority.

&nbsp;

---

&nbsp;

## 📱 Credit Packs (Recommended for App)

Best for iOS/Android since app stores don't support metered billing.

&nbsp;

### How It Works

1. User hits their monthly limit
2. Modal appears: "Need more? Buy 50 messages for $2.99"
3. User purchases via RevenueCat
4. Credits added to their account
5. Usage deducts from credits after monthly allowance exhausted

&nbsp;

### Suggested Products

| Pack | Credits | Price | Per Credit |
|------|---------|-------|------------|
| Starter | 50 | $2.99 | $0.06 |
| Value | 150 | $6.99 | $0.047 |
| Power User | 500 | $14.99 | $0.03 |

&nbsp;

### Implementation Steps

| Step | Task | Time |
|------|------|------|
| 1 | Create consumable products in App Store Connect | 30 min |
| 2 | Create products in Google Play Console | 30 min |
| 3 | Configure products in RevenueCat | 15 min |
| 4 | Add user_credits table to database | 15 min |
| 5 | Update usage check logic to use credits after limit | 1 hour |
| 6 | Build purchase UI (modal + confirmation) | 1-2 hours |
| 7 | Test purchase flow on both platforms | 1 hour |

**Total estimate: 4-5 hours**

&nbsp;

### Database Changes

New table: **user_credits**

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | Primary key |
| userId | text | User who owns credits |
| credits | integer | Current credit balance |
| purchasedAt | timestamp | Last purchase date |

&nbsp;

---

&nbsp;

## 🌐 Metered Billing (Web Option)

Stripe supports automatic overage charging at end of billing cycle.

&nbsp;

### How It Works

1. User hits their monthly limit
2. Confirmation: "Continue for $0.05 per message?"
3. User confirms → we track overage usage
4. End of month → Stripe automatically charges for overages

&nbsp;

### Suggested Overage Rates

| Feature | Included (Pro) | Overage Rate |
|---------|----------------|--------------|
| 💬 Chat Messages | 100/month | $0.05 each |
| 🔍 Smart Search | 50/month | $0.03 each |
| 💡 Verse Insights | 100/month | $0.02 each |
| 📖 Book Synopsis | 25/month | $0.10 each |

&nbsp;

### Implementation Time

**Total estimate: 4-5 hours**

&nbsp;

---

&nbsp;

## 🔄 Hybrid Approach

| Platform | Billing Method |
|----------|----------------|
| **iOS** | Credit Packs (RevenueCat) |
| **Android** | Credit Packs (RevenueCat) |
| **Web** | Metered Billing (Stripe) |

&nbsp;

---

&nbsp;

## 📊 Recommended Rollout

Given that **95% of users are on the app**:

| Phase | Action |
|-------|--------|
| **Phase 1** | Implement credit packs for iOS/Android |
| **Phase 2** | Add Pro limits (replace unlimited) |
| **Phase 3** | Consider web metered billing if web grows |

&nbsp;

---

&nbsp;

## 🗂️ Files to Modify (Future)

| File | Changes |
|------|---------|
| shared/schema.ts | Add PRO_LIMITS, user_credits table |
| server/usageService.ts | Check credits, deduct credits |
| server/creditRoutes.ts | New - handle credit purchases |
| client/src/components/credit-purchase-modal.tsx | New - purchase UI |

&nbsp;

---

&nbsp;

## ⏰ When to Implement

Consider implementing when:

- Monthly AI costs exceed subscription revenue
- Ready to invest 1-2 days of development time
- User base is large enough to justify complexity
