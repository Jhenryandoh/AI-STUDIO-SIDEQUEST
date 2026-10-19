# NightQuest: Backend Architecture, Database & API Blueprint

This document details the production backend specification, PostgreSQL schema connections, ports, environment variables, photo storage pipeline, and real-time protocol for **NightQuest**.

---

## 1. Network Ports & Connection Configurations

| Service | Protocol / Driver | Default Port | Connection String Format / Environment Variable |
|---|---|---|---|
| **App Server** | HTTP / REST & WebSockets | `3000` (or `8080`) | `PORT=3000` |
| **PostgreSQL Database** | `postgres://` or `postgresql://` | `5432` | `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/nightquest_db?sslmode=prefer` |
| **Redis Cache / PubSub** (Optional for clusters) | `redis://` | `6379` | `REDIS_URL=redis://:YOUR_REDIS_PASSWORD@localhost:6379/0` |
| **Object Storage** (S3 / R2 / Supabase) | HTTPS | `443` | `STORAGE_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com`, `STORAGE_BUCKET=nightquest-photos` |
| **Gemini AI API** | HTTPS REST | `443` | `GEMINI_API_KEY=YOUR_GEMINI_KEY` (injected automatically in AI Studio) |

---

## 2. Core PostgreSQL Tables & Indexes

The full DDL is located at `src/db/schema.sql`.

1. **`players`**: Anonymous guest IDs via `device_token` with zero signup friction, returning profile sync, country, avatar, and stats.
   - *Indexes*: `idx_players_device_token`, `idx_players_country`
2. **`sessions`**: Night-out rooms with unique 4-6 char `room_code`, `mode` (`solo`/`duo`/`group`), `vibe`, `difficulty`, `duration_minutes`, `status` (`lobby`/`active`/`ended`), `started_at`, `ends_at`.
   - *Indexes*: Unique `idx_sessions_room_code`, Composite `idx_sessions_status_ends_at`
3. **`session_players`**: Many-to-many bridge between sessions and players, tracking points and active status.
   - *Indexes*: Composite Primary Key `(session_id, player_id)`
4. **`teams`**: For duo/group competitive teams.
5. **`quest_templates`**: 60+ nightlife challenges tagged by vibe, category (`photo_op`, `icebreaker`, `dare`, `trivia`, `secret`), difficulty, and group size requirement.
6. **`assigned_quests`**: Quests assigned to a player or team during a session.
7. **`submissions`**: Uploaded photos with verification metadata, latitude/longitude, country validation, and AI confidence score.
   - *Indexes*: `(session_id, submitted_at DESC)` for the live photo feed, and `(player_id)`
8. **`locations`**: Latest real-time GPS coordinates per player during active session (`player_id`, `session_id`, `lat`, `lng`, `accuracy`, `spot_name`, `updated_at`).
9. **`chat_messages`**: Live chatroom history (`session_id`, `sender_id`, `text`, `media_url`, `created_at`).
10. **`final_results`**: Archived end-of-night rankings, winner, photo count, and MVP awards.

---

## 3. Photo Storage & Processing Pipeline

1. **Client-Side Image Downsampling**:
   - Modern phone cameras take 5MB–15MB photos. Before uploading, the client resizes the image via HTML5 `<canvas>` to max dimension 1280px (~200KB) and renders a 200x200px thumbnail.
2. **Watermarking & Anti-Cheat Metadata**:
   - Client embeds a verified timestamp watermark and EXIF coordinates.
3. **Storage Provider Options**:
   - **Local Development**: Files saved to `public/uploads/` and served statically.
   - **Production**: Client calls `POST /api/upload/presign` to receive a signed S3/R2/Supabase PUT URL, uploading directly to cloud storage without burdening the application server.

---

## 4. API Endpoints Specification

### Sessions
- `POST /api/sessions` — Create a new night-out room (mode, vibe, difficulty, duration).
- `POST /api/sessions/join` — Join an existing session by `roomCode` or geofenced public room.
- `GET /api/sessions/:id` — Retrieve room status, connected players, teams, and time remaining.
- `POST /api/sessions/:id/start` — Host starts the night; computes `ends_at = started_at + (duration_minutes * 60000)`.
- `POST /api/sessions/:id/end` — Concludes the game, locks submissions, and calculates MVP awards.

### Quests & Submissions
- `GET /api/sessions/:id/quests` — Fetches active assigned quests (including secret quests for groups).
- `POST /api/quests/:id/submit` — Submits a photo proof with location and country tags. Triggers verification check and awards points.
- `POST /api/quests/:id/skip` — Skips an assigned quest and rolls a new one.
- `POST /api/ai-quest/generate` — Generates a custom localized quest tailored to the current bar/neighborhood using Gemini AI.

### Live Leaderboard & Feed
- `GET /api/sessions/:id/leaderboard` — Live session standings, plus tabs for Friends, Country, and Global leaderboards.
- `GET /api/sessions/:id/feed` — Chronological feed of photo submissions with captions and upvotes.
- `POST /api/submissions/:id/upvote` — Teammates upvote photos for bonus points.

### Geolocation & Proximity Radar
- `POST /api/sessions/:id/location` — Player pings their current GPS coords (`lat`, `lng`, `spot_name`).
- `GET /api/sessions/:id/locations` — Fetches latest locations of all players in room.
- `GET /api/public-rooms/nearby?lat=...&lng=...&radius=5000` — Discovers public lobbies within walking/driving distance.

### Chat & Recaps
- `GET /api/sessions/:id/chat` — Fetches chat messages.
- `POST /api/sessions/:id/chat` — Broadcasts chat text, quick alert, or photo pin.
- `GET /api/sessions/:id/recap` — Summary of final standings, awards (MVP, Speed Demon, Shutter King), and full photo gallery.

---

## 5. Real-Time Layer (WebSockets & Fallback Polling)

Events broadcast over Socket.IO / WebSocket channel `session:<room_id>`:
- `player_joined` — Notification when a new friend joins the lobby.
- `quest_completed` — Hype alert with photo thumbnail and points awarded.
- `secret_quest_unlocked` — Subtle sound / animation for group members.
- `location_updated` — Map markers update smoothly in real time.
- `leaderboard_updated` — Live score re-ranking.
- `session_ended` — Triggers instant lockdown and launches the celebration modal.
