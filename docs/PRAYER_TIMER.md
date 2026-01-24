# Prayer Timer

A dedicated prayer meditation timer with visual and audio feedback to support focused prayer sessions.

**Status**: Implemented (deferred from v1.0 App Store submission)

## Overview

The Prayer Timer provides a distraction-free environment for timed prayer sessions with beautiful visual elements including an animated progress ring, Virgin Mary imagery, and pulsing ambient effects.

## Features

### Core Functionality
- **Preset Durations**: 5 MIN, 10 MIN, 30 MIN
- **Auto-start**: Timer begins automatically when screen opens (defaults to 5 minutes)
- **START/STOP Toggle**: Single button to control timer state
  - STOP: Pauses the countdown
  - START: Resets timer to selected duration and begins countdown
- **Sound Control**: Button for ambient prayer sounds (placeholder - not yet implemented)

### Visual Design

#### Color Palette
- Background: Solid black (#000000)
- Progress Ring Gradient: Yellow to Orange (#FFBE00 → #FF6A00)
- Inner Circle Border: Dark gray (#2a2a2a)
- Duration Buttons (inactive): Transparent with dark border (#161616), gray text (#747373)
- Duration Buttons (active): Yellow-orange gradient
- Pulse Effect: White at 30% opacity, fading to 0%

#### Layout (Responsive)
The layout is designed to center content in the viewport space above the bottom navigation:

- **Header**: Back button (top-left), "PRAYER TIMER" title
- **Timer Circle**: Centered in viewport, responsive sizing
  - Small screens (SE): 280px diameter
  - Larger screens: 420px diameter
- **Controls**: Duration buttons and START/STOP button below the circle

#### Animations
- **Progress Ring**: Circular countdown animation with smooth transition
- **Pulse Effect**: Two staggered rings emanating from the outer circle
  - Duration: 4 seconds per pulse
  - Scale: 1.0 → 1.4x
  - Opacity: 30% → 0%
  - Two rings offset by 2 seconds for continuous effect

### Typography
- Title: Abhaya Libre serif, 26px
- Timer Display: SCHABO Condensed / Impact, responsive (text-5xl on SE, text-8xl on larger)
- Buttons: Poppins sans-serif

## Technical Implementation

### File Location
`client/src/pages/prayer-timer.tsx`

### Route
`/prayer-timer`

### Dependencies
- React hooks: useState, useEffect, useRef
- Wouter: useLocation for navigation
- Lucide React: ChevronLeft icon
- Assets: Mary image, Sound icon

### State Management
```typescript
const [selectedDuration, setSelectedDuration] = useState(5); // minutes
const [timeRemaining, setTimeRemaining] = useState(5 * 60); // seconds
const [isRunning, setIsRunning] = useState(true);
```

### Key Components
- SVG-based circular progress indicator
- CSS keyframe animation for pulse effect
- Responsive sizing with Tailwind breakpoints (sm:)

## Future Enhancements

1. **Sound Integration**: Implement ambient prayer sounds/music
2. **Haptic Feedback**: Vibration when timer completes
3. **Custom Durations**: Allow users to set custom prayer times
4. **Prayer Completion Tracking**: Log completed prayer sessions
5. **Prayer Prompts**: Optional guided prayer prompts during session
6. **Different Imagery Options**: Allow users to select different devotional images

## Assets

- `attached_assets/Mary_1769243057081.png` - Virgin Mary devotional image
- `attached_assets/Sound_Icon_1769243057081.png` - Sound control icon

## Design Notes

- Timer auto-starts to reduce friction in beginning prayer
- Pulse animation only runs when timer is active (running)
- Dark theme minimizes distractions during prayer
- Large timer display ensures visibility during meditation
- Responsive layout ensures proper display on all iOS devices (SE through Pro Max)
