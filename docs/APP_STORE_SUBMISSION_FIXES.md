# App Store Submission Fixes - Complete Checklist

**Date:** January 31, 2026  
**App:** Vagabond Bible (com.vagabondbible.app)

This document contains ALL required fixes for the two Apple App Store rejections. Follow each section exactly as described.

---

## ISSUE #1: Guideline 3.1.2 - Subscription Information Missing

### Problem
Apple rejected because the app doesn't include all required subscription information in the app metadata and within the app itself.

### Required Fixes

#### PART A: App Store Connect Metadata (Do in App Store Connect)

1. **Privacy Policy Link** ✅ REQUIRED
   - Location: App Store Connect → Your App → App Information → Privacy Policy URL
   - Must be a working, functional link
   - Example: `https://vagabondbible.com/privacy-policy`

2. **Terms of Use (EULA) Link** ✅ REQUIRED - Two options:

   **Option 1: Use Apple's Standard EULA (Recommended - Easiest)**
   - Add this text to your App Description field in App Store Connect:
   ```
   Terms of Use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
   ```
   
   **Option 2: Custom EULA**
   - Location: App Store Connect → Your App → App Information → License Agreement → Edit
   - Select "Apply a custom EULA to all chosen countries or regions"
   - Paste your custom terms
   - Select all countries/regions
   - Click Done, then Save

#### PART B: In-App Subscription Display (Must show BEFORE user purchases)

Your app's subscription purchase screen MUST clearly display ALL of these:

| Required Item | Example | Where to Show |
|---------------|---------|---------------|
| **Subscription Title** | "Vagabond Bible Pro" | Purchase screen |
| **Subscription Length** | "Monthly" or "1 Month" | Purchase screen |
| **Subscription Price** | "$7.99/month" or "$1.99/month" | Purchase screen |
| **Price Per Unit** (if applicable) | Already included in price | Purchase screen |
| **Privacy Policy Link** | Tappable link | Purchase screen footer |
| **Terms of Use Link** | Tappable link | Purchase screen footer |

#### PART C: Required Text for Subscription Screen

Add this text (or similar) to your subscription purchase screen in the app:

```
Vagabond Bible Pro - Monthly Subscription

$7.99/month (Premium Markets) or $1.99/month (Emerging Markets)

• Payment will be charged to your Apple ID account at confirmation of purchase
• Subscription automatically renews unless canceled at least 24 hours before the end of the current period
• Your account will be charged for renewal within 24 hours prior to the end of the current period
• You can manage and cancel your subscriptions by going to your App Store account settings after purchase
• Any unused portion of a free trial period will be forfeited when you purchase a subscription

Privacy Policy: [link]
Terms of Use: [link]
```

---

## ISSUE #2: Guideline 2.1 - In-App Purchases Not Submitted

### Problem
The app references a Pro subscription but the in-app purchase products were NOT submitted for review along with the app.

### Required Fixes

#### STEP 1: Verify In-App Purchases Exist in App Store Connect

1. Go to App Store Connect → Your App → Monetization → Subscriptions
2. Verify these subscription products exist:
   - `vagabond_bible_pro_monthly` (Premium - $7.99)
   - `pro_monthly_emerging` (Emerging - $1.99)
3. If they don't exist, create them

#### STEP 2: Complete ALL Required In-App Purchase Metadata

For EACH subscription product, verify ALL these fields are filled:

| Field | Description | Required? |
|-------|-------------|-----------|
| **Reference Name** | Internal name (not shown to users) | ✅ Yes |
| **Product ID** | e.g., `vagabond_bible_pro_monthly` | ✅ Yes |
| **Subscription Group** | Group these subscriptions belong to | ✅ Yes |
| **Subscription Duration** | 1 Month | ✅ Yes |
| **Price** | Select price tier | ✅ Yes |
| **Display Name** | "Vagabond Bible Pro" (shown to users, max 30 chars) | ✅ Yes |
| **Description** | Description (max 45 chars) | ✅ Yes |
| **App Review Screenshot** | Screenshot showing the subscription in action | ✅ **CRITICAL** |
| **Review Notes** | Any notes for Apple reviewer | Optional |

#### STEP 3: Upload App Review Screenshot (CRITICAL!)

**This is the most commonly missed item!**

1. Go to each subscription product in App Store Connect
2. Scroll to "App Review Information"
3. Upload a screenshot that shows:
   - The subscription purchase screen
   - The subscription name, price, and duration visible
   - Must meet screenshot specifications (any supported size)

**Screenshot Requirements:**
- JPG or PNG format
- Any of these sizes work:
  - 1290 x 2796 pixels (iPhone 15 Pro Max)
  - 1179 x 2556 pixels (iPhone 15 Pro)
  - 1242 x 2688 pixels (iPhone 11 Pro Max)
  - 1284 x 2778 pixels (iPhone 12 Pro Max)
- Shows the subscription clearly in your app

#### STEP 4: Set Subscription Status to "Ready to Submit"

1. Go to each subscription product
2. Check the Status column
3. Must show "Ready to Submit" (green)
4. If it shows "Missing Metadata" (red), complete the missing fields

#### STEP 5: Submit Subscriptions WITH Your App Version

**IMPORTANT: First-time submissions must include subscriptions with a new app version!**

1. Go to App Store Connect → Your App → Your App Version (e.g., 1.0.0)
2. Scroll down to "In-App Purchases and Subscriptions" section
3. Click "Select In-App Purchases or Subscriptions" or "Edit"
4. In the dialog, check the boxes next to BOTH subscription products:
   - ☑️ vagabond_bible_pro_monthly
   - ☑️ pro_monthly_emerging
5. Click "Done"
6. Now submit for review - both subscriptions will be included

---

## COMPLETE SUBMISSION CHECKLIST

### Before Submitting - Verify ALL Items

#### App Store Connect - App Information
- [ ] Privacy Policy URL is filled and working
- [ ] Terms of Use link is in App Description OR Custom EULA is configured
- [ ] App Description mentions subscription terms

#### App Store Connect - Subscriptions (for EACH product)
- [ ] Reference Name filled
- [ ] Product ID set
- [ ] Subscription Duration set
- [ ] Price/Price Tier set
- [ ] Display Name filled (max 30 chars)
- [ ] Description filled (max 45 chars)
- [ ] **App Review Screenshot uploaded** ⚠️
- [ ] Status shows "Ready to Submit"
- [ ] Subscription is available in correct countries/regions

#### App Store Connect - App Version
- [ ] Subscriptions are ATTACHED to the app version being submitted
- [ ] New binary (build) is uploaded

#### In the App Itself (Code Changes) - ✅ ALREADY DONE!
Your upgrade-dialog.tsx already includes ALL required disclosures:
- [x] Subscription title: "Upgrade to Pro" / "Vagabond Bible Pro"
- [x] Subscription length: "/month" shown on button
- [x] Subscription price: Dynamic price from RevenueCat
- [x] Privacy Policy link: Tappable link included
- [x] Terms of Use link: Tappable link included
- [x] Apple-required disclosures in "About Your Subscription" section:
  - [x] "Payment charged to Apple ID at purchase"
  - [x] "Auto-renews unless canceled 24+ hours before period ends"
  - [x] "Account charged for renewal within 24 hours of period end"
  - [x] "Manage subscriptions in App Store Settings"

**NO CODE CHANGES NEEDED** - Focus on App Store Connect configuration!

---

## App Store Connect Step-by-Step Walkthrough

### Adding Terms of Use to App Description

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "Apps"
3. Select "Vagabond Bible"
4. Click on your app version in the left sidebar
5. Scroll to "Description"
6. Add at the END of your description:
   ```
   
   Terms of Use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
   Privacy Policy: https://vagabondbible.com/privacy-policy
   ```
7. Click "Save" in the top right

### Uploading App Review Screenshot for Subscription

1. In App Store Connect, click "Monetization" → "Subscriptions"
2. Click on your subscription group
3. Click on the subscription (e.g., "vagabond_bible_pro_monthly")
4. Scroll down to "App Review Information"
5. Click the "+" or drag a screenshot image
6. Upload a screenshot of your subscription purchase screen
7. Click "Save"

### Attaching Subscriptions to App Version

1. In App Store Connect, click on your app version (e.g., "1.0.0")
2. Scroll down to "In-App Purchases and Subscriptions"
3. Click "Select In-App Purchases or Subscriptions"
4. Check the boxes for ALL your subscriptions
5. Click "Done"
6. Submit for review

---

## Resources & References

- [Apple Standard EULA](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/)
- [Custom License Agreement Help](https://developer.apple.com/help/app-store-connect/manage-app-information/provide-a-custom-license-agreement)
- [In-App Purchase Information](https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-information)
- [Submit In-App Purchase](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase)
- [App Review Guidelines 3.1.2](https://developer.apple.com/app-store/review/guidelines/#3.1.2)
- [Subscription Guidelines](https://developer.apple.com/app-store/subscriptions/)

---

## Quick Summary

| Issue | Fix Location | Action Required |
|-------|--------------|-----------------|
| Missing EULA/Terms | App Store Connect → App Description | Add Apple EULA link |
| Missing Privacy Policy | App Store Connect → App Information | Add Privacy Policy URL |
| Subscriptions not submitted | App Store Connect → App Version | Attach subscriptions to version |
| Missing IAP screenshot | App Store Connect → Subscriptions | Upload screenshot for EACH product |
| Missing subscription info in app | App Code | Add required text to purchase screen |
