<div align="center">
  <h1>Athletly</h1>
  <h3>AI-Powered Sports Coaching — React Native App</h3>
  <p>
    <img src="https://img.shields.io/badge/react_native-0.83-61DAFB" alt="React Native">
    <img src="https://img.shields.io/badge/expo-55-000020" alt="Expo">
    <img src="https://img.shields.io/badge/typescript-5.9-3178C6" alt="TypeScript">
    <img src="https://img.shields.io/badge/platform-iOS%20·%20Android%20·%20Web-lightgrey" alt="Platforms">
  </p>
</div>

**Athletly** is a cross-platform fitness coaching app powered by an autonomous AI agent. It delivers personalized training plans, real-time coaching conversations, and health data integration — all through a clean, light-themed interface.

## Features

- **AI Coach Chat** — Real-time streaming conversations (SSE) with an autonomous coaching agent that selects from 20+ specialized tools
- **Companion Onboarding** — Voice-enabled, 7-step onboarding that captures sports, goals, schedule, and health data connections
- **Weekly Training Plans** — AI-generated plans with per-session details, intensity guidance, and coach reasoning
- **Health Integration** — Apple Health (iOS), Google Health Connect (Android), Garmin Connect
- **Activity Tracking** — Quick-log workouts with sport, duration, intensity, and body part targeting
- **Recovery Dashboard** — Recovery gauge, sleep, HRV, resting HR, and training load at a glance
- **Product Recommendations** — Agent-driven, affiliate-ready equipment suggestions

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.83 + Expo 55 (Expo Router) |
| Language | TypeScript 5.9 (strict) |
| Styling | TailwindCSS + NativeWind |
| State | Zustand |
| Auth | Supabase Auth + Expo Secure Store |
| Health | Apple HealthKit, Google Health Connect |
| Streaming | Server-Sent Events (react-native-sse) |
| Voice | expo-speech-recognition |

## Project Structure

```
athletly-app/
├── app/                        # File-based routing (Expo Router)
│   ├── (auth)/                 #   Login, Register, Forgot Password
│   ├── (onboarding)/           #   7-step companion onboarding
│   ├── (tabs)/                 #   Today · Plan · Coach · Tracking · Profile
│   └── workout/                #   Live workout + summary (modal)
├── components/
│   ├── ui/                     #   Base components (Button, Card, Input, ...)
│   ├── home/                   #   Dashboard widgets (Recovery, Metrics, ...)
│   ├── chat/                   #   Chat bubbles, checkpoints, voice input
│   ├── plan/                   #   Plan cards, day view
│   └── profile/                #   Settings, service connections
├── store/                      #   Zustand stores (auth, chat, plan, health, ...)
├── hooks/                      #   useAuth, useAppleHealth, useChatStream, ...
├── lib/                        #   API client, Supabase, colors, typography
├── types/                      #   TypeScript definitions
└── docs/                       #   Design system, onboarding spec
```

## Navigation

```
/(root)
├── (auth)           → Not logged in
│   ├── login
│   ├── register
│   └── forgot-password
├── (onboarding)     → Logged in, not onboarded
│   └── welcome → sport → goals → days → health → summary → account
├── (tabs)           → Main app
│   ├── index        → Today (dashboard)
│   ├── plan         → Weekly Plan
│   ├── coach        → AI Coach Chat
│   ├── tracking     → Activity Tracking
│   └── profile      → Profile & Settings
└── workout/         → Modal overlay
    ├── live
    └── summary
```

## Getting Started

**Prerequisites**: Node.js 22+, Xcode (iOS) or Android Studio

```bash
git clone https://github.com/athletly/athletly-app.git
cd athletly-app
npm install
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_ANON_KEY, API_URL
```

```bash
# Development
npx expo start                  # Expo dev server
npx expo run:ios                # iOS native build
npx expo run:android            # Android native build
npx expo start --web            # Web
```

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_API_URL` | Backend API URL |

## Design System

Light theme inspired by modern fitness apps:

- **Background**: #F0F2F5 (soft gray) with #FFFFFF cards
- **Primary**: #2563EB (royal blue)
- **Gradient Header**: Blue → Indigo → Violet
- **Typography**: Inter font family
- **Components**: Rounded cards, circular gauges, color-coded sport badges

Full spec in [`docs/design-system.md`](docs/design-system.md).

## Backend

This app connects to the [Athletly Backend](https://github.com/athletly/athletly-backend) — an autonomous AI coaching agent built with FastAPI, Supabase, and Gemini 2.5 Flash.

## License

MIT
