# Native Regional Pricing Setup Guide (iOS & Android)

This guide walks through setting up two-tier regional pricing ($7.99 Premium / $1.99 Emerging) for iOS and Android via RevenueCat.

---

## Overview

| Platform | Where Pricing is Configured | How RevenueCat Gets It |
|----------|----------------------------|------------------------|
| iOS | App Store Connect | Reads from Apple's pricing |
| Android | Google Play Console | Reads from Google's pricing |

RevenueCat automatically displays the localized price to users based on their App Store/Play Store region.

---

## Step 1: iOS Setup (App Store Connect)

### 1.1 Create the Subscription Product

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app → **Monetization** → **Subscriptions**
3. Create a **Subscription Group** (e.g., "Vagabond Bible Pro")
4. Add a subscription:
   - **Reference Name**: Pro Monthly
   - **Product ID**: `pro_monthly` (save this - you'll need it for RevenueCat)
   - **Duration**: 1 Month

### 1.2 Set Base Pricing

1. In the subscription, go to **Subscription Prices**
2. Click **Add Subscription Price**
3. Set base price: **$7.99 USD** (this becomes Premium tier)
4. Apple auto-generates equivalent prices for all countries

### 1.3 Set Emerging Market Pricing

1. After setting base price, click **Add Subscription Price** again
2. Select **Choose specific territories**
3. Select emerging markets:
   - Ethiopia
   - India
   - Kenya
   - Nigeria
   - Ghana
   - Uganda
   - Tanzania
   - Bangladesh
   - Pakistan
   - Philippines
   - Indonesia
   - Egypt
   - South Africa
   - Brazil
   - Mexico
   - Colombia
   - Peru
   - Vietnam
   - Thailand
   - Ukraine
   
4. Set price: **$1.99 USD equivalent** (Apple will show you local currency options)
5. Save

### 1.4 Verify Your Prices

Check that you have:
- [ ] $7.99 for USA, UK, Canada, Australia, Germany, France, etc.
- [ ] $1.99 equivalent for Ethiopia, India, Kenya, etc.

---

## Step 2: Android Setup (Google Play Console)

### 2.1 Create the Subscription Product

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app → **Monetize** → **Products** → **Subscriptions**
3. Click **Create subscription**
4. Fill in:
   - **Product ID**: `pro_monthly` (use same ID as iOS for simplicity)
   - **Name**: Pro Monthly
   - **Description**: Unlimited access to all Pro features

### 2.2 Create a Base Plan

1. In your subscription, click **Add base plan**
2. Configure:
   - **Base plan ID**: `monthly`
   - **Renewal type**: Auto-renewing
   - **Billing period**: 1 Month

### 2.3 Set Pricing

1. In the base plan, go to **Prices**
2. Set default price: **$7.99 USD**
3. Click **Edit prices by country**
4. Find and update emerging markets to **$1.99 USD equivalent**:
   - Ethiopia, India, Kenya, Nigeria, Ghana, Uganda, Tanzania
   - Bangladesh, Pakistan, Philippines, Indonesia, Egypt
   - South Africa, Brazil, Mexico, Colombia, Peru
   - Vietnam, Thailand, Ukraine

5. Save all changes
6. **Activate** the base plan

---

## Step 3: RevenueCat Configuration

### 3.1 Add Your Products

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Select your project → **Products**
3. Click **+ New** for each platform:

**For iOS:**
- App: [Your iOS App]
- Product Identifier: `pro_monthly`

**For Android:**
- App: [Your Android App]  
- Product Identifier: `pro_monthly:monthly` (format: `subscription_id:base_plan_id`)

### 3.2 Create an Entitlement

1. Go to **Entitlements** → **+ New**
2. Create:
   - **Identifier**: `pro`
   - **Description**: Pro subscription access
3. Attach both products (iOS and Android) to this entitlement

### 3.3 Create an Offering

1. Go to **Offerings** → **+ New**
2. Create:
   - **Identifier**: `default`
   - **Description**: Default offering
3. Add a **Package**:
   - **Identifier**: `monthly` or `$rc_monthly`
   - Attach your iOS and Android products
4. Make this the **Current Offering**

### 3.4 Verify in RevenueCat

Check that:
- [ ] Both products show as "Available" 
- [ ] Entitlement is linked to both products
- [ ] Offering is set as current

---

## Step 4: Test the Integration

### 4.1 Sandbox Testing (iOS)

1. In App Store Connect, create a **Sandbox Tester** account
2. On your test device, sign out of App Store
3. Open your app and attempt purchase
4. Sign in with sandbox account when prompted
5. Verify correct price displays

### 4.2 Test Purchases (Android)

1. In Play Console, add your email to **License testers**
2. Set up a **closed testing track** with your app
3. Install from Play Store (not direct APK)
4. Attempt purchase - should show test mode

### 4.3 Verify in RevenueCat

1. After test purchase, check RevenueCat dashboard
2. Go to **Customers** → find your test user
3. Verify the entitlement was granted

---

## Step 5: Your App Code (Already Done!)

Your app already has RevenueCat integrated:

```typescript
// In upgrade-dialog.tsx - fetches offerings
const { Purchases } = await import('@revenuecat/purchases-capacitor');
const offerings = await Purchases.getOfferings();
const price = offerings.current?.monthly?.product?.priceString;
```

The `priceString` automatically shows the correct localized price based on the user's store region.

---

## Checklist

### App Store Connect (iOS)
- [ ] Subscription group created
- [ ] Product ID: `pro_monthly`
- [ ] Base price: $7.99 USD
- [ ] Emerging market prices: $1.99 equivalent
- [ ] Subscription submitted for review (if new app)

### Google Play Console (Android)
- [ ] Subscription created
- [ ] Product ID: `pro_monthly`
- [ ] Base plan: `monthly`
- [ ] Default price: $7.99 USD
- [ ] Emerging market prices: $1.99 equivalent
- [ ] Base plan activated

### RevenueCat
- [ ] iOS product added
- [ ] Android product added
- [ ] Entitlement `pro` created and linked
- [ ] Offering `default` created and set as current
- [ ] Both products show "Available"

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Product shows "Not Available" | Wait 15-30 min for store sync, or check product ID matches exactly |
| Wrong price displaying | Verify store region matches test account, clear app cache |
| Purchase fails silently | Check RevenueCat API key is correct for environment |
| Entitlement not granted | Verify product is linked to entitlement in RevenueCat |

---

## Support Links

- [RevenueCat iOS Setup Guide](https://www.revenuecat.com/docs/getting-started/installation/ios)
- [RevenueCat Android Setup Guide](https://www.revenuecat.com/docs/getting-started/installation/android)
- [App Store Connect Subscriptions](https://developer.apple.com/help/app-store-connect/manage-subscriptions/create-a-subscription)
- [Google Play Subscriptions](https://support.google.com/googleplay/android-developer/answer/140504)
