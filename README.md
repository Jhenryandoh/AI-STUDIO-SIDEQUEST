# NightQuest - Backend Architecture

The backend provides the REST and real-time API services for NightQuest, backed by PostgreSQL.

## Directory Structure
- `server.ts` - Express app setup, CORS, JSON limits (20MB for mobile photo proofs), healthcheck, and route registration.
- `routes/`
  - `sessions.ts` - Room creation (`POST /api/sessions`), join by code (`POST /api/sessions/join`), and public nearby radar.
  - `quests.ts` - Active challenges (`GET /api/sessions/:id/quests`), photo verification submissions (`POST /api/quests/:id/submit`), and feed.
  - `locations.ts` - Player GPS coordinates (`POST /api/locations`), squad location tracking, and proximity detection.
  - `chat.ts` - Group chat messaging (`POST /api/chat/:sessionId`).
  - `ai.ts` - Dynamic nightlife quest generation using Gemini API (`POST /api/ai-quest/generate`).
- `db/`
  - `schema.sql` - Complete PostgreSQL 14+ schema with 10 tables and indexes on `room_code`, `(session_id, player_id)`, and `(session_id, submitted_at DESC)`.
  - `client.ts` - Database connection pool (`DATABASE_URL`) with seamless in-memory fallback.

## Default Ports & Connection Strings
- **HTTP/REST Port**: `3000`
- **PostgreSQL Port**: `5432`
- **Connection**: `DATABASE_URL=postgresql://postgres:password@localhost:5432/nightquest_db`
