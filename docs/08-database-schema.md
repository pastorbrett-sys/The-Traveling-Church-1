# 🗄️ Database Schema

PostgreSQL tables managed with Drizzle ORM.

&nbsp;

---

&nbsp;

## 🎯 Overview

| Database | PostgreSQL (Neon serverless) |
|----------|------------------------------|
| **ORM** | Drizzle |
| **Schema Location** | `shared/schema.ts` |
| **Migrations** | `npm run db:push` |

&nbsp;

---

&nbsp;

## 👤 Users

### `users`

Authentication and subscription data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | varchar | Primary key (from auth provider) |
| `email` | text | User's email |
| `name` | text | Display name |
| `profileImageUrl` | text | Avatar URL |
| `language` | text | Preferred language |
| `subscriptionStatus` | text | 'free', 'pro' |
| `subscriptionTier` | text | 'premium', 'emerging' |
| `stripeCustomerId` | text | Stripe customer ID |
| `createdAt` | timestamp | Account creation |

&nbsp;

---

&nbsp;

## 📍 Content

### `locations`

Ministry travel locations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | varchar | Primary key |
| `name` | text | Location name |
| `country` | text | Country |
| `imageUrl` | text | Photo URL |
| `description` | text | Description |
| `displayOrder` | text | Sort order |

&nbsp;

### `events`

Ministry events calendar.

| Column | Type | Description |
|--------|------|-------------|
| `id` | varchar | Primary key |
| `title` | text | Event title |
| `description` | text | Event description |
| `date` | timestamp | Event date/time |
| `location` | text | Event location |
| `type` | text | Event type |

&nbsp;

### `blog_posts`

Blog/news articles.

&nbsp;

### `testimonials`

User testimonials.

&nbsp;

### `contact_submissions`

Contact form submissions.

&nbsp;

---

&nbsp;

## 📝 Bible Study

### `notes`

User notes on Bible verses.

| Column | Type | Description |
|--------|------|-------------|
| `id` | varchar | Primary key |
| `userId` | text | Note owner |
| `verseRef` | text | e.g., "Genesis 1:1" |
| `verseText` | text | The verse content |
| `content` | text | User's note |
| `tags` | text[] | Array of tags |
| `bookId` | integer | Bible book ID |
| `chapter` | integer | Chapter number |
| `verse` | integer | Verse number |

&nbsp;

### `feature_usage`

Tracks free tier usage limits.

| Column | Type | Description |
|--------|------|-------------|
| `userId` | text | User |
| `feature` | text | 'chat_message', 'smart_search', etc. |
| `periodStart` | timestamp | First of month |
| `count` | integer | Usage count |

&nbsp;

---

&nbsp;

## 🔔 Push Notifications

### `push_tokens`

Device tokens for push notifications.

| Column | Type | Description |
|--------|------|-------------|
| `userId` | text | User |
| `deviceToken` | text | FCM token |
| `platform` | text | 'ios' or 'android' |
| `timezone` | text | e.g., "America/New_York" |
| `utcOffset` | integer | Hours from UTC |

&nbsp;

### `notification_types`

Configurable notification types.

| Column | Type | Description |
|--------|------|-------------|
| `id` | text | e.g., 'verse_of_week' |
| `name` | text | Display name |
| `sendDay` | integer | 0-6 (0=Sunday) |
| `sendHour` | integer | 0-23 (local time) |
| `isActive` | boolean | Enabled/disabled |

&nbsp;

### `user_notification_preferences`

Per-user notification settings.

&nbsp;

### `notification_log`

Notification delivery history.

&nbsp;

---

&nbsp;

## 🎖️ Ambassador Program

### `ambassadors`

Ambassador profiles.

| Column | Type | Description |
|--------|------|-------------|
| `userId` | text | Links to auth user |
| `email` | text | Ambassador email |
| `name` | text | Display name |
| `referralCode` | text | User signup code |
| `inviteCode` | text | Ambassador recruit code |
| `status` | text | 'pending', 'active', 'paused' |

&nbsp;

### `referral_clicks`

Tracks referral link clicks.

&nbsp;

### `referral_signups`

Tracks signups from referrals.

&nbsp;

---

&nbsp;

## 🛠️ Migrations

### Push Schema Changes

```bash
npm run db:push
```

### Force Push (if needed)

```bash
npm run db:push --force
```

> ⚠️ Never manually change primary key types!
