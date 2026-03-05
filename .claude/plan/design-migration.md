# Design Migration Plan: Dark Theme -> HubFit-inspired Light Theme

## Overview

Migrate Athletly from OLED-dark zinc theme to a HubFit-inspired light theme with blue gradient headers, white floating cards, subtle shadows, and a premium fitness-app aesthetic.

## Execution Waves

### Wave 1: Foundation (Design Tokens + Tailwind Config)
**Goal:** Update all design tokens so every component automatically picks up the new palette.

**Files:**
1. `lib/colors.ts` — Complete rewrite: dark zinc -> light blue palette
2. `tailwind.config.js` — Update all custom colors, add shadow utilities, add new semantic tokens
3. `lib/typography.ts` — Minor size adjustments, add new tokens (bodyMedium, captionUpper, metricSm)
4. `global.css` — Add custom utility classes if needed
5. `lib/sport-colors.ts` — Keep sport colors, adjust rest color for light bg

**Verification:** `npx expo start` should compile without errors. Colors will look wrong in components until Wave 2.

---

### Wave 2: Core UI Components
**Goal:** Update all base components to the new visual language.

**Files:**
1. `components/ui/Card.tsx`
   - Remove all borders (border-none)
   - White background (#FFFFFF)
   - Add shadow elevation system (elevation-1, elevation-2)
   - Increase radius to 16-20px
   - Add `nested` variant for gray inner cards (#F5F6F8)
   - Remove glass variant, replace with nested

2. `components/ui/Button.tsx`
   - Primary: dark slate (#1E293B) with white text (NOT blue)
   - Secondary: white bg, gray border
   - Ghost: blue text, transparent bg
   - Icon: light gray bg (#F5F6F8), rounded-square
   - Update all hardcoded color strings

3. `components/ui/Input.tsx`
   - White bg, subtle gray border (#E2E8F0)
   - Blue focus border
   - Update placeholder color to #94A3B8
   - Update label color

4. `components/ui/Badge.tsx`
   - Blue outline style for status badges
   - Light blue fill for completion badges
   - Update hardcoded colors

5. `components/ui/CircularGauge.tsx`
   - Track color: #E2E8F0 (was #27272A)
   - Default progress color: #2563EB (was #3B82F6)
   - Update center text colors for light bg

6. `components/ui/ProgressBar.tsx`
   - Track color: #E8EBF0 (was surface-elevated)
   - Default bar color: #2563EB

7. `components/ui/Skeleton.tsx`
   - Change bg from surface-elevated to #E8EBF0
   - Adjust opacity range for light theme

8. `components/ui/Toast.tsx`
   - Dark toast bg (#0F172A) for contrast on light screens
   - Update status colors to match new palette
   - Remove border, use stronger shadow

9. `components/ui/EmptyState.tsx`
   - Update icon color for light bg
   - Update text colors

10. `components/ui/index.ts` — No changes needed

**New Components:**
11. `components/ui/GradientHeader.tsx` — **NEW**
    - LinearGradient from expo-linear-gradient
    - Props: title, subtitle, rightContent, children
    - Gradient: #2563EB -> #4F46E5 -> #7C3AED
    - Height ~220px, content overlaps via negative margin
    - White text, safe area padding

12. `components/ui/StatCard.tsx` — **NEW**
    - Nested gray card for metrics
    - Props: icon, value, unit, label
    - Gray bg (#F5F6F8), rounded-14px, no shadow

13. `components/ui/SuccessBanner.tsx` — **NEW**
    - Light blue banner for achievements
    - Props: message
    - Bg #DBEAFE, blue text, rounded-12px

**Dependency:**
- Install `expo-linear-gradient` for GradientHeader

**Verification:** Import and render each component in isolation. Check colors, shadows, radii.

---

### Wave 3: Screen Layouts (Tab Screens)
**Goal:** Update all screen files to use new layout patterns (gradient header, white cards on gray bg).

**Files:**
1. `app/_layout.tsx`
   - StatusBar style: "dark" (was "light") — dark text on light bg
   - Background color: #F0F2F5

2. `app/(tabs)/_layout.tsx`
   - Tab bar: white bg, no border, subtle top shadow
   - Active tint: #2563EB
   - Inactive tint: #94A3B8
   - Remove borderTopWidth

3. `app/(tabs)/index.tsx` (Today Screen)
   - Add GradientHeader with greeting + progress ring
   - Cards float on #F0F2F5 canvas
   - Update all bg-background to new color
   - Wrap metric cards in white card container
   - Section headers: h2 semibold, #0F172A

4. `app/(tabs)/plan.tsx` (Plan Screen)
   - Add GradientHeader with "Trainingsplan" title
   - Week navigation on gradient or just below
   - Session cards as white floating cards
   - Update all color references

5. `app/(tabs)/coach.tsx` (Coach Screen)
   - Add GradientHeader with "Coach" title + online indicator
   - Chat area: #F0F2F5 background
   - Update ChatBubble colors (user bubble: primary blue, assistant: white card)

6. `app/(tabs)/profile.tsx` (Profile Screen)
   - Add GradientHeader with "Profil" title
   - Settings cards: white with shadow, no border
   - Destructive items: red text on light red bg
   - Section headers: uppercase caption, #475569

**Verification:** Run the app, navigate all tabs. Compare each screen against HubFit screenshots.

---

### Wave 4: Feature Components
**Goal:** Update all domain-specific components.

**Files:**
1. `components/home/RecoveryGauge.tsx`
   - Blue progress ring on gray track
   - Update fallback colors

2. `components/home/MetricMiniCard.tsx`
   - Use new StatCard style (gray bg, no border)
   - Update icon and text colors

3. `components/home/HeroWorkoutCard.tsx`
   - White card with stronger shadow (elevation-2)
   - Sport color as top accent bar
   - Update CTA button to dark slate style
   - Coach note: light gray nested card

4. `components/home/WeekProgress.tsx`
   - Update track color for light bg
   - Dot colors: filled blue, empty #E2E8F0

5. `components/plan/WeekStrip.tsx`
   - Selected day: blue bg, white text
   - Unselected: white bg, dark text
   - Today indicator: small blue dot

6. `components/plan/SessionCard.tsx`
   - White card, shadow, no border
   - Update text and badge colors

7. `components/plan/RestDayCard.tsx`
   - Light gray card or white card with muted styling

8. `components/plan/WeeklySummary.tsx`
   - White card, updated progress bar

9. `components/chat/ChatBubble.tsx`
   - User: #2563EB bg, white text
   - Assistant: white bg, shadow, dark text
   - System: light gray bg

10. `components/chat/ChatInput.tsx`
    - White input bar, subtle border
    - Send button: blue circle

11. `components/chat/AgentStatus.tsx`
    - Update for light theme

12. `components/chat/QuickReplies.tsx`
    - White pills with blue border/text

13. `components/chat/CheckpointCard.tsx`
    - White card with shadow

14. `components/profile/ProfileHeader.tsx`
    - Update for light theme, avatar on gradient

15. `components/profile/SettingsRow.tsx`
    - White bg, gray dividers, dark text

16. `components/profile/ServiceStatus.tsx`
    - Update status indicator colors

17. `components/profile/GarminConnectModal.tsx`
    - White modal, light backdrop

**Verification:** Full app walkthrough. Every screen, every component.

---

### Wave 5: Auth & Onboarding Screens
**Goal:** Update auth flow to match new design.

**Files:**
1. `app/(auth)/login.tsx`
   - Gradient background (full-screen or header)
   - White card for form area
   - Logo on gradient
   - Update input and button styles

2. `app/(auth)/register.tsx`
   - Same gradient + white card pattern as login

3. `app/(auth)/_layout.tsx`
   - StatusBar: "light" (white text on gradient)

4. `app/(onboarding)/index.tsx`
   - Gradient accents
   - White cards for steps

5. `app/(onboarding)/_layout.tsx`
   - Update background

**Verification:** Complete auth flow test.

---

### Wave 6: Polish & Visual Verification
**Goal:** Pixel-perfect comparison against HubFit screenshots.

**Checklist:**
- [ ] Gradient header matches HubFit (blue -> purple, ~30% screen height)
- [ ] Cards are borderless, white, with subtle shadows
- [ ] Cards float above gradient (negative margin overlap)
- [ ] Nested stat cards have gray (#F5F6F8) background
- [ ] Circular gauges: blue on gray track, round linecap
- [ ] Primary CTA buttons are dark (not blue)
- [ ] Tab bar: white, no border, subtle shadow, blue active icon
- [ ] Section headers: uppercase tracking, semibold
- [ ] Success banners: light blue bg, blue text
- [ ] Progress bars: gray track, blue fill
- [ ] Text hierarchy: near-black primary, slate secondary, light slate muted
- [ ] Dividers inside cards: very subtle (#E2E8F0)
- [ ] Icon circles: light tinted backgrounds with matching icon color
- [ ] Overall feel: light, airy, premium, modern
- [ ] No remaining dark-theme artifacts (dark backgrounds, zinc colors, etc.)

**Method:** Take screenshots of each Athletly screen, place side-by-side with HubFit screenshots, identify and fix discrepancies.

---

## Dependency to Install

```bash
npx expo install expo-linear-gradient
```

## Files Summary (by change type)

### Rewrite (major changes):
- `lib/colors.ts`
- `tailwind.config.js`
- `components/ui/Card.tsx`
- `components/ui/Button.tsx`
- `app/(tabs)/index.tsx`
- `app/(auth)/login.tsx`

### Update (moderate changes):
- `lib/typography.ts`
- `components/ui/Input.tsx`
- `components/ui/Badge.tsx`
- `components/ui/CircularGauge.tsx`
- `components/ui/ProgressBar.tsx`
- `components/ui/Skeleton.tsx`
- `components/ui/Toast.tsx`
- `components/ui/EmptyState.tsx`
- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/plan.tsx`
- `app/(tabs)/coach.tsx`
- `app/(tabs)/profile.tsx`
- All components/home/*
- All components/plan/*
- All components/chat/*
- All components/profile/*
- `app/(auth)/register.tsx`
- `app/(onboarding)/*`

### New files:
- `components/ui/GradientHeader.tsx`
- `components/ui/StatCard.tsx`
- `components/ui/SuccessBanner.tsx`

### Total: ~35 files to modify/create across 6 waves
