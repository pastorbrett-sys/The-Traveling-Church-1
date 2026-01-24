# 🖼️ Verse Sharing

Canvas-based image generation for sharing Bible verses on social media.

&nbsp;

---

&nbsp;

## 🎯 Overview

| Feature | Details |
|---------|---------|
| **Backgrounds** | 21 custom options |
| **Generation** | Canvas-based (client-side) |
| **Sharing** | Native Share API |
| **Branding** | Vagabond Bible watermark |

&nbsp;

---

&nbsp;

## ⚙️ How It Works

&nbsp;

### 1. User Selects Verse

User taps share icon on any verse in the Bible reader.

&nbsp;

### 2. Background Selection

21 beautiful background images to choose from:

- 🌅 Nature scenes
- 🎨 Abstract gradients
- ✨ Textured backgrounds

&nbsp;

### 3. Canvas Generation

`client/src/components/verse-share-sheet.tsx`

- Creates HTML5 canvas
- Draws selected background
- Renders verse text with styling
- Adds verse reference
- Adds Vagabond Bible branding

&nbsp;

### 4. Native Sharing

Uses Web Share API / Capacitor Share plugin:

- iOS: Native share sheet
- Android: Native share sheet
- Web: Download or copy

&nbsp;

---

&nbsp;

## 📂 Key Files

| File | Purpose |
|------|---------|
| `client/src/components/verse-share-sheet.tsx` | Main share UI + canvas logic |
| `client/public/share-backgrounds/` | Background images (21 options) |

&nbsp;

---

&nbsp;

## 🎨 Image Specifications

| Property | Value |
|----------|-------|
| **Dimensions** | 1080 x 1920 (9:16 portrait) |
| **Format** | PNG |
| **Text** | Auto-sized to fit |
| **Reference** | Displayed below verse |
| **Branding** | "Vagabond Bible" at bottom |

&nbsp;

---

&nbsp;

## 📱 Platform Behavior

&nbsp;

### iOS

Native share sheet with options:

- Messages
- Instagram Stories
- Save to Photos
- More...

&nbsp;

### Android

Native share sheet with installed apps.

&nbsp;

### Web

- Share API (if supported)
- Fallback: Download image
