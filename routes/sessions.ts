import { Router, Request, Response } from 'express';
import { inMemoryStore } from '../db/client.ts';

const router = Router();

// POST /api/sessions - Create new night room
router.post('/', (req: Request, res: Response) => {
  const { hostPlayerId, hostName, mode, vibe, difficulty, durationMinutes, isPublic, userCoords } = req.body;

  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const nums = '23456789';
  const codeLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const codeNums = Array.from({ length: 3 }, () => nums[Math.floor(Math.random() * nums.length)]).join('');
  const roomCode = `NQ-${codeLetters}${codeNums}`;

  const sessionId = 'session_' + Date.now().toString(36);
  const newSession = {
    id: sessionId,
    room_code: roomCode,
    host_player_id: hostPlayerId,
    host_name: hostName || 'Host Explorer',
    mode: mode || 'group',
    vibe: vibe || 'bar_crawl',
    difficulty: difficulty || 'spicy',
    duration_minutes: durationMinutes || 180,
    status: 'lobby',
    is_public: !!isPublic,
    center_lat: userCoords?.lat || 40.7580,
    center_lng: userCoords?.lng || -73.9855,
    center_area_name: 'Downtown Soho & Neon Corridor',
    player_ids: [hostPlayerId],
    created_at: new Date().toISOString(),
  };

  inMemoryStore.sessions.set(sessionId, newSession);
  res.status(201).json({ success: true, session: newSession });
});

// POST /api/sessions/join - Join by room code or radar
router.post('/join', (req: Request, res: Response) => {
  const { roomCode, playerId, playerName } = req.body;
  const normalized = (roomCode || '').trim().toUpperCase();

  let targetSession: any = null;
  for (const session of inMemoryStore.sessions.values()) {
    if (session.room_code === normalized) {
      targetSession = session;
      break;
    }
  }

  if (!targetSession) {
    // Generate synthetic join session if code not found
    targetSession = {
      id: 'session_' + normalized,
      room_code: normalized,
      host_player_id: 'p_host_remote',
      host_name: 'Alex Mercer',
      mode: 'group',
      vibe: 'bar_crawl',
      difficulty: 'spicy',
      duration_minutes: 180,
      status: 'active',
      started_at: new Date(Date.now() - 20 * 60000).toISOString(),
      ends_at: new Date(Date.now() + 160 * 60000).toISOString(),
      player_ids: ['p_host_remote', playerId],
    };
    inMemoryStore.sessions.set(targetSession.id, targetSession);
  } else {
    if (!targetSession.player_ids.includes(playerId)) {
      targetSession.player_ids.push(playerId);
    }
  }

  res.json({ success: true, session: targetSession });
});

// GET /api/sessions/:id - Fetch session details
router.get('/:id', (req: Request, res: Response) => {
  const session = inMemoryStore.sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json({ success: true, session });
});

// POST /api/sessions/:id/start - Host starts night out timer
router.post('/:id/start', (req: Request, res: Response) => {
  const session = inMemoryStore.sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const durationMs = (session.duration_minutes || 180) * 60000;
  session.status = 'active';
  session.started_at = new Date().toISOString();
  session.ends_at = new Date(Date.now() + durationMs).toISOString();

  res.json({ success: true, session });
});

// GET /api/public-rooms - Geofenced discovery
router.get('/public-radar', (req: Request, res: Response) => {
  const publicRooms = Array.from(inMemoryStore.sessions.values()).filter((s) => s.is_public);
  res.json({ success: true, rooms: publicRooms });
});

export default router;
