import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// POST /api/ai-quest/generate
router.post('/generate', async (req: Request, res: Response) => {
  const { venueHint, mode, vibe, difficulty } = req.body;
  const promptVenue = venueHint || 'Neighborhood Cocktail Lounge';

  // Check if GEMINI_API_KEY is present
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a nightlife party game designer for NightQuest.
Design ONE fun, lighthearted, safe side quest challenge for friends at: "${promptVenue}".
Vibe: ${vibe || 'party'}. Mode: ${mode || 'group'}.
Rules: Must be safe, no trespassing, no heavy drinking stunts.
Output strictly JSON matching this structure:
{
  "title": "Short punchy quest title (under 5 words)",
  "description": "Clear 1-sentence challenge instruction",
  "category": "photo_op" | "icebreaker" | "dare" | "trivia",
  "points": 150
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return res.json({
          success: true,
          quest: {
            id: 'ai_' + Date.now().toString(36),
            title: `🤖 ${parsed.title}`,
            description: parsed.description,
            category: parsed.category || 'photo_op',
            difficulty: difficulty || 'spicy',
            points: parsed.points || 160,
            isSecret: false,
          },
        });
      }
    } catch (e) {
      console.warn('Gemini dynamic quest generation fallback:', e);
    }
  }

  // Smart procedural fallback
  const proceduralQuests = [
    {
      title: `The ${promptVenue.split(' ')[0] || 'Midnight'} Secret Whisper`,
      description: `Ask the server or staff at ${promptVenue} what their favorite off-menu creation is.`,
      category: 'icebreaker',
      points: 150,
    },
    {
      title: `Neon Glow at ${promptVenue.split(' ')[0] || 'The Venue'}`,
      description: `Capture the squad illuminated by the brightest ambient light inside ${promptVenue}.`,
      category: 'photo_op',
      points: 140,
    },
    {
      title: `Table Geometry: ${promptVenue.split(' ')[0] || 'Spot'}`,
      description: `Build a 3-tier coaster structure at your table and get a snapshot before it tumbles!`,
      category: 'dare',
      points: 180,
    },
  ];

  const picked = proceduralQuests[Math.floor(Math.random() * proceduralQuests.length)];
  return res.json({
    success: true,
    quest: {
      id: 'ai_' + Date.now().toString(36),
      title: `🤖 ${picked.title}`,
      description: picked.description,
      category: picked.category,
      difficulty: difficulty || 'spicy',
      points: picked.points,
      isSecret: false,
    },
  });
});

export default router;
