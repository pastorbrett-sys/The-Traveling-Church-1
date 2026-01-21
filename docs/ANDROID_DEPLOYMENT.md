# Android Deployment Guide

Step-by-step instructions to build and deploy the Vagabond Bible Android app.

---

## Prerequisites

- Android Studio installed
- Node.js installed
- Project cloned to your local machine
- Google Play Console access

---

## Quick Deploy (Copy-Paste This Entire Block)

Open PowerShell, paste this entire block, and press Enter:

```
cd "C:\Users\brett\OneDrive\Desktop\The-Traveling-Church-1"
git stash
git pull origin main
npm install
npm run build
npx cap sync android
node scripts/prepare-native-build.js
npx cap open android
```

Android Studio will open. Now build your signed app bundle.

---

## Build Signed App Bundle

1. Open Android Studio
2. If prompted, click **Sync Now** for Gradle
3. Menu: **Build** → **Generate Signed App Bundle / APK...**
4. Select **Android App Bundle** → **Next**
5. Keystore path: `C:\Users\brett\OneDrive\Desktop\vagabond-bible-keystore.jks`
6. Enter your passwords
7. Key alias: `vagabond-bible`
8. Click **Next** → Select **release** → **Create**

The AAB file will be at: `android\app\release\app-release.aab`

---

## Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select **Vagabond Bible**
3. Go to **Testing** → **Internal testing**
4. Click **Create new release**
5. Upload `app-release.aab`
6. Add release notes
7. Click **Review release** → **Start rollout**

---

## Before Each New Release

Update version in `android/app/build.gradle`:

```gradle
versionCode 2        // Increment by 1 each release
versionName "1.1"    // Update version string
```

---

## Troubleshooting

**Gradle sync failed?**
In Android Studio: **File** → **Sync Project with Gradle Files**

**App bundle still too large?**
Run `node scripts/prepare-native-build.js` again

---

## Testing Subscriptions

After uploading to Internal Testing, test the subscription flow:

### Step 1: Add License Testers

1. Go to Play Console → **Setup** → **License testing**
2. Add tester emails (Google accounts)
3. Set License response: "RESPOND_NORMALLY"

### Step 2: Share Test Link

1. Go to **Testing** → **Internal testing** → **Testers** tab
2. Copy the **"Join on the web"** link
3. Share with testers - they must accept the invite first

### Step 3: Test Purchase Flow

1. Testers install app from Internal Testing track
2. Open app → Navigate to upgrade/subscription screen
3. Complete purchase with Google's test payment method (no real charges)
4. Verify Pro features unlock

### Verify in RevenueCat

1. Go to RevenueCat Dashboard → Customers
2. Search for tester's app user ID
3. Confirm "Vagabond Bible Pro" entitlement is active

---

## Related Documentation

- `docs/REGIONAL_PRICING_SETUP.md` — Complete regional pricing setup (Web, iOS, Android)
- `docs/Regional_Pricing_Ambassador_Strategy_v2.md` — Business strategy and ambassador program
