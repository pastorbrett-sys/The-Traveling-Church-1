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
versionCode 4        // Increment by 1 each release
versionName "1.0.4"  // Update version string
```

---

## Google Sign-In Setup for Release Builds

Google Sign-In uses SHA-1 certificate fingerprints to verify your app. Debug and release builds use **different** signing keys, so you need BOTH SHA-1 fingerprints registered in Firebase.

### Why Google Sign-In Fails in AAB/Internal Testing

- Android Studio debug builds use the **debug keystore** (auto-generated)
- AAB release builds use your **upload keystore** (`vagabond-bible-keystore.jks`)
- If only the debug SHA-1 is in Firebase, release builds can't authenticate

### Step 1: Get Your Release SHA-1

Open PowerShell and run:

```
keytool -list -v -keystore "C:\Users\brett\OneDrive\Desktop\vagabond-bible-keystore.jks" -alias vagabond-bible
```

Enter your keystore password. Copy the **SHA1** fingerprint (looks like `AB:CD:EF:12:34:...`).

### Step 2: Check Play App Signing SHA-1

If you've enrolled in Google Play App Signing:

1. Go to [Google Play Console](https://play.google.com/console)
2. Select **Vagabond Bible** → **Setup** → **App signing**
3. Copy the **SHA-1 certificate fingerprint** under "App signing key certificate"
4. This is the fingerprint that matters for apps installed from the Play Store

### Step 3: Add SHA-1 Fingerprints to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **travelingchurch-1b4ab** project
3. Go to **Project settings** (gear icon)
4. Scroll to **Your apps** → find the **Android app** (com.vagabondbible.app)
5. Click **Add fingerprint**
6. Paste the release/upload SHA-1 fingerprint → **Save**
7. If you have Play App Signing, also add that SHA-1 fingerprint
8. Click **Download google-services.json** to get the updated file
9. Replace `android/app/google-services.json` with the new file

### Current SHA-1 Fingerprints

| Source | SHA-1 | Status |
|--------|-------|--------|
| Debug keystore | `ca:9c:dd:ae:cc:21:47:b2:34:32:e8:d8:87:9d:47:d0:f0:c1:70:3b` | In Firebase |
| Upload keystore | ??? | **NEEDS TO BE ADDED** |
| Play App Signing | ??? | **CHECK AND ADD IF DIFFERENT** |

---

## Troubleshooting

**Gradle sync failed?**
In Android Studio: **File** → **Sync Project with Gradle Files**

**App bundle still too large?**
Run `node scripts/prepare-native-build.js` again

**Google Sign-In fails in release but works in debug?**
Follow the "Google Sign-In Setup for Release Builds" section above. You need to add your release/upload keystore SHA-1 to Firebase.

**Prayer tab or other features missing in AAB but work in Android Studio?**
This means the web assets in the Android project are stale. Make sure you run `npm run build` and `npx cap sync android` before building the AAB. The Quick Deploy script handles this automatically.

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
