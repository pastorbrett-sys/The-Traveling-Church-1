# 💬 Onboarding Tooltips

> Playful, context-aware hints that guide new users naturally

---

## 🎯 The Approach

Instead of a forced tutorial, we show helpful hints **when they're relevant**. Each bubble appears at the right moment as the user explores naturally.

**Key principles:**
- Discovery-based, not tutorial-based
- No forced progression
- Feels like helpful hints, not a lesson
- Fun, bouncy animations
- Only shows once per user (first time ever)

---

## 👆 When Each Bubble Appears

| Moment | What Happens | Bubble Says |
|--------|--------------|-------------|
| Bible reader loads (first time) | Bubble points to translation dropdown | "Choose your Bible version" / "የመጽሐፍ ቅዱስ ትርጉም ይምረጡ" |
| User lands on any chapter (first time) | Bubble appears near verse area | "Tap any verse for insights" / "ለማስተዋል ማንኛውንም ጥቅስ ይንኩ" |
| User taps a verse (first time) | Bubble points to action bar | "Your AI study companion" / "የእርስዎ AI የጥናት ጓደኛ" |

Each bubble disappears when:
- User interacts with the target
- User navigates away
- User taps anywhere else

---

## ✨ The Animation Feel

```
1. Bubble fades in quickly (200ms)
2. Slight scale up from 0.9 → 1.0 (bounce effect)
3. Gentle floating animation while visible (subtle up/down)
4. Arrow points to target with smooth positioning
5. Fades out when dismissed (150ms)
```

**The vibe:** Playful, smooth, modern. Like a friendly tap on the shoulder.

---

## 📍 Smart Positioning

Bubbles automatically position themselves to stay fully on screen:

```
┌─────────────────────────────────────────────┐
│                                             │
│   Target near TOP → bubble appears BELOW    │
│                    ↓                        │
│              ┌─────────────┐                │
│              │   Bubble    │                │
│              └─────────────┘                │
│                                             │
│   Target near BOTTOM → bubble appears ABOVE │
│              ┌─────────────┐                │
│              │   Bubble    │                │
│              └─────────────┘                │
│                    ↑                        │
│                                             │
│   Target near LEFT → bubble on RIGHT        │
│   Target near RIGHT → bubble on LEFT        │
│                                             │
│   Always 16px minimum from screen edge      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🌍 Language Detection

Uses device language to show English or Amharic:

```
navigator.language starts with "am" → Amharic
Everything else → English
```

No location/GPS needed. A US tourist with English phone sees English. An Ethiopian with Amharic phone sees Amharic.

---

## 🧪 Testing

**On web (development):**
- Add `?testOnboarding=true` to any Bible page URL
- Forces all three bubbles to show again

**On native (Xcode/Android Studio):**
- Triple-tap version number in settings
- Shows "Reset Onboarding" option
- Go back to Bible reader to see bubbles again

---

## 📱 Platform Support

Works identically on:
- Desktop web browsers
- Mobile web browsers
- iOS app (Capacitor)
- Android app (Capacitor)

Same React component, same animations, same logic everywhere.

---

---

# 🔧 Technical Implementation

> Everything below is for building. Skip if you just wanted the overview!

---

## 📁 File Structure

```
client/src/
├── components/
│   └── onboarding/
│       ├── OnboardingTooltip.tsx    # The tooltip bubble component
│       ├── OnboardingProvider.tsx   # Context provider tracking state
│       └── useOnboarding.ts         # Hook for triggering tooltips
├── lib/
│   └── languageDetection.ts         # Device language detection

server/
├── routes.ts                        # Endpoint to mark onboarding complete

shared/
└── schema.ts                        # hasSeenOnboarding fields on users table
```

---

## 💾 Database Schema Addition

```typescript
// Add to users table
hasSeenTranslationTooltip: boolean("has_seen_translation_tooltip").default(false),
hasSeenVerseTooltip: boolean("has_seen_verse_tooltip").default(false),
hasSeenActionBarTooltip: boolean("has_seen_action_bar_tooltip").default(false),
```

Three separate flags so each can be dismissed independently.

---

## 🎨 Tooltip Component Props

```typescript
interface OnboardingTooltipProps {
  targetRef: RefObject<HTMLElement>;  // Element to point at
  text: string;                       // English text
  textAmharic: string;                // Amharic text
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  onDismiss: () => void;              // Called when dismissed
  visible: boolean;                   // Show/hide
}
```

---

## 📐 Positioning Logic

```typescript
function calculatePosition(
  targetRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  padding: number = 16
): { x: number; y: number; arrow: 'top' | 'bottom' | 'left' | 'right' } {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  
  // Calculate available space in each direction
  const spaceAbove = targetRect.top;
  const spaceBelow = viewport.height - targetRect.bottom;
  const spaceLeft = targetRect.left;
  const spaceRight = viewport.width - targetRect.right;
  
  // Pick direction with most space
  const spaces = [
    { dir: 'bottom', space: spaceBelow, arrow: 'top' },
    { dir: 'top', space: spaceAbove, arrow: 'bottom' },
    { dir: 'right', space: spaceRight, arrow: 'left' },
    { dir: 'left', space: spaceLeft, arrow: 'right' },
  ];
  
  const best = spaces.sort((a, b) => b.space - a.space)[0];
  
  // Calculate position ensuring bubble stays on screen
  let x, y;
  
  if (best.dir === 'bottom') {
    x = Math.max(padding, Math.min(
      targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      viewport.width - tooltipWidth - padding
    ));
    y = targetRect.bottom + 12; // 12px gap
  }
  // ... similar for other directions
  
  return { x, y, arrow: best.arrow };
}
```

---

## 🎬 Animation CSS

```css
.onboarding-tooltip {
  animation: tooltipEnter 0.3s ease-out forwards;
}

@keyframes tooltipEnter {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.onboarding-tooltip.visible {
  animation: tooltipFloat 2s ease-in-out infinite;
}

@keyframes tooltipFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.onboarding-tooltip.exiting {
  animation: tooltipExit 0.15s ease-in forwards;
}

@keyframes tooltipExit {
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

---

## 🎨 Tooltip Styling

```css
.onboarding-tooltip {
  background: #FEF3C7; /* Warm yellow */
  border: 2px solid #F59E0B;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 260px;
  z-index: 9999;
  position: fixed;
}

.onboarding-tooltip .arrow {
  width: 12px;
  height: 12px;
  background: #FEF3C7;
  border: 2px solid #F59E0B;
  transform: rotate(45deg);
  position: absolute;
}

.onboarding-tooltip .text {
  color: #92400E;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
}
```

---

## 🔌 API Endpoints

```
POST /api/onboarding/mark-seen
Body: { tooltip: 'translation' | 'verse' | 'actionBar' }

GET /api/onboarding/status
Response: {
  hasSeenTranslationTooltip: boolean,
  hasSeenVerseTooltip: boolean,
  hasSeenActionBarTooltip: boolean
}

POST /api/onboarding/reset (dev only)
Resets all three flags to false
```

---

## 🧩 Integration Points

### Bible Reader (translation tooltip)
```typescript
// In bible-reader.tsx
const { showTooltip } = useOnboarding();

useEffect(() => {
  if (isFirstLoad && !hasSeenTranslationTooltip) {
    // Wait for load animations to complete
    setTimeout(() => {
      showTooltip('translation', translationDropdownRef);
    }, 1000);
  }
}, [isFirstLoad]);
```

### Chapter View (verse tooltip)
```typescript
// When chapter loads
useEffect(() => {
  if (!hasSeenVerseTooltip) {
    showTooltip('verse', verseAreaRef);
  }
}, [chapterLoaded]);
```

### Verse Selection (action bar tooltip)
```typescript
// When action bar appears
useEffect(() => {
  if (selectedVerse && !hasSeenActionBarTooltip) {
    showTooltip('actionBar', actionBarRef);
  }
}, [selectedVerse]);
```

---

## ✅ Implementation Checklist

- [ ] Add three `hasSeenX` fields to users table
- [ ] Create language detection utility
- [ ] Build OnboardingTooltip component with smart positioning
- [ ] Add floating animation and bounce effect
- [ ] Create OnboardingProvider context
- [ ] Integrate into Bible reader (translation tooltip)
- [ ] Integrate into chapter view (verse tooltip)
- [ ] Integrate into action bar (action bar tooltip)
- [ ] Add API endpoints for marking seen / getting status
- [ ] Add URL parameter for testing (?testOnboarding=true)
- [ ] Add triple-tap reset in settings (for native testing)
- [ ] Test on web, iOS simulator, Android emulator
- [ ] Test both English and Amharic languages
