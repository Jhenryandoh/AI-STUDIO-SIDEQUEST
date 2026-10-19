import { Router, Request, Response } from 'express';
import { inMemoryStore } from '../db/client.ts';

const router = Router();

// GET /api/chat/:sessionId - Fetch messages
router.get('/:sessionId', (req: Request, res: Response) => {
  const messages = inMemoryStore.chatMessages.get(req.params.sessionId) || [];
  res.json({ success: true, messages });
});

// POST /api/chat/:sessionId - Send chat message
router.post('/:sessionId', (req: Request, res: Response) => {
  const { senderId, senderName, senderAvatar, text, type, mediaUrl } = req.body;

  const newMsg = {
    id: 'msg_' + Date.now().toString(36),
    sessionId: req.params.sessionId,
    senderId,
    senderName,
    senderAvatar: senderAvatar || '⚡',
    text,
    type: type || 'chat',
    mediaUrl,
    timestamp: Date.now(),
  };

  const list = inMemoryStore.chatMessages.get(req.params.sessionId) || [];
  list.push(newMsg);
  inMemoryStore.chatMessages.set(req.params.sessionId, list);

  res.status(201).json({ success: true, message: newMsg });
});

export default router;
