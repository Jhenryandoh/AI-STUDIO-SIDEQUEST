/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NightQuest Full-Stack Application Entry Point
 * Mounts Express API routes (/api/*) and Vite SPA middleware on port 3000
 */

import { startNightQuestServer } from './main/server.ts';

startNightQuestServer().catch((err) => {
  console.error('Failed to launch NightQuest server:', err);
  process.exit(1);
});
