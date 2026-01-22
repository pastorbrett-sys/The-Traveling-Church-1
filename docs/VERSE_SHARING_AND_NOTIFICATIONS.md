# 📤 Share Verse Images & 📲 Weekly Notifications

> Turn every verse into shareable content that grows your user base

---

## 🎯 The Big Picture

**Goal:** Make it easy for users to share beautiful verse images, and remind them weekly with an inspiring verse that funnels them right to the share feature.

**Why this matters:**
- Every shared image = free marketing with your branding
- Weekly notifications keep users coming back
- Together they create a viral loop: reminder → share → new user → repeat

---

## 👆 User Flow: Share a Verse

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. User taps a verse                                          │
│     ↓                                                          │
│  2. Action bar appears (Insights, Notes, Share, etc.)          │
│     ↓                                                          │
│  3. User taps Share (↑) icon                                   │
│     ↓                                                          │
│  4. "Choose Image" sheet slides up                             │
│     • Pre-made verse cards (2-3 artist-created options)        │
│     • Background gallery (10-15 beautiful images)              │
│     ↓                                                          │
│  5. User taps a background                                     │
│     ↓                                                          │
│  6. Preview appears with verse overlaid + "Vagabond Bible"     │
│     ↓                                                          │
│  7. User taps "Share"                                          │
│     ↓                                                          │
│  8. Native share sheet opens (WhatsApp, Messages, Instagram)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📲 User Flow: Weekly Notification

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. Sunday morning: notification arrives                       │
│     "✨ Verse of the Week: 'For I know the plans...'"          │
│     ↓                                                          │
│  2. User taps notification                                     │
│     ↓                                                          │
│  3. App opens directly to that verse                           │
│     ↓                                                          │
│  4. Verse highlights with animation                            │
│     ↓                                                          │
│  5. Action bar opens automatically                             │
│     ↓                                                          │
│  6. Share icon is right there, ready to tap                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 The Viral Loop

```
         ┌──────────────────────┐
         │  Weekly Notification │
         │  arrives on phone    │
         └──────────┬───────────┘
                    ↓
         ┌──────────────────────┐
         │  User opens app to   │
         │  verse + action bar  │
         └──────────┬───────────┘
                    ↓
         ┌──────────────────────┐
         │  Taps Share, picks   │
         │  beautiful background│
         └──────────┬───────────┘
                    ↓
         ┌──────────────────────┐
         │  Shares to WhatsApp  │
         │  or Instagram        │
         └──────────┬───────────┘
                    ↓
         ┌──────────────────────┐
         │  Friend sees image   │
         │  with "Vagabond      │
         │  Bible" branding     │
         └──────────┬───────────┘
                    ↓
         ┌──────────────────────┐
         │  Friend downloads    │
         │  the app             │
         └──────────┬───────────┘
                    ↓
         ┌──────────────────────┐
         │  Original user gets  │
         │  ambassador credit   │
         └──────────────────────┘
                    ↓
              (Repeat weekly)
```

---

## 🖼️ What the Share Image Looks Like

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│     [Beautiful background image]        │
│                                         │
│                                         │
│        "FOR I KNOW THE PLANS           │
│         I HAVE FOR YOU,"                │
│         DECLARES THE LORD,              │
│        "PLANS TO PROSPER YOU            │
│         AND NOT TO HARM YOU,            │
│         PLANS TO GIVE YOU               │
│         HOPE AND A FUTURE."             │
│                                         │
│              JEREMIAH 29:11             │
│                                         │
│                                         │
│                        Vagabond Bible   │
│                                         │
└─────────────────────────────────────────┘
```

**Key elements:**
- Beautiful, curated background (nature, landscapes, abstract)
- Verse text in elegant typography
- Reference below the verse
- Subtle "Vagabond Bible" watermark in corner

---

## ⚙️ Settings & Preferences

Users can control notifications in their profile:

```
┌─────────────────────────────────────────┐
│  Notifications                          │
├─────────────────────────────────────────┤
│                                         │
│  Verse of the Week              [ON]    │
│  Receive weekly inspiring verses        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📅 Implementation Phases

### Phase 1: Share Verse Images ⭐ (Build First)
- Replace Copy icon with Share (↑) icon in action bar
- Create image picker sheet with background gallery
- Generate verse image with text overlay
- Add Vagabond Bible watermark
- Native share sheet integration
- Include "Copy Text" option in share flow

### Phase 2: Push Notifications
- Firebase Cloud Messaging setup
- Device token registration
- Notification opt-in/out in settings
- Deep linking to specific verses
- Highlight animation + auto-open action bar

### Phase 3: Automated Weekly Verse
- AI-powered verse selection (hope, encouragement, strength themes)
- Weekly scheduled job (Sundays)
- Admin test endpoint for debugging

### Phase 4: Enhancements (Future)
- More background images
- Font/style customization
- AI-generated custom backgrounds
- Analytics on shares and opens

---

## 💰 Costs

| Feature | Cost |
|---------|------|
| Share Images | Free (local image generation) |
| Push Notifications (FCM) | Free forever |
| AI Verse Selection | ~$0.01/week (one OpenAI call) |
| Background Images | Free (curated stock or our own) |

---

## ⏱️ Time Estimates

| Phase | Estimate |
|-------|----------|
| Phase 1: Share Images | 2-3 days |
| Phase 2: Push Notifications | 2-3 days |
| Phase 3: Automated Verse | 1 day |
| **Total** | **5-7 days** |

---

---

# 🔧 Technical Implementation

> Everything below is for building the feature. Skip if you just wanted the overview!

---

## 📁 File Structure

```
client/src/
├── components/
│   ├── verse-share-sheet.tsx      # Image picker + preview sheet
│   └── share-image-generator.tsx  # Canvas-based image generation
├── assets/
│   └── share-backgrounds/         # Curated background images
│       ├── landscape-sunset.jpg
│       ├── ocean-waves.jpg
│       ├── mountain-mist.jpg
│       └── ... (10-15 images)

server/
├── notificationRoutes.ts          # Push notification endpoints
├── fcm.ts                         # Firebase Cloud Messaging service
├── verseSelection.ts              # AI verse picker
└── jobs/
    └── weeklyVerse.ts             # Cron job for weekly notifications
```

---

## 💾 Database Schema

```typescript
// push_tokens table
export const pushTokens = pgTable("push_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  deviceToken: text("device_token").notNull().unique(),
  platform: text("platform").notNull(), // 'ios' | 'android'
  optedOut: boolean("opted_out").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// notification_log table (for debugging)
export const notificationLog = pgTable("notification_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(), // 'verse_of_week' | 'test'
  verseReference: text("verse_reference"),
  sentAt: timestamp("sent_at").defaultNow(),
  recipientCount: integer("recipient_count"),
  status: text("status"), // 'sent' | 'failed'
});
```

---

## 🖼️ Share Image Generation

Using HTML5 Canvas to generate the shareable image:

```typescript
async function generateVerseImage(
  verseText: string,
  reference: string,
  backgroundUrl: string
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;  // Instagram-friendly square
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  
  // Draw background
  const bg = await loadImage(backgroundUrl);
  ctx.drawImage(bg, 0, 0, 1080, 1080);
  
  // Add dark overlay for text readability
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, 1080, 1080);
  
  // Draw verse text (centered, wrapped)
  ctx.fillStyle = 'white';
  ctx.font = '600 48px Georgia';
  ctx.textAlign = 'center';
  wrapText(ctx, verseText.toUpperCase(), 540, 400, 900, 60);
  
  // Draw reference
  ctx.font = '400 36px Georgia';
  ctx.fillText(reference.toUpperCase(), 540, 750);
  
  // Draw watermark
  ctx.font = '300 24px -apple-system';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.textAlign = 'right';
  ctx.fillText('Vagabond Bible', 1050, 1050);
  
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.9);
  });
}
```

---

## 📱 Native Share Integration

Using Capacitor's Share API:

```typescript
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

async function shareVerseImage(imageBlob: Blob, verseRef: string) {
  // Save to temp file
  const base64 = await blobToBase64(imageBlob);
  const fileName = `verse-${Date.now()}.jpg`;
  
  await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Cache,
  });
  
  const fileUri = await Filesystem.getUri({
    path: fileName,
    directory: Directory.Cache,
  });
  
  // Open native share sheet
  await Share.share({
    title: verseRef,
    text: `${verseRef} - Vagabond Bible`,
    url: fileUri.uri,
    dialogTitle: 'Share Verse',
  });
}
```

---

## 🔔 Push Notification Payload

```json
{
  "notification": {
    "title": "✨ Verse of the Week",
    "body": "For I know the plans I have for you... - Jeremiah 29:11"
  },
  "data": {
    "type": "verse_of_week",
    "book": "Jeremiah",
    "bookId": 24,
    "chapter": 29,
    "verse": 11,
    "showActionMenu": true,
    "triggerHighlight": true
  }
}
```

---

## 🔌 API Endpoints

### Push Notification Endpoints

```
POST /api/notifications/register-token
Body: { deviceToken: string, platform: 'ios' | 'android' }

POST /api/notifications/opt-out

POST /api/notifications/opt-in

GET /api/notifications/status
Response: { optedOut: boolean }

POST /api/admin/send-test-notification (Admin only)
```

---

## 🍎 Apple Developer Setup Checklist

- [ ] Enable "Push Notifications" capability in App ID
- [ ] Create APNs Key (.p8 file)
- [ ] Note Key ID and Team ID
- [ ] Add Push Notifications entitlement in Xcode

---

## 🔥 Firebase Setup Checklist

- [ ] Create/use Firebase project
- [ ] Add iOS app (download GoogleService-Info.plist)
- [ ] Add Android app (download google-services.json)
- [ ] Upload APNs Key to Firebase Cloud Messaging settings
- [ ] Generate service account JSON for server

---

## 🤖 AI Verse Selection

```typescript
const VERSE_THEMES = [
  'Hope & Promise',
  'Encouragement & Strength',
  'Love & Acceptance',
  'Guidance in Tough Times',
  'Motivation & Purpose',
  'Peace & Comfort',
];

async function selectVerseOfTheWeek(): Promise<VerseSelection> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'system',
      content: `Select an uplifting Bible verse for a weekly notification.
      
      Pick from these themes (rotate through them): ${VERSE_THEMES.join(', ')}
      
      Return JSON: {
        book: string,
        chapter: number,
        verse: number,
        text: string,
        theme: string,
        notificationText: string (max 100 chars for preview)
      }`
    }],
    response_format: { type: 'json_object' },
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

---

## 🧪 Testing

### Share Images
1. Tap any verse → Tap Share icon
2. Verify sheet slides up with background options
3. Select background → Verify preview with verse text
4. Tap Share → Verify native share sheet opens
5. Share to Messages → Verify image looks correct

### Push Notifications
1. Call `/api/admin/send-test-notification`
2. Verify notification appears on device
3. Tap notification → Verify app opens to correct verse
4. Verify highlight animation plays
5. Verify action bar opens automatically

### Weekly Cron
1. Temporarily set cron to "every 2 minutes"
2. Verify notification arrives
3. Reset to weekly schedule

---

## 📚 Dependencies to Install

```bash
# Capacitor plugins
npm install @capacitor/share @capacitor/filesystem @capacitor/push-notifications

# Firebase Admin SDK (server)
npm install firebase-admin

# Sync native projects
npx cap sync
```

---

## 🔐 Environment Variables

```bash
# Firebase (server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
```
