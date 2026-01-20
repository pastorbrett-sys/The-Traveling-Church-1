# Android Deployment Guide

Step-by-step instructions to build and deploy the Vagabond Bible Android app.

---

## Prerequisites

- Android Studio installed
- Project cloned to your local machine
- Google Play Console access

---

## Step 1: Pull Latest Code

Open PowerShell and navigate to the project:

```powershell
cd "C:\Users\brett\OneDrive\Desktop\The-Traveling-Church-1"
```

Pull the latest changes:

```powershell
git pull origin main
```

---

## Step 2: Install Dependencies

```powershell
npm install
```

---

## Step 3: Build the Web App

```powershell
npm run build
```

---

## Step 4: Sync to Android

```powershell
npx cap sync android
```

---

## Step 5: Remove Extra Videos (Reduce App Size)

Run the cleanup script to remove videos not needed for the native app:

```powershell
.\scripts\prepare-android-build.ps1
```

This keeps only the Moses video (~24MB) and removes the mission videos (~116MB) that are only used on the website.

---

## Step 6: Open Android Studio

```powershell
npx cap open android
```

Wait for Android Studio to fully load and sync Gradle.

---

## Step 7: Update Version Number

Before each release, update the version in `android/app/build.gradle`:

1. Open `android/app/build.gradle`
2. Find `versionCode` and `versionName`
3. Increment both:

```gradle
versionCode 2        // Increment by 1 each release
versionName "1.1"    // Update version string
```

---

## Step 8: Build Signed App Bundle

1. In Android Studio menu: **Build** → **Generate Signed App Bundle / APK...**
2. Select **Android App Bundle** → Click **Next**
3. Choose your keystore:
   - Path: `C:\Users\brett\OneDrive\Desktop\vagabond-bible-keystore.jks`
   - Enter your keystore password
   - Key alias: `vagabond-bible`
   - Enter your key password
4. Click **Next**
5. Select **release** → Click **Create**
6. Wait for build to complete (2-3 minutes)

The AAB file will be at:
```
android\app\release\app-release.aab
```

---

## Step 9: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select **Vagabond Bible**
3. Go to **Testing** → **Internal testing** (or Production when ready)
4. Click **Create new release**
5. Upload `app-release.aab`
6. Add release notes
7. Click **Review release** → **Start rollout**

---

## Quick Reference Commands

All commands in order for copy-paste:

```powershell
cd "C:\Users\brett\OneDrive\Desktop\The-Traveling-Church-1"
git pull origin main
npm install
npm run build
npx cap sync android
.\scripts\prepare-android-build.ps1
npx cap open android
```

---

## Troubleshooting

### App bundle too large (over 200MB)
Run the cleanup script again:
```powershell
.\scripts\prepare-android-build.ps1
```

### Gradle sync failed
In Android Studio: **File** → **Sync Project with Gradle Files**

### Keystore password forgotten
The keystore cannot be recovered. You would need to create a new app listing.

---

## Important Files

| File | Purpose |
|------|---------|
| `android/app/build.gradle` | Version numbers, build config |
| `vagabond-bible-keystore.jks` | Signing key (keep safe!) |
| `scripts/prepare-android-build.ps1` | Removes extra videos |
| `capacitor.config.ts` | Capacitor configuration |
