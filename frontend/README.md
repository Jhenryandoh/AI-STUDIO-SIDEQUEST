# NightQuest - Frontend Architecture

This folder contains the complete client-side application for **NightQuest**:
a mobile-first progressive web application with dark-mode nightlife theme, real-time GPS tracking, and AI-powered quest engine.

## Directory Structure
- `components/` - Modular UI components:
  - `HeaderHUD.tsx` - Prominent night countdown timer, logo, battery/location sync, and controls.
  - `BottomNav.tsx` - Floating neon mobile navigation tabs.
  - `OnboardingModal.tsx` - Country verification, display name, avatar picker, and returning user login.
  - `LobbyView.tsx` - Create room, enter room code, QR code modal, and nearby public room radar.
  - `QuestsView.tsx` - Active quests, secret group quest protocols, and AI custom quest generator.
  - `PhotoVerificationModal.tsx` - Device camera capture, client-side image compression, and AI validation.
  - `MapView.tsx` - Leaflet.js interactive dark nightlife map, player GPS pins, and proximity radar (< 50m).
  - `ChatView.tsx` - Live encrypted squad chat with quick nightlife action pills.
  - `LeaderboardView.tsx` - Dynamic rankings (Room, Friends, Country, Global) with 3-tier podium.
  - `FeedAndRecapView.tsx` - Live photo feed, upvotes, end-of-night MVP ceremony, and shareable summary card.
  - `SystemArchitectureModal.tsx` - In-app PostgreSQL schema, API routes, and connection blueprint viewer.
  - `ProfileModal.tsx` - Player passport, stats, and trophy case.
- `services/api.ts` - REST client for connecting to the Express backend (`/api/*`).
- `utils/` - Game logic, pure scoring calculations, Leaflet configs, and image compression tools.
- `types/` - Shared TypeScript data structures.
