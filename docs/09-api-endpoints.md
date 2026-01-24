# 🔌 API Endpoints

All endpoints are prefixed with `/api/`.

&nbsp;

---

&nbsp;

## 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/user` | Get current user |
| POST | `/api/auth/logout` | Log out |

&nbsp;

---

&nbsp;

## 🙏 Pastor Brett (AI Chat)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message (streaming SSE) |
| GET | `/api/conversations` | Get user's conversations |
| DELETE | `/api/conversations/:id` | Delete conversation |

&nbsp;

---

&nbsp;

## 📖 Bible

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bible/books` | List all books |
| GET | `/api/bible/book/:id` | Get book details |
| GET | `/api/bible/chapter/:bookId/:chapter` | Get chapter verses |
| POST | `/api/bible/smart-search` | AI-powered search |
| POST | `/api/bible/verse-insight` | AI verse commentary |
| POST | `/api/bible/book-synopsis` | AI book summary |

&nbsp;

---

&nbsp;

## 📝 Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get user's notes |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

&nbsp;

---

&nbsp;

## 💳 Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pricing/tier` | Get user's pricing tier |
| POST | `/api/stripe/regional-checkout` | Create Stripe checkout |
| POST | `/api/stripe/customer-portal` | Subscription management |
| POST | `/api/stripe/webhook` | Stripe webhook handler |
| GET | `/api/subscription/status` | Get subscription status |

&nbsp;

---

&nbsp;

## 🔔 Push Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/register` | Register device token |
| GET | `/api/notifications/preferences` | Get user preferences |
| PUT | `/api/notifications/preferences` | Update preferences |
| GET | `/api/notifications/types` | List notification types |

&nbsp;

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/admin/test-verse` | Send test notification |
| POST | `/api/notifications/admin/trigger-cron` | Manually trigger cron |

&nbsp;

---

&nbsp;

## 📍 Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations` | Get ministry locations |
| GET | `/api/events` | Get upcoming events |
| GET | `/api/testimonials` | Get testimonials |
| POST | `/api/contact` | Submit contact form |

&nbsp;

---

&nbsp;

## 🎖️ Ambassador Program

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ambassador/apply` | Apply to be ambassador |
| GET | `/api/ambassador/profile` | Get ambassador profile |
| GET | `/api/ambassador/stats` | Get referral stats |
| POST | `/api/ambassador/track-click` | Track referral click |

&nbsp;

---

&nbsp;

## 📊 Response Format

All endpoints return JSON:

```json
{
  "success": true,
  "data": { ... }
}
```

Or on error:

```json
{
  "error": "Error message",
  "message": "User-friendly message"
}
```

&nbsp;

---

&nbsp;

## 🔒 Authentication

Most endpoints require authentication via session cookie.

Native apps include credentials:

```javascript
fetch(url, {
  credentials: 'include'
})
```
