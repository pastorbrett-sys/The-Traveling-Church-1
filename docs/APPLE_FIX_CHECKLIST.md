# Apple App Store Fix Checklist (Guidelines 5.1.1 & 3.1.2)

## SCOPE SUMMARY
- Actual code changes: ~15-20 items
- "No changes needed" confirmations: ~15 items
- Most changes: 1-3 lines each (adding `if (!user)` checks, adding `enabled:` to queries)
- New components: 1 (GuestPrompt)
- New dialogs: 1 (LoginPromptDialog in bible-reader)

---

## A. ROUTE-LEVEL (Remove AuthGate from App.tsx)

**NOTE: There are 2 routers (VagabondBibleRouter + ChurchRouter), so 8 total removals needed!**

| # | Route | Router | Action |
|---|-------|--------|--------|
| 1 | /pastor-chat | VagabondBibleRouter (line 66) | Remove AuthGate wrapper |
| 2 | /bible-buddy | VagabondBibleRouter (line 67) | Remove AuthGate wrapper |
| 3 | /notes | VagabondBibleRouter (line 68) | Remove AuthGate wrapper |
| 4 | /profile | VagabondBibleRouter (line 69) | Remove AuthGate wrapper |
| 1b | /pastor-chat | ChurchRouter (line 106) | Remove AuthGate wrapper |
| 2b | /bible-buddy | ChurchRouter (line 107) | Remove AuthGate wrapper |
| 3b | /notes | ChurchRouter (line 108) | Remove AuthGate wrapper |
| 4b | /profile | ChurchRouter (line 109) | Remove AuthGate wrapper |

---

## B. NOTES PAGE (client/src/pages/notes.tsx)

| # | Issue | Fix |
|---|-------|-----|
| 5 | Missing useAuth import | Add `import { useAuth } from "@/hooks/use-auth";` |
| 6 | Query has no enabled check (line 237) | Add `enabled: isAuthenticated,` |
| 7 | No guest UI | Add early return with GuestPrompt when `!isAuthenticated` |

---

## C. PASTOR-CHAT PAGE (client/src/pages/pastor-chat.tsx)

| # | Issue | Line | Fix |
|---|-------|------|-----|
| 8 | conversations query no enabled | 284-286 | Add `enabled: isAuthenticated,` |
| 9 | sendMessage() no auth | ~468 | Add `if (!isAuthenticated) { setShowLoginPrompt(true); return; }` |
| 10 | seedConversation useEffect | 320 | Add `if (!isAuthenticated) return;` at start |
| 11 | Conversation restore useEffect | 295 | Add `if (!isAuthenticated) return;` for safety |
| 12 | startNewChat() no auth | 607 | Add auth check before DELETE call |
| 13 | LoginPrompt redirect URL | 887 | Use `encodeURIComponent('/pastor-chat?tab=chat')` |

---

## D. BIBLE-READER (client/src/components/bible-reader.tsx)

| # | Issue | Line | Fix |
|---|-------|------|-----|
| 14 | Add login prompt state | - | `const [showLoginPrompt, setShowLoginPrompt] = useState(false);` |
| 15 | Add LoginPromptDialog UI | - | Add Dialog with EN/Amharic text |
| 16 | performSmartSearch() | 471 | Add `if (!user) { setShowLoginPrompt(true); return; }` |
| 17 | handleSmartSearchResult() | 508 | Add auth check |
| 18 | handleTopicVerseClick() | 579 | Add auth check |
| 19 | handleGetInsight() | 954 | Add auth check |
| 20 | handleBookSynopsis() | 1247 | Add auth check |
| 21 | handleSaveNote() | 1216 | Add auth check |
| 22 | Redirect URL with position | - | Build with book, chapter, verse + `encodeURIComponent()` |

---

## E. PROFILE PAGE (client/src/pages/profile.tsx)

| # | Issue | Fix |
|---|-------|-----|
| 23 | Already has internal auth check (line 651) | Just remove AuthGate wrapper - existing code handles it |

---

## F. NEW COMPONENT: GuestPrompt (client/src/components/guest-prompt.tsx)

| # | Feature |
|---|---------|
| 24 | Create reusable component with `featureDescription` prop |
| 25 | iOS safe area: `env(safe-area-inset-top/bottom)` |
| 26 | Android safe area: `var(--android-status-bar-height, 44px)` |
| 27 | Web: Include VagabondHeader |
| 28 | EN + Amharic localization |
| 29 | Sign-in button with redirect URL |

---

## G. LOCALIZATION

| # | Location | EN | Amharic |
|---|----------|----|---------| 
| 30 | Notes GuestPrompt | "Sign in to save and view your notes" | "ማስታወሻዎችን ለማስቀመጥ እና ለማየት ይግቡ" |
| 31 | Bible LoginPrompt | "Sign in to use AI features" | "የ AI ባህሪያትን ለመጠቀም ይግቡ" |

---

## H. PROTECTED BY UPSTREAM (No changes needed) ✅

| Function | Why Safe |
|----------|----------|
| handleSendInsightMessage | Panel won't open (guarded by handleGetInsight) |
| handleSendDiscussionMessage | Panel won't open (guarded by entry points) |
| handleOpenContinueDiscussion | Called from guarded functions |
| handleCloseContinueDiscussion | Panel won't open |
| Notes mutations | Page shows GuestPrompt |
| Keyboard Enter handlers | Call guarded functions |
| handleViewNotes | Called after successful save |
| Compare translations | Public endpoint |
| Share verse | Client-side only |
| Copy verse | Client-side only |

---

## I. VERIFIED PUBLIC/NO CHANGES ✅

| Area | Reason |
|------|--------|
| Bible translations, books, chapters | Public endpoints |
| /api/bible/compare | Public endpoint |
| Prayer timer | Client-side only |
| Contact form | Intentionally public |
| Prayer requests POST | Intentionally public |
| Candle donation | Intentionally public |
| Ambassador tracking | Intentionally public |
| Session stats query | Already has `enabled: isAuthenticated` |
| Subscription query | Already has `enabled: isAuthenticated` |
| Onboarding | Has `enabled: !!userId` |
| Notification settings | Has enabled checks |
| Deep links | Auth callback only |
| Native tab bar | Navigation only |
| Navigation component | No API calls |

---

## J. UNRELATED

| # | Issue |
|---|-------|
| 32 | LSP error: getClient at server/routes.ts:813 |

---

## ACTUAL WORK BREAKDOWN

- 8 AuthGate removals (2 routers x 4 routes)
- 3 `enabled:` additions to queries (1 line each)
- 7 auth check additions to functions (2-3 lines each)
- 1 GuestPrompt component (~50-80 lines)
- 1 LoginPromptDialog addition (~20 lines)
- 2 redirect URL fixes (1 line each)
- 2 localization additions

**Total estimated: ~125 lines of changes across 6 files**

---

## K. QA TESTING CHECKLIST

### Platform Legend
- 📱 iOS Native
- 🤖 Android Native  
- 🌐 Mobile Web
- 💻 Desktop Web

---

### 1. GUEST BIBLE READING (Must Work Without Login)

| # | Test Case | 📱 | 🤖 | 🌐 | 💻 |
|---|-----------|----|----|----|----|
| 1.1 | Open app as guest - lands on Bible reader | ☐ | ☐ | ☐ | ☐ |
| 1.2 | Browse book list (Old/New Testament) | ☐ | ☐ | ☐ | ☐ |
| 1.3 | Select a book → see chapters | ☐ | ☐ | ☐ | ☐ |
| 1.4 | Select chapter → read verses | ☐ | ☐ | ☐ | ☐ |
| 1.5 | Change translation (KJV, ESV, etc.) | ☐ | ☐ | ☐ | ☐ |
| 1.6 | Compare translations on a verse | ☐ | ☐ | ☐ | ☐ |
| 1.7 | Copy verse to clipboard | ☐ | ☐ | ☐ | ☐ |
| 1.8 | Share verse (opens share sheet) | ☐ | ☐ | ☐ | ☐ |
| 1.9 | Navigate chapters (prev/next) | ☐ | ☐ | ☐ | ☐ |
| 1.10 | Deep link to specific verse works | ☐ | ☐ | ☐ | ☐ |

---

### 2. AI FEATURES - LOGIN PROMPT (Must Show Login Dialog)

| # | Test Case | Expected | 📱 | 🤖 | 🌐 | 💻 |
|---|-----------|----------|----|----|----|----|
| 2.1 | Guest taps Smart Search | Login prompt appears | ☐ | ☐ | ☐ | ☐ |
| 2.2 | Guest taps "Get Insight" on verse | Login prompt appears | ☐ | ☐ | ☐ | ☐ |
| 2.3 | Guest taps Book Synopsis | Login prompt appears | ☐ | ☐ | ☐ | ☐ |
| 2.4 | Guest taps Save Note | Login prompt appears | ☐ | ☐ | ☐ | ☐ |
| 2.5 | Guest navigates to /notes | GuestPrompt page shown | ☐ | ☐ | ☐ | ☐ |
| 2.6 | Guest navigates to /pastor-chat | LoginPrompt shown | ☐ | ☐ | ☐ | ☐ |
| 2.7 | Guest navigates to /bible-buddy | LoginPrompt shown | ☐ | ☐ | ☐ | ☐ |
| 2.8 | Guest navigates to /profile | GuestPrompt page shown | ☐ | ☐ | ☐ | ☐ |

---

### 3. LOGIN FLOW & REDIRECT

| # | Test Case | 📱 | 🤖 | 🌐 | 💻 |
|---|-----------|----|----|----|----|
| 3.1 | Login from Smart Search prompt → returns to Bible | ☐ | ☐ | ☐ | ☐ |
| 3.2 | Login from Notes page → returns to Notes | ☐ | ☐ | ☐ | ☐ |
| 3.3 | Login from Pastor Chat → returns to Chat tab | ☐ | ☐ | ☐ | ☐ |
| 3.4 | Login from Profile page → returns to Profile | ☐ | ☐ | ☐ | ☐ |
| 3.5 | Login preserves Bible position (book/chapter/verse) | ☐ | ☐ | ☐ | ☐ |

---

### 4. AUTHENTICATED USER FEATURES (Must Work After Login)

| # | Test Case | 📱 | 🤖 | 🌐 | 💻 |
|---|-----------|----|----|----|----|
| 4.1 | Smart Search returns results | ☐ | ☐ | ☐ | ☐ |
| 4.2 | Get Insight shows AI response | ☐ | ☐ | ☐ | ☐ |
| 4.3 | Book Synopsis loads | ☐ | ☐ | ☐ | ☐ |
| 4.4 | Save Note works | ☐ | ☐ | ☐ | ☐ |
| 4.5 | Notes page shows saved notes | ☐ | ☐ | ☐ | ☐ |
| 4.6 | Pastor Chat loads conversations | ☐ | ☐ | ☐ | ☐ |
| 4.7 | Send message in chat works | ☐ | ☐ | ☐ | ☐ |
| 4.8 | Start new chat works | ☐ | ☐ | ☐ | ☐ |
| 4.9 | Profile shows user info | ☐ | ☐ | ☐ | ☐ |

---

### 5. PLATFORM-SPECIFIC SAFE AREAS

| # | Test Case | Platform |
|---|-----------|----------|
| 5.1 | GuestPrompt respects iOS notch (safe-area-inset-top) | 📱 |
| 5.2 | GuestPrompt respects iOS home indicator (safe-area-inset-bottom) | 📱 |
| 5.3 | GuestPrompt respects Android status bar | 🤖 |
| 5.4 | GuestPrompt shows VagabondHeader on web | 🌐 💻 |
| 5.5 | LoginPromptDialog displays correctly on all screen sizes | All |

---

### 6. EDGE CASES

| # | Test Case | Expected |
|---|-----------|----------|
| 6.1 | Logout while on Notes page | Redirected or GuestPrompt shown |
| 6.2 | Logout while in Pastor Chat | LoginPrompt shown |
| 6.3 | Session expires during use | Graceful 401 handling, login prompt |
| 6.4 | Rapid toggle between guest/auth features | No crashes, correct UI state |
| 6.5 | Amharic language mode shows correct translations | All prompts in Amharic |

---

### 7. REGRESSION CHECKS

| # | Test Case | 📱 | 🤖 | 🌐 | 💻 |
|---|-----------|----|----|----|----|
| 7.1 | Prayer timer still works | ☐ | ☐ | ☐ | ☐ |
| 7.2 | Contact form still works | ☐ | ☐ | ☐ | ☐ |
| 7.3 | Subscription/upgrade flow works | ☐ | ☐ | ☐ | ☐ |
| 7.4 | Push notifications still work | ☐ | ☐ | N/A | N/A |
| 7.5 | Existing users' notes still accessible | ☐ | ☐ | ☐ | ☐ |

---

## L. SIGN-OFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA Tester | | | |
| Product Owner | | | |
