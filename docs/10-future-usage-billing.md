# 🔮 Future: Usage-Based Billing

Planning document for implementing overage pricing and credit packs.

&nbsp;

---

&nbsp;

## 🎯 Overview

Currently, Pro users have unlimited access. To ensure business sustainability, we'll need to implement limits with overage options.

**Key stat**: 95% of users are on the native app, so credit packs should be the priority.

&nbsp;

---

&nbsp;

## 📱 Option 1: Credit Packs (Recommended for App)

Best for iOS/Android since app stores don't support metered billing.

&nbsp;

### How It Works

1. User hits their monthly limit
2. Modal appears: "Need more? Buy 50 messages for $2.99"
3. User purchases via RevenueCat
4. Credits added to their account
5. Usage deducts from credits first, then monthly allowance

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
| 4 | Add **user_credits** table to database | 15 min |
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
| expiresAt | timestamp | Optional expiry (null = never) |

&nbsp;

### Code Changes

**usageService.ts** - Update checkUsageLimit:

```
1. Check if user is within monthly limit → allow free
2. If over limit, check if user has credits → deduct credit, allow
3. If no credits → show purchase modal
```

&nbsp;

---

&nbsp;

## 🌐 Option 2: Metered Billing (Web Only)

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

### Implementation Steps

| Step | Task | Time |
|------|------|------|
| 1 | Create metered price in Stripe Dashboard | 15 min |
| 2 | Add reportUsage function to call Stripe API | 1 hour |
| 3 | Update usageService to report overages | 30 min |
| 4 | Add confirmation UI before overage usage | 1 hour |
| 5 | Update pricing page with overage rates | 30 min |
| 6 | Test billing cycle | 1 hour |

**Total estimate: 4-5 hours**

&nbsp;

### Stripe API Call

After each overage use:

```
stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  { quantity: 1, action: 'increment' }
)
```

&nbsp;

---

&nbsp;

## 🔄 Option 3: Hybrid Approach

Different systems for different platforms.

| Platform | Billing Method |
|----------|----------------|
| **iOS** | Credit Packs (RevenueCat) |
| **Android** | Credit Packs (RevenueCat) |
| **Web** | Metered Billing (Stripe) |

&nbsp;

### Pros

- Best user experience per platform
- Web users get seamless overage
- App users get familiar credit system

&nbsp;

### Cons

- Two systems to maintain
- More complex codebase
- Different UX per platform

&nbsp;

---

&nbsp;

## 📊 Recommended Path

Given that **95% of users are on the app**:

1. **Phase 1**: Implement credit packs for iOS/Android
2. **Phase 2**: Add Pro limits (not unlimited)
3. **Phase 3**: Consider web metered billing if web grows

&nbsp;

---

&nbsp;

## 🗂️ Files to Modify

| File | Changes |
|------|---------|
| **shared/schema.ts** | Add PRO_LIMITS, user_credits table |
| **server/usageService.ts** | Check credits, deduct credits |
| **server/creditRoutes.ts** | New - handle credit purchases |
| **client/src/components/credit-purchase-modal.tsx** | New - purchase UI |
| **client/src/hooks/useCredits.ts** | New - credit balance hook |

&nbsp;

---

&nbsp;

## ⏰ When to Implement

Consider implementing when:

- Monthly AI costs exceed subscription revenue
- User complaints about limits increase
- Ready to invest 1-2 days of development time

&nbsp;

---

&nbsp;

## 📝 Notes

- Credits should probably NOT expire (better UX)
- Consider a "low credits" notification
- Track credit purchases for analytics
- RevenueCat handles refunds automatically
