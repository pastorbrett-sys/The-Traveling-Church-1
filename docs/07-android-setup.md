# 🤖 Android Setup

Guide to setting up and maintaining the Android app via Capacitor.

&nbsp;

---

&nbsp;

## 🎯 Overview

| Technology | Version |
|------------|---------|
| **Capacitor** | 6.x |
| **Android Target** | API 33+ |
| **Android Studio** | Latest |

&nbsp;

---

&nbsp;

## 📁 Project Location

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/.../MainActivity.java
│   │   ├── res/                    # Resources (icons, etc.)
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
└── settings.gradle
```

&nbsp;

---

&nbsp;

## 🚀 Building the App

&nbsp;

### 1. Sync Web Assets

```bash
npx cap sync android
```

&nbsp;

### 2. Open in Android Studio

```bash
npx cap open android
```

&nbsp;

### 3. Build & Run

- Select device/emulator
- Press ▶️ (Run button)

&nbsp;

---

&nbsp;

## 📐 Safe Area Handling

Android WebView has a known bug where `env(safe-area-inset-*)` CSS variables don't work properly (Chromium <140).

&nbsp;

### Solution

Uses `@capacitor-community/safe-area` plugin.

&nbsp;

### MainActivity.java

Edge-to-edge mode enabled:

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    EdgeToEdge.enable(this);
    super.onCreate(savedInstanceState);
}
```

&nbsp;

---

&nbsp;

## 🔥 Firebase Setup

&nbsp;

### google-services.json

1. Download from Firebase Console
2. Place in `android/app/`

&nbsp;

### build.gradle (app level)

Already configured with:

```gradle
apply plugin: 'com.google.gms.google-services'
```

&nbsp;

---

&nbsp;

## 📱 App Icon

Located at: `android/app/src/main/res/`

Folders:

- `mipmap-mdpi/` (48x48)
- `mipmap-hdpi/` (72x72)
- `mipmap-xhdpi/` (96x96)
- `mipmap-xxhdpi/` (144x144)
- `mipmap-xxxhdpi/` (192x192)

&nbsp;

---

&nbsp;

## ⚠️ Common Issues

&nbsp;

### Gradle Sync Failed

- File → Sync Project with Gradle Files
- Or: `./gradlew clean` in android folder

&nbsp;

### Build Errors

```bash
cd android && ./gradlew clean build
```

&nbsp;

### CORS Issues

Native apps use `https://vagabondbible.com` as the API base URL, not localhost.
