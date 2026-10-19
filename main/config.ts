/**
 * Main Application Configuration
 */

export const appConfig = {
  appName: 'NightQuest',
  port: Number(process.env.PORT) || 3000,
  host: '0.0.0.0',
  isProduction: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nightquest_db',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
