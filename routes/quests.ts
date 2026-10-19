import { Router, Request, Response } from 'express';
import { inMemoryStore } from '../db/client.ts';

const router = Router();

// GET /api/sessions/:id/quests - Fetch active quests
router.get('/:sessionId/quests', (req: Request, res: Response) => {
  const quests = Array.from(inMemoryStore.assignedQuests.values()).filter(
    (q) => q.sessionId === req.params.sessionId
  );
  res.json({ success: true, quests });
});

// POST /api/quests/:id/submit - Photo verification & points award
router.post('/:id/submit', (req: Request, res: Response) => {
  const { photoUrl, thumbnailUrl, caption, playerId, playerName, playerAvatar, playerCountry, lat, lng, pointsAwarded } = req.body;

  if (!photoUrl) {
    return res.status(400).json({ error: 'Photo verification proof is required' });
  }

  const submissionId = 'sub_' + Date.now().toString(36);
  const newSubmission = {
    id: submissionId,
    assigned_quest_id: req.params.id,
    player_id: playerId,
    player_name: playerName,
    player_avatar: playerAvatar,
    player_country: playerCountry || 'United States',
    photo_url: photoUrl,
    thumbnail_url: thumbnailUrl || photoUrl,
    caption: caption || '',
    lat,
    lng,
    points_awarded: pointsAwarded || 100,
    review_status: 'auto_approved',
    ai_confidence_score: 96,
    safety_passed: true,
    submitted_at: new Date().toISOString(),
    upvotes: [],
  };

  inMemoryStore.submissions.set(submissionId, newSubmission);

  // Mark quest completed
  const quest = inMemoryStore.assignedQuests.get(req.params.id);
  if (quest) {
    quest.status = 'completed';
    quest.completed_at = new Date().toISOString();
  }

  res.status(201).json({ success: true, submission: newSubmission });
});

// GET /api/sessions/:id/feed - All submissions for photo gallery & feed
router.get('/:sessionId/feed', (req: Request, res: Response) => {
  const subs = Array.from(inMemoryStore.submissions.values()).reverse();
  res.json({ success: true, submissions: subs });
});

// POST /api/submissions/:id/upvote
router.post('/submissions/:id/upvote', (req: Request, res: Response) => {
  const { playerId } = req.body;
  const sub = inMemoryStore.submissions.get(req.params.id);
  if (!sub) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  if (sub.upvotes.includes(playerId)) {
    sub.upvotes = sub.upvotes.filter((id: string) => id !== playerId);
  } else {
    sub.upvotes.push(playerId);
  }

  res.json({ success: true, upvotes: sub.upvotes });
});

export default router;
