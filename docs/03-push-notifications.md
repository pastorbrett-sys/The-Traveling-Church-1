# 🔔 Push Notifications

Timezone-aware push notifications for weekly verse reminders with rich images and deep linking.

&nbsp;

---

&nbsp;

## 🎯 Overview

| Feature | Details |
|---------|---------|
| **Service** | Firebase Cloud Messaging (FCM) |
| **Delivery** | Timezone-aware (8am local time) |
| **Rich Images** | Custom notification images |
| **Deep Linking** | Opens directly to verse with highlight |

&nbsp;

---

&nbsp;

## 📅 Verse of the Week

The flagship notification type:

- 📆 **Delivery**: Tuesday at 8am (user's local time)
- 🎨 **Image**: Custom branded notification image
- 🔗 **Action**: Tapping opens verse with highlight animation
- 📖 **Translation**: World English Bible (public domain)

&nbsp;

---

&nbsp;

## ⚙️ How It Works

&nbsp;

### 1. Cron Job

`server/notificationCron.ts`

- Runs every hour
- Checks which timezones are at 8am
- Queries users in those timezones
- Sends notifications

&nbsp;

### 2. AI Verse Selection

`server/verseSelection.ts`

- GPT-4o selects thematic verses
- 8 rotating themes each week
- Ensures variety and relevance

&nbsp;

### 3. Firebase Delivery

`server/firebaseAdmin.ts`

- Builds notification payload
- Includes image URL for rich notifications
- Sends via FCM

&nbsp;

---

&nbsp;

## 📂 Key Files

| File | Purpose |
|------|---------|
| `server/firebaseAdmin.ts` | Firebase Admin SDK + notification sending |
| `server/notificationCron.ts` | Hourly cron job logic |
| `server/verseSelection.ts` | AI-powered verse selection |
| `server/notificationRoutes.ts` | Admin API endpoints |
| `client/src/hooks/usePushNotifications.ts` | Frontend token registration |

&nbsp;

---

&nbsp;

## 🗄️ Database Tables

&nbsp;

### `push_tokens`

Stores device tokens with timezone info.

| Column | Type | Purpose |
|--------|------|---------|
| `userId` | text | User identifier |
| `deviceToken` | text | FCM token |
| `platform` | text | 'ios' or 'android' |
| `timezone` | text | e.g., "America/New_York" |
| `utcOffset` | integer | Hours from UTC |

&nbsp;

### `notification_types`

Configurable notification types.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | text | e.g., 'verse_of_week' |
| `name` | text | Display name |
| `sendDay` | integer | 0-6 (0=Sunday) |
| `sendHour` | integer | 0-23 (local time) |
| `isActive` | boolean | Enable/disable |

&nbsp;

### `user_notification_preferences`

Per-user opt-in/out settings.

&nbsp;

### `notification_log`

Analytics and debugging.

&nbsp;

---

&nbsp;

## 🍎 iOS Rich Images Setup

To display images in iOS notifications, you need a **Notification Service Extension**.

&nbsp;

### Steps:

1. Open Xcode: `ios/App/App.xcworkspace`

2. File → New → Target → "Notification Service Extension"

3. Name it: `NotificationService`

4. Replace `NotificationService.swift` with code that downloads the image

5. Build and run

&nbsp;

See full code in the iOS Setup documentation.

&nbsp;

---

&nbsp;

## 🔥 Firebase Configuration

| Setting | Value |
|---------|-------|
| **APNs Key ID** | S48F6S762Z |
| **Team ID** | FBD94PWXT2 |
| **Environment** | Sandbox & Production |
| **Service Account** | `FIREBASE_SERVICE_ACCOUNT_KEY` secret |

&nbsp;

---

&nbsp;

## 🧪 Testing

Send a test notification:

```bash
curl -X POST "https://vagabondbible.com/api/notifications/admin/test-verse" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID_HERE"}'
```
