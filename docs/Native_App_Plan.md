# Vagabond Bible - Native App Development Plan

**Last Updated:** January 8, 2026  
**Status:** In Progress - App Store Connect Setup Next

---

## Current Session Progress

**✅ Phase 1 Complete:** RevenueCat fully configured with:
- iOS & Android apps (API keys stored)
- "Vagabond Bible Pro" entitlement
- 3 subscription tiers: Monthly, Yearly, Lifetime
- Default offering with all packages linked

**🔄 Next Steps (in order):**
1. Phase 2: App Store Connect Setup (iOS) ← **In Progress**
2. Phase 3: Google Play Console Setup (Android)
3. Phase 5: Backend Integration (webhook + sync)

**📋 Approach:** Complete external platform setup first (Apple/Google), then build backend to match exact configurations.

**⏳ Waiting On (Apple - Sequential Process):**
1. Bank account verification (~24 hours processing)
2. Then: W-9 tax form submission (unlocks after banking approved)
3. Then: Paid Apps Agreement becomes Active
4. Then: In-App Purchase capability can be enabled on Bundle ID

**Status:** Holding on Phase 2 until Apple banking verification completes.

---

## Quick Status

| Phase | Status |
|-------|--------|
| RevenueCat Setup | ✅ Complete |
| App Store Connect Setup | 🔄 In Progress (waiting on Apple verification) |
| Google Play Console Setup | ⏳ Pending |
| Backend Integration | ⏳ Pending |
| Build & Test | ⏳ Pending |
| App Store Submission | ⏳ Pending |

---

## Phase 1: RevenueCat Setup

### Step 1.1: Create RevenueCat Project
**Status:** ✅ Completed

1. Go to https://app.revenuecat.com and sign in
2. Click **"+ New Project"** (top left corner)
3. Enter project name: **Vagabond Bible**
4. Click **Create**

- [x] Completed

---

### Step 1.2: Add iOS App to RevenueCat
**Status:** ✅ Completed

1. In your project, click **Project Settings** (gear icon, left sidebar)
2. Click **Apps** tab
3. Click **"+ New App"**
4. Select **App Store** (iOS)
5. Fill in:
   - **App Name:** `Vagabond Bible (App Store)`
   - **Bundle ID:** `com.vagabondbible.app`
6. Click **Save**
7. **Copy the API Key** shown (starts with `appl_`)

**Your iOS API Key:** `appl_IHuuguwDzrFpaSziwpBDtyAdmqg` ✅

- [x] Completed

---

### Step 1.3: Add Android App to RevenueCat
**Status:** ✅ Completed

1. Still in **Project Settings → Apps**
2. Click **"+ New App"**
3. Select **Play Store** (Android)
4. Fill in:
   - **App Name:** `Vagabond Bible (Play Store)`
   - **Package Name:** `com.vagabondbible.app`
5. Click **Save**
6. **Copy the API Key** shown (starts with `goog_`)

**Your Android API Key:** `goog_ZKYPzTyUWBvTPYIVHpgXcllVDzx` ✅

- [x] Completed

---

### Step 1.4: Create "Vagabond Bible Pro" Entitlement
**Status:** ✅ Completed

1. Click **Entitlements** in the left sidebar
2. Click **"+ New"**
3. Enter:
   - **Identifier:** `Vagabond Bible Pro`
   - **Display Name:** `Vagabond Bible Pro`
4. Click **Create**
5. Attach products: Monthly, Yearly, Lifetime

**Entitlement ID:** `entifac67229a1`

- [x] Completed

---

### Step 1.5: Configure Offering & Products
**Status:** ✅ Completed

Products created in RevenueCat (Test Store/sandbox):
- **Monthly** (identifier: `monthly`) → Package: `$rc_monthly`
- **Yearly** (identifier: `yearly`) → Package: `$rc_annual`
- **Lifetime** (identifier: `lifetime`) → Package: `$rc_lifetime`

All products attached to "Vagabond Bible Pro" entitlement ✅
Default offering configured with all 3 packages ✅

- [x] Completed

---

### Step 1.6: Store API Key as Secret
**Status:** ✅ Completed

iOS API key stored as `REVENUECAT_SDK_KEY` environment secret.

*Note: Android will use a separate key when building for Android.*

- [x] Completed

---

## Phase 2: App Store Connect Setup (iOS)

### Step 2.1: Create App in App Store Connect
**Status:** ⏳ Not Started

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **"+"** → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** Vagabond Bible
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** Select `com.vagabondbible.app`
   - **SKU:** `vagabondbible001`
4. Click **Create**

- [ ] Completed

---

### Step 2.2: Enable In-App Purchase Capability
**Status:** ⏳ Not Started

1. Go to https://developer.apple.com/account
2. Click **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → Find `com.vagabondbible.app`
4. Scroll down and check **In-App Purchase**
5. Click **Save**

- [ ] Completed

---

### Step 2.3: Create Subscription Product
**Status:** ⏳ Not Started

1. In App Store Connect, go to your app
2. Click **Subscriptions** (left sidebar, under Monetization)
3. Click **"+"** next to Subscription Groups
4. Create group named: **Vagabond Bible Pro**
5. Click the group, then **"+"** to add subscription
6. Fill in:
   - **Reference Name:** Pro Monthly
   - **Product ID:** `vagabond_bible_pro_monthly`
   - **Duration:** 1 Month
   - **Price:** $9.99 (or your preferred price)
7. Add localization (Display Name, Description)
8. Click **Save**

**Product ID:** `vagabond_bible_pro_monthly`

- [ ] Completed

---

### Step 2.4: Get App-Specific Shared Secret
**Status:** ⏳ Not Started

1. In App Store Connect, go to your app
2. Click **General** → **App Information**
3. Scroll to **App-Specific Shared Secret**
4. Click **Manage** → **Generate**
5. Copy the secret

**Shared Secret:** `________________________`

- [ ] Completed

---

### Step 2.5: Connect RevenueCat to App Store
**Status:** ⏳ Not Started

1. Go to RevenueCat Dashboard
2. Click **Project Settings** → **Apps** → your iOS app
3. Scroll to **App Store Connect API Key** OR **Shared Secret**
4. Paste your shared secret
5. Click **Save**

- [ ] Completed

---

## Phase 3: Google Play Console Setup (Android)

### Step 3.1: Create App in Google Play Console
**Status:** ⏳ Not Started

1. Go to https://play.google.com/console
2. Click **Create app**
3. Fill in:
   - **App name:** Vagabond Bible
   - **Default language:** English (US)
   - **App or game:** App
   - **Free or paid:** Free
4. Accept declarations and click **Create app**

- [ ] Completed

---

### Step 3.2: Create Subscription Product
**Status:** ⏳ Not Started

1. In your app, go to **Monetization** → **Subscriptions**
2. Click **Create subscription**
3. Fill in:
   - **Product ID:** `vagabond_bible_pro_monthly`
   - **Name:** Pro Monthly
   - **Description:** Unlimited access to all Pro features
4. Add base plan:
   - **Billing period:** Monthly
   - **Price:** $9.99
5. Click **Save** then **Activate**

- [ ] Completed

---

### Step 3.3: Create Service Account for RevenueCat
**Status:** ⏳ Not Started

1. Go to https://console.cloud.google.com
2. Select or create a project
3. Go to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Name it: `revenuecat-vagabond-bible`
6. Grant roles:
   - **Pub/Sub Admin**
   - **Monitoring Viewer**
7. Click **Done**
8. Click on the service account → **Keys** tab
9. Click **Add Key** → **Create new key** → **JSON**
10. Download the JSON file

- [ ] Completed

---

### Step 3.4: Grant Service Account Access to Play Console
**Status:** ⏳ Not Started

1. Go to Google Play Console
2. Click **Users and permissions** (left sidebar)
3. Click **Invite new users**
4. Paste service account email (from JSON file)
5. Set permissions:
   - **App permissions:** Select Vagabond Bible
   - Under that app: **Financial data**, **Manage orders and subscriptions**
6. Click **Invite user** → **Send invite**

*Note: Takes up to 24-36 hours to propagate*

- [ ] Completed

---

### Step 3.5: Connect RevenueCat to Google Play
**Status:** ⏳ Not Started

1. Go to RevenueCat Dashboard
2. Click **Project Settings** → **Apps** → your Android app
3. Upload the JSON service account file
4. Click **Save**

- [ ] Completed

---

## Phase 4: Import Products to RevenueCat

### Step 4.1: Import iOS Product
**Status:** ⏳ Not Started

1. In RevenueCat, go to **Products** (left sidebar)
2. Click **"+ New"**
3. Select your iOS app
4. Enter Product ID: `vagabond_bible_pro_monthly`
5. Click **Create**

- [ ] Completed

---

### Step 4.2: Import Android Product
**Status:** ⏳ Not Started

1. Click **"+ New"** again
2. Select your Android app
3. Enter Product ID: `vagabond_bible_pro_monthly`
4. Click **Create**

- [ ] Completed

---

### Step 4.3: Attach Products to "Pro" Entitlement
**Status:** ⏳ Not Started

1. Go to **Entitlements** → click **pro**
2. Click **Attach** under Products
3. Select both products (iOS and Android)
4. Click **Attach**

- [ ] Completed

---

### Step 4.4: Configure Offering
**Status:** ⏳ Not Started

1. Go to **Offerings** → click **default**
2. Click on the default package (or create one)
3. Attach both products to the package
4. Save

- [ ] Completed

---

## Phase 5: Backend Integration

### Step 5.1: Store API Keys as Secrets
**Status:** ⏳ Not Started

Agent will securely store:
- `VITE_REVENUECAT_SDK_KEY` (iOS key for now, will handle per-platform later)
- `REVENUECAT_WEBHOOK_SECRET` (after webhook setup)

- [ ] Completed

---

### Step 5.2: Build RevenueCat Webhook Endpoint
**Status:** ⏳ Not Started

Agent will create `/api/revenuecat/webhook` to:
- Receive purchase events from RevenueCat
- Verify webhook signature
- Update user's Pro status in database

- [ ] Completed

---

### Step 5.3: Update Pro Status Checks
**Status:** ⏳ Not Started

Agent will modify server to check both:
- Stripe subscription status (web users)
- RevenueCat entitlement status (native users)

- [ ] Completed

---

### Step 5.4: Configure Webhook in RevenueCat
**Status:** ⏳ Not Started

1. In RevenueCat, go to **Project Settings** → **Integrations** → **Webhooks**
2. Click **"+ New"**
3. Enter webhook URL: `https://your-app-url.replit.app/api/revenuecat/webhook`
4. Select events: **Initial Purchase**, **Renewal**, **Cancellation**, **Expiration**
5. Copy the **Authorization Header** value
6. Click **Save**

- [ ] Completed

---

## Phase 6: Build & Test

### Step 6.1: Build iOS App Locally
**Status:** ⏳ Not Started

```bash
# From project root
npm run build
npx cap sync ios
npx cap open ios
```

Then in Xcode:
- Select your team for signing
- Build and run on simulator or device

- [ ] Completed

---

### Step 6.2: Build Android App Locally
**Status:** ⏳ Not Started

```bash
# From project root
npm run build
npx cap sync android
npx cap open android
```

Then in Android Studio:
- Build and run on emulator or device

- [ ] Completed

---

### Step 6.3: Test Sandbox Purchases (iOS)
**Status:** ⏳ Not Started

1. Create sandbox tester in App Store Connect:
   - **Users and Access** → **Sandbox** → **Testers**
2. Sign out of real Apple ID on test device
3. When prompted during purchase, use sandbox credentials
4. Test purchase flow

- [ ] Completed

---

### Step 6.4: Test Sandbox Purchases (Android)
**Status:** ⏳ Not Started

1. Add test email to license testers:
   - Play Console → **Setup** → **License testing**
2. Add same email to closed testing track
3. Test purchase flow

- [ ] Completed

---

## Phase 7: App Store Submission

### Step 7.1: Prepare App Store Listing
**Status:** ⏳ Not Started

- Screenshots for all device sizes
- App description
- Keywords
- Privacy policy URL
- Support URL

- [ ] Completed

---

### Step 7.2: Submit iOS for Review
**Status:** ⏳ Not Started

- [ ] Completed

---

### Step 7.3: Submit Android for Review
**Status:** ⏳ Not Started

- [ ] Completed

---

## Completed Implementation (Code)

These are already built and working:

- [x] Capacitor configuration (`capacitor.config.ts`)
- [x] iOS native folder structure (`ios/App/`)
- [x] Android native folder structure (`android/app/`)
- [x] Platform detection context (`client/src/contexts/platform-context.tsx`)
- [x] RevenueCat context with purchase/restore (`client/src/contexts/revenuecat-context.tsx`)
- [x] Native tab bar with dark gradient + gold active states (`client/src/components/native-tab-bar.tsx`)
- [x] Upgrade dialog with native/web separation (`client/src/components/upgrade-dialog.tsx`)
- [x] Profile page with native subscription management (`client/src/pages/profile.tsx`)
- [x] Platform simulation toggle for dev testing (`client/src/components/platform-toggle.tsx`)

---

## Notes & Issues Log

*Record any issues encountered during setup:*

| Date | Issue | Resolution |
|------|-------|------------|
| | | |

---

## API Keys Reference (DO NOT COMMIT)

Store these securely - never commit to git:

| Key | Value | Where Used |
|-----|-------|------------|
| iOS API Key | (stored as secret) | RevenueCat SDK |
| Android API Key | (stored as secret) | RevenueCat SDK |
| Webhook Auth Header | (stored as secret) | Webhook verification |
| App Store Shared Secret | (in RevenueCat) | Receipt validation |
