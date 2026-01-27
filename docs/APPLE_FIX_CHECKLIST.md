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
