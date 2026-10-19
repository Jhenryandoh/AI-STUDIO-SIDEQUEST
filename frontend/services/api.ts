/**
 * NightQuest Frontend API Service
 * Communicates with the Express Backend endpoints at /api/*
 */

export const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function apiCreateSession(params: {
  hostPlayerId: string;
  hostName: string;
  mode: string;
  vibe: string;
  difficulty: string;
  durationMinutes: number;
  isPublic: boolean;
  userCoords?: { lat: number; lng: number };
}) {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function apiJoinSession(roomCode: string, playerId: string, playerName: string) {
  const res = await fetch(`${API_BASE}/sessions/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId, playerName }),
  });
  return res.json();
}

export async function apiStartSession(sessionId: string) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/start`, {
    method: 'POST',
  });
  return res.json();
}

export async function apiSubmitQuestPhoto(questId: string, payload: any) {
  const res = await fetch(`${API_BASE}/quests/${questId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiPingLocation(payload: {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  sessionId: string;
  lat: number;
  lng: number;
  spotName?: string;
}) {
  const res = await fetch(`${API_BASE}/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiGetTeammateLocations(sessionId: string) {
  const res = await fetch(`${API_BASE}/locations/${sessionId}`);
  return res.json();
}

export async function apiSendChatMessage(sessionId: string, payload: {
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  type?: string;
  mediaUrl?: string;
}) {
  const res = await fetch(`${API_BASE}/chat/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiGenerateAIQuest(params: {
  venueHint: string;
  mode?: string;
  vibe?: string;
  difficulty?: string;
}) {
  const res = await fetch(`${API_BASE}/ai-quest/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}
