# NightQuest - Main Full-Stack Orchestrator

The `main` folder orchestrates the entire application lifecycle by bridging the backend Express API with Vite's client application.

## Directory Structure
- `server.ts` - Main server entry point:
  - In development: mounts the Express backend on port 3000 alongside Vite's HMR middleware.
  - In production: serves built static assets from `dist/` alongside the `/api/*` REST endpoints.
- `config.ts` - Centralized runtime environment configuration.
