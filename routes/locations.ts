import { Router, Request, Response } from 'express';
import { inMemoryStore } from '../db/client.ts';

const router = Router();

// POST /api/locations - Ping player GPS coordinates
router.post('/', (req: Request, res: Response) => {
  const { playerId, playerName, playerAvatar, sessionId, lat, lng, spotName } = req.body;

  const loc = {
    playerId,
    playerName,
    playerAvatar,
    sessionId: sessionId || 'demo',
    lat,
    lng,
    currentSpot: spotName || 'Cruising the venue',
    updatedAt: Date.now(),
  };

  inMemoryStore.locations.set(`${sessionId}_${playerId}`, loc);
  res.json({ success: true, location: loc });
});

// GET /api/locations/:sessionId - Fetch all active teammate coordinates
router.get('/:sessionId', (req: Request, res: Response) => {
  const allLocs = Array.from(inMemoryStore.locations.values()).filter(
    (l) => l.sessionId === req.params.sessionId || req.params.sessionId === 'demo'
  );

  // If empty, return sample teammates
  if (allLocs.length === 0) {
    const userLat = 40.7580;
    const userLng = -73.9855;
    const sampleTeammates = [
      {
        playerId: 'teammate_1',
        playerName: 'Marcus Reed',
        playerAvatar: '🕶️ Neon Viper',
        sessionId: req.params.sessionId,
        lat: userLat + 0.0018,
        lng: userLng + 0.0012,
        updatedAt: Date.now(),
        currentSpot: 'Rooftop Bar patio',
      },
      {
        playerId: 'teammate_2',
        playerName: 'Chloe Chen',
        playerAvatar: '🍸 Velvet Ghost',
        sessionId: req.params.sessionId,
        lat: userLat - 0.0015,
        lng: userLng + 0.0021,
        updatedAt: Date.now(),
        currentSpot: 'Neon Alleyway Food Truck',
      },
      {
        playerId: 'teammate_3',
        playerName: 'Kai Jensen',
        playerAvatar: '🎧 Bass Phantom',
        sessionId: req.params.sessionId,
        lat: userLat + 0.0003,
        lng: userLng - 0.0025,
        updatedAt: Date.now(),
        currentSpot: 'Arcade Lounge basement',
      },
    ];
    return res.json({ success: true, locations: sampleTeammates });
  }

  res.json({ success: true, locations: allLocs });
});

export default router;
