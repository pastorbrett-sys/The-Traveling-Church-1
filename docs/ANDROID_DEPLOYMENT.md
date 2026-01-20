# Android Deployment Guide

Step-by-step instructions to build and deploy the Vagabond Bible Android app.

---

## Prerequisites

- Android Studio installed
- Node.js installed
- Project cloned to your local machine
- Google Play Console access

---

## Build Steps

### Step 1: Open Terminal in Project Folder

Open PowerShell or Terminal, then navigate to the project:

```
cd "C:\Users\brett\OneDrive\Desktop\The-Traveling-Church-1"
```

---

### Step 2: Pull Latest Code

```
git pull origin main
```

---

### Step 3: Install Dependencies

```
npm install
```

---

### Step 4: Build and Sync

```
npm run build
npx cap sync android
```

---

### Step 5: Remove Extra Videos

This removes TC website videos (keeps only the Moses video for the app):

```
node scripts/prepare-native-build.js
```

You should see output showing which videos were removed and how much space was saved.

---

### Step 6: Update Version Number

Open `android/app/build.gradle` and update:

```gradle
versionCode 2        // Increment by 1 each release
versionName "1.1"    // Update version string
```

---

### Step 7: Build in Android Studio

1. Open Android Studio
2. Menu: **Build** → **Generate Signed App Bundle / APK...**
3. Select **Android App Bundle** → **Next**
4. Select keystore: `C:\Users\brett\OneDrive\Desktop\vagabond-bible-keystore.jks`
5. Enter passwords, select **release** → **Create**

The AAB file will be at: `android/app/release/app-release.aab`

---

### Step 8: Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select **Vagabond Bible**
3. Go to **Testing** → **Internal testing**
4. Click **Create new release**
5. Upload `app-release.aab`
6. Add release notes → **Review** → **Start rollout**

---

## Quick Copy-Paste Commands

Run these in order:

```
cd "C:\Users\brett\OneDrive\Desktop\The-Traveling-Church-1"
git pull origin main
npm install
npm run build
npx cap sync android
node scripts/prepare-native-build.js
```

Then open Android Studio and build.

---

## Troubleshooting

**App bundle too large?**  
Run `node scripts/prepare-native-build.js` again.

**Script not found?**  
Run `git pull origin main` to get the latest files.

**Gradle sync failed?**  
In Android Studio: **File** → **Sync Project with Gradle Files**
