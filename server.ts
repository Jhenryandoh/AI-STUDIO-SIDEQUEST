import express, { Express, Request, Response } from 'express';
import sessionRoutes from './routes/sessions.ts';
import questRoutes from './routes/quests.ts';
import locationRoutes from './routes/locations.ts';
import chatRoutes from './routes/chat.ts';
import aiRoutes from './routes/ai.ts';

export function createBackendApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'online',
      service: 'NightQuest Backend API',
      timestamp: new Date().toISOString(),
      ports: {
        http: 3000,
        postgres: 5432,
      },
    });
  });

  // Mount API Endpoints
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/quests', questRoutes);
  app.use('/api/locations', locationRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/ai-quest', aiRoutes);

  return app;
}

// Standalone start when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createBackendApp();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`⚡ NightQuest Backend Server listening on http://0.0.0.0:${PORT}`);
  });
}
