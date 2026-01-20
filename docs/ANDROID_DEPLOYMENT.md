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
