import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createBackendApp } from '../backend/server.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export async function startNightQuestServer() {
  const app = createBackendApp();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode: Mount Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: rootDir,
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static assets from dist
    app.use(express.static(path.join(rootDir, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(rootDir, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ NightQuest Full-Stack Server active on http://0.0.0.0:${PORT}`);
    console.log(`📡 Backend API: http://localhost:${PORT}/api/health`);
    console.log(`🗄️ Database: PostgreSQL on port 5432 (or in-memory store)`);
  });
}

// Start if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startNightQuestServer().catch(console.error);
}
