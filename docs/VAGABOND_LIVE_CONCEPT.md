# Vagabond Live - Product Concept Document

> A faith-focused video conferencing platform for Bible studies, designed to integrate seamlessly with the Vagabond Bible ecosystem.

---

## Vision

Vagabond Live transforms online Bible study by natively integrating scripture, AI-powered insights, and community features into a video conferencing experience. Unlike generic platforms like Zoom, every feature is purpose-built for ministry, discipleship, and spreading the Gospel globally.

---

## Host & Participant Roles

### Host
- Full control: start/end session, mute participants, manage breakouts, share Bible passages
- Invite co-hosts, manage permissions
- Access to all teaching tools and analytics

### Co-Host
- Shared controls with host
- Can manage participants and lead portions of study
- Helpful for team-taught sessions or large groups

### Participant
- Join video and audio
- Chat messaging
- React with engagement buttons
- Receive shared Bible content
- Join breakout prayer rooms

---

## Core Features

### 1. Live Video Conferencing
- High-quality video for Bible studies of any size
- Screen sharing for presentations or external content
- Chat messaging during sessions
- Session recording for replay/archive

### 2. Native Vagabond Bible Integration
- Share verses directly in video chat - click a verse and everyone sees it
- Split-screen view: video on one side, shared Bible passage on the other
- Highlight and annotate passages together in real-time
- All highlights/notes sync to participant's Vagabond Bible account

### 3. "Open Your Bible" Moments
- Host triggers navigation command (e.g., "Turn to John 3:16")
- Everyone's Vagabond Bible auto-navigates to that passage
- Synchronized Bible reading experience
- No more "what verse are we on?" confusion
- Visual indicator shows when everyone has arrived at the passage

### 4. AI-Powered Features
- **"Ask the AI" Button** - Get instant context, cross-references, or explanations during study
- **Auto-Generated Summary** - AI creates study notes after each session
- **Related Passages** - AI suggests connected scriptures based on discussion
- **Discussion Questions** - AI generates questions from any passage to spark conversation

### 5. Multi-Language Real-Time Translation
- AI-powered live captions in any language
- Perfect for global ministries reaching across language barriers
- Someone in Ethiopia joins an English study → sees Amharic captions
- Supports the ministry's worldwide reach
- Caption language preference saved per user

### 6. Donation/Giving Integration
- "Support this ministry" button always visible (non-intrusive)
- One-click giving during powerful moments
- Recurring supporter options for regular attendees
- Integrates with Stripe for secure payments
- Hosts receive donations directly to their connected account

### 7. Prayer Circles / Breakout Rooms
- After main study, break into small prayer groups automatically
- Random or leader-assigned pairings
- Private prayer rooms within the session
- Timer option for prayer time
- Host can bring everyone back together with one click
- Participants can raise hand to rejoin main room early

### 8. Events Integration
- Schedule one-time or recurring Bible studies
- Public discovery - people can find and join open studies
- RSVP system with email/push reminders
- Ties into existing Vagabond Events feature
- Calendar sync (Google, Apple, Outlook)

### 9. Live Engagement Reactions
- Floating "Amen" reactions during teaching
- Additional reactions: Pray, Hallelujah, Heart, Raised Hands
- Real-time engagement indicators help host gauge resonance
- Creates interactive worship atmosphere vs passive watching
- Reactions fade naturally, don't obstruct video

### 10. Sermon/Study Templates
- Pre-built study outlines hosts can follow
- Create custom templates to reuse
- Include scripture references, discussion questions, notes
- Export notes to participants after session (PDF/email)
- Share templates with other hosts

### 11. Discovery & Community
- Browse public Bible studies by topic, language, time
- Follow favorite teachers/ministries
- Session recordings available for those who missed it
- Ministry profiles with upcoming schedule
- Recommendation engine suggests studies based on interests

---

## Platform Strategy

### Recommended Architecture

**Phase 1: Web-Only Launch**
- Fastest path to market
- No app store approval delays
- Works on all devices via browser
- Shared backend with Vagabond Bible app
- Same user accounts, synced data

**Phase 2: Native Apps (If Demand Justifies)**
- Dedicated iOS and Android apps
- Optimized video performance
- Push notifications for session reminders
- Background audio for prayer time

### Technical Approach
- **Same Replit project** as Vagabond Bible
- **Shared database** - users, subscriptions, notes all sync
- **Shared authentication** - one login across ecosystem
- **Video infrastructure** - Daily.co (Twilio sunset Dec 2024, Agora more complex)
- **AI services** - OpenAI GPT-4o (existing integration)
- **Real-time translation** - Deepgram Nova-3 (sub-300ms latency)
- **Recording storage** - Cloudflare R2 (zero egress fees)

### Integration Points with Vagabond Bible
- When verse shared in Live → deep-links to Bible app on mobile
- Notes taken during session → sync to personal Bible notes
- Highlights made together → saved to individual accounts
- Pro subscription works across both platforms

---

## Mobile-First Architecture

**Critical requirement**: Most Bible study participants join from phones. Mobile must be first-class from day 1.

### Mobile UI Principles

| Element | Mobile Approach |
|---------|-----------------|
| **Video Layout** | Stack view (speaker on top, participants below) vs desktop grid |
| **Controls** | Large touch targets (48px+), thumb-reachable bottom placement |
| **Bible Panel** | Full-screen slide-up sheet, not side panel |
| **Chat** | Collapsible overlay, swipe to dismiss |
| **Reactions** | Floating button bar, haptic feedback |

### Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | <640px | Stack layout, bottom controls, sheet-based panels |
| Tablet | 640-1024px | Split view optional, floating controls |
| Desktop | >1024px | Side-by-side video + Bible, persistent panels |

### Touch-Optimized Features

1. **Swipe gestures**
   - Swipe up: Open Bible panel
   - Swipe down: Minimize to audio-only
   - Swipe left/right: Navigate Bible chapters

2. **One-hand operation**
   - All primary controls within thumb reach
   - Mute/unmute, camera toggle, reactions at bottom
   - "Raise hand" accessible without scrolling

3. **Safe area handling**
   - Respect notch/Dynamic Island on iOS
   - Handle Android navigation gestures
   - Same approach as Vagabond Bible (already solved)

### Video Performance on Mobile

| Optimization | Implementation |
|--------------|----------------|
| **Adaptive bitrate** | Daily.co handles automatically |
| **Audio-only mode** | Save data when video not needed |
| **Background audio** | Continue listening when app backgrounded |
| **Low-power mode** | Reduce video quality on low battery |

### Native App Strategy (Capacitor)

Same approach as Vagabond Bible:
- **Shared codebase** - React web app wrapped with Capacitor
- **Platform detection** - `Capacitor.isNativePlatform()` for native features
- **Native video** - Daily.co has iOS/Android SDKs if web performance insufficient
- **Push notifications** - Session reminders via existing Firebase setup

### Mobile-Specific Testing Checklist

- [ ] Portrait and landscape orientation
- [ ] Soft keyboard doesn't cover chat input
- [ ] Video continues when switching apps briefly
- [ ] Audio routing (speaker, earpiece, Bluetooth)
- [ ] Screen sharing from mobile (host feature)
- [ ] Works on slow 3G/4G connections
- [ ] Battery usage acceptable for 1-hour session

---

## Financial Analysis

### Service Pricing Research (January 2025)

#### Video Infrastructure Comparison

| Provider | Per 1,000 Participant-Minutes | Free Tier | Recording Cost | Notes |
|----------|-------------------------------|-----------|----------------|-------|
| **Daily.co** ✅ | **$4.00** | 10,000 min/month | $13.49/1K min | Best balance of cost/features |
| Agora | $3.99 (HD) - $8.99 (FHD) | 10,000 min/month | Extra | Resolution-based pricing |
| ~~Twilio~~ | N/A | N/A | N/A | **SUNSET Dec 2024** - No longer available |

**Recommendation: Daily.co** - Active product, good documentation, fair pricing

#### Real-Time Transcription (for Live Captions)

| Provider | Per 1,000 Minutes | Free Tier | Latency | Notes |
|----------|-------------------|-----------|---------|-------|
| **Deepgram Nova-3** ✅ | **$4.30** | $200 credit | <300ms | Best for real-time streaming |
| OpenAI Whisper | $6.00 | None | Higher | Better for batch/post-processing |
| Google Chirp 2 | $16.00 | None | Higher | Expensive |

**Recommendation: Deepgram** - Sub-300ms latency critical for live captions

#### AI Features (OpenAI GPT-4o)

| Feature | Estimated Tokens | Cost per Use |
|---------|------------------|--------------|
| Session Summary (1 hr) | ~4,000 tokens | ~$0.04 |
| Discussion Questions | ~1,000 tokens | ~$0.01 |
| "Ask the AI" query | ~500 tokens | ~$0.005 |

*Based on GPT-4o pricing: $2.50/1M input, $10.00/1M output*

#### Recording Storage (Cloudflare R2)

| Item | Cost | Notes |
|------|------|-------|
| Storage | **$0.015/GB/month** | 10 GB free tier |
| Egress (streaming) | **FREE** | Major advantage over AWS/GCS |
| 1 hour HD recording | ~500 MB | ~$0.0075/month to store |

**Recommendation: Cloudflare R2** - Zero egress fees = huge savings for video delivery

#### Donations Processing

| Provider | Fee | Notes |
|----------|-----|-------|
| Stripe | 2.9% + $0.30 | Standard rate |
| Stripe Connect | +0.25% platform fee option | If taking a cut |

---

### Cost Per Session Breakdown

**Scenario: 1-hour Bible study with 10 participants**

| Cost Category | Calculation | Cost |
|---------------|-------------|------|
| Video (Daily.co) | 10 people × 60 min = 600 participant-min × $0.004 | **$2.40** |
| Live Captions (Deepgram) | 60 min × $0.0043 | **$0.26** |
| Recording | 60 min × $0.01349 | **$0.81** |
| Recording Storage | 500 MB × $0.015/GB | **$0.0075/month** |
| AI Summary | ~4,000 tokens | **$0.04** |
| **TOTAL per session** | | **$3.51** |

*Note: First 10,000 participant-minutes/month are FREE on Daily.co*

---

### Monthly Cost Projections

**Scenario A: Small Ministry (10 studies/month, 10 avg participants)**
| Item | Calculation | Monthly Cost |
|------|-------------|--------------|
| Video | 6,000 participant-min (under free tier) | **$0** |
| Captions | 10 hrs × $0.26 | **$2.60** |
| Recording | 10 hrs × $0.81 | **$8.10** |
| Storage | 5 GB | **$0.075** |
| AI Summaries | 10 × $0.04 | **$0.40** |
| **TOTAL** | | **~$11/month** |

**Scenario B: Growing Ministry (50 studies/month, 20 avg participants)**
| Item | Calculation | Monthly Cost |
|------|-------------|--------------|
| Video | 60,000 participant-min - 10K free = 50K × $0.004 | **$200** |
| Captions | 50 hrs × $0.26 | **$13** |
| Recording | 50 hrs × $0.81 | **$40.50** |
| Storage | 25 GB | **$0.375** |
| AI Summaries | 50 × $0.04 | **$2** |
| **TOTAL** | | **~$256/month** |

**Scenario C: Large Platform (500 studies/month, 30 avg participants)**
| Item | Calculation | Monthly Cost |
|------|-------------|--------------|
| Video | 900,000 participant-min - 10K free = 890K × $0.004 | **$3,560** |
| Captions | 500 hrs × $0.26 | **$130** |
| Recording | 500 hrs × $0.81 | **$405** |
| Storage | 250 GB | **$3.75** |
| AI Summaries | 500 × $0.04 | **$20** |
| **TOTAL** | | **~$4,119/month** |

---

### Break-Even Pricing Analysis

**To cover costs + profit margin (targeting 60% gross margin):**

| Scenario | Monthly Cost | Break-Even | With 60% Margin |
|----------|--------------|------------|-----------------|
| Small (10 hosts) | $11 | $1.10/host | **$2.75/host** |
| Growing (50 hosts) | $256 | $5.12/host | **$12.80/host** |
| Large (500 hosts) | $4,119 | $8.24/host | **$20.60/host** |

---

### Business Model Recommendation

**Tiered Host Subscription Model:**

| Tier | Price | Includes | Target |
|------|-------|----------|--------|
| **Free** | $0 | 2 studies/month, 45 min max, 10 participants, no recording | Try before you buy |
| **Ministry** | $9.99/month | 10 studies/month, unlimited time, 25 participants, recordings, AI summaries | Small groups, home churches |
| **Church** | $29.99/month | Unlimited studies, 100 participants, all features, priority support | Growing churches |
| **Enterprise** | Custom | Unlimited everything, custom branding, API access, dedicated support | Mega-churches, denominations |

**Additional Revenue Streams:**
- **Donation Processing Fee**: 2% platform fee on all donations (on top of Stripe's 2.9%)
- **Recording Storage Overage**: $0.05/GB/month after 10 GB included
- **Pro Participants**: $4.99/month for enhanced participant features (save notes, bookmarks, etc.)

---

### Key Financial Insights

1. **Video is the biggest cost** - 70%+ of variable costs
2. **Free tier covers small users** - Daily.co's 10K free minutes = ~16 one-hour sessions with 10 people
3. **Captions are cheap** - Deepgram's efficiency makes real-time translation viable
4. **Storage is negligible** - R2's zero egress makes video replay essentially free
5. **AI costs are minimal** - GPT-4o summaries cost pennies per session

**Bottom Line**: A $9.99/month "Ministry" tier is profitable for typical small group usage. Larger churches at $29.99/month provide healthy margins.

### Additional Cost Considerations (Not Yet Modeled)

The above estimates are **optimistic base cases**. Real-world costs may be higher:

| Factor | Impact | Notes |
|--------|--------|-------|
| Recording Composition/Transcoding | +$0.01/min | Daily charges extra for composed recordings |
| Multi-channel STT | 2-4x caption cost | If transcribing each speaker separately |
| AI during session (live queries) | Variable | Could add $0.10-0.50/session if heavily used |
| Backend infrastructure | ~$50-200/month | Server costs, observability, logging |
| Bandwidth/CDN for replays | Variable | R2 egress is free, but origin compute isn't |
| Peak concurrency scaling | Variable | May need higher-tier plans at scale |

**Recommendation**: Add 30-50% buffer to cost estimates for planning purposes.

---

## Trust, Safety & Compliance

### Critical Requirements for Public Video Platform

#### Moderation & Abuse Prevention
- [ ] Report user/content button in every session
- [ ] Host ability to remove/ban participants instantly
- [ ] Admin dashboard for reviewing reports
- [ ] Automated detection of inappropriate content (future)
- [ ] Clear escalation path for serious issues

#### Recording Consent & Privacy
- [ ] Visual/audio notification when recording starts
- [ ] Participant consent flow before joining recorded sessions
- [ ] Clear recording indicator throughout session
- [ ] GDPR-compliant data handling for EU users
- [ ] Recording deletion requests honored within 30 days

#### Child Safety (COPPA/KOSA Compliance)
- [ ] Age verification or parental consent for users under 13
- [ ] Option for hosts to restrict sessions to adults only
- [ ] No direct messaging between adults and minors
- [ ] Enhanced moderation for public sessions

#### Donation Compliance
- [ ] Stripe Connect KYC for all hosts receiving donations
- [ ] Clear disclosure of platform fees
- [ ] Payout timing and minimum thresholds documented
- [ ] Tax documentation (1099s for US hosts over $600)

#### Terms of Service
- [ ] Acceptable use policy for content
- [ ] Host responsibilities for their sessions
- [ ] Platform liability limitations
- [ ] Content ownership and licensing

### App Store Considerations

If pursuing native apps later:
- Recording/streaming apps require privacy policy compliance
- In-app donations may require IAP on iOS (unless classified as donations to nonprofits)
- Content moderation required for user-generated content apps

---

## Vendor Validation Required

Before committing to technical stack, validate these capabilities:

### Daily.co Feature Checklist
- [ ] Breakout rooms API support
- [ ] Maximum participants per room (need 100+)
- [ ] Recording API and composed output options
- [ ] Live transcription integration (or Deepgram websocket compatible)
- [ ] Custom UI overlay capability
- [ ] Mobile browser support quality
- [ ] Pricing at 100K+ participant-minutes/month

### Alternative Vendors to Evaluate
- **100ms** - Strong breakout room support, competitive pricing
- **Whereby** - Embedded meeting rooms, simpler API
- **Jitsi** - Open source option, self-hosted possible

---

## MVP Feature Scope

### Must Have (Phase 1)
- [ ] Video conferencing (host + participants)
- [ ] Basic chat
- [ ] Bible verse sharing in chat
- [ ] "Open Your Bible" sync
- [ ] Session scheduling/events
- [ ] User authentication (existing)

### Should Have (Phase 1.5)
- [ ] Recording and replay
- [ ] AI summaries post-session
- [ ] Donation button
- [ ] Breakout rooms

### Nice to Have (Phase 2)
- [ ] Multi-language captions
- [ ] Live engagement reactions
- [ ] Study templates
- [ ] Discovery/browse public studies
- [ ] Native mobile apps

---

## Open Questions

1. Which video infrastructure provider offers best cost/quality balance?
2. Should hosts pay, participants pay, or both?
3. How do we handle moderation for public studies?
4. What's the recording storage retention policy?
5. Do we need live streaming to YouTube/Facebook?

---

## Next Steps

1. [ ] Complete financial cost research
2. [ ] Decide on video infrastructure provider
3. [ ] Define MVP feature cutoff
4. [ ] Design UI/UX mockups
5. [ ] Build prototype

---

*Document created: January 2026*
*Part of the Vagabond ecosystem - spreading the Gospel through technology*
