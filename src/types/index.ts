export type GameMode = 'solo' | 'duo' | 'group';

export type GameVibe = 'chill_lounge' | 'club_energy' | 'bar_crawl' | 'wild_adventure' | 'rooftop_vibes';

export type GameDifficulty = 'casual' | 'spicy' | 'savage';

export type SessionStatus = 'lobby' | 'active' | 'ended';

export interface Player {
  id: string;
  displayName: string;
  emailOrPhone?: string;
  country: string;
  countryCode?: string;
  avatar: string;
  deviceToken: string;
  createdAt: number;
  totalNightsPlayed: number;
  allTimePoints: number;
  trophies: string[];
}

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  category: 'photo_op' | 'icebreaker' | 'dare' | 'trivia' | 'secret';
  difficulty: GameDifficulty;
  points: number;
  vibeTags: GameVibe[];
  requiresGroupSize: number; // 1 for solo, 2 for duo, 3+ for group
  isSecret?: boolean;
  timeLimitMinutes?: number;
  safetyNote?: string;
}

export interface AssignedQuest {
  id: string;
  sessionId: string;
  playerId?: string;
  teamId?: string;
  templateId: string;
  title: string;
  description: string;
  category: string;
  difficulty: GameDifficulty;
  points: number;
  isSecret: boolean;
  status: 'assigned' | 'completed' | 'skipped' | 'expired';
  assignedAt: number;
  completedAt?: number;
  expiresAt?: number;
}

export interface Submission {
  id: string;
  assignedQuestId: string;
  questTitle: string;
  sessionId: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  playerCountry?: string;
  photoUrl: string;
  thumbnailUrl: string;
  caption: string;
  lat?: number;
  lng?: number;
  submittedAt: number;
  reviewStatus: 'auto_approved' | 'host_approved' | 'pending' | 'rejected';
  pointsAwarded: number;
  validationDetails?: {
    countryVerified: boolean;
    locationMatch: boolean;
    aiConfidenceScore: number;
    safetyPassed: boolean;
    tagsDetected: string[];
  };
  upvotes: string[]; // playerIds
}

export interface Team {
  id: string;
  sessionId: string;
  name: string;
  color: string;
  playerIds: string[];
}

export interface PlayerLocation {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  sessionId: string;
  lat: number;
  lng: number;
  accuracy?: number;
  updatedAt: number;
  currentSpot?: string;
}

export interface Session {
  id: string;
  roomCode: string; // e.g. "NQ-492"
  hostPlayerId: string;
  hostName: string;
  mode: GameMode;
  vibe: GameVibe;
  difficulty: GameDifficulty;
  durationMinutes: number;
  status: SessionStatus;
  startedAt?: number;
  endsAt?: number;
  maxPlayers: number;
  isPublic: boolean;
  locationCenter?: {
    lat: number;
    lng: number;
    areaName: string;
  };
  teams: Team[];
  playerIds: string[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  type: 'chat' | 'system' | 'quest_complete' | 'location_ping' | 'photo';
  timestamp: number;
  mediaUrl?: string;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  country: string;
  points: number;
  questsCompleted: number;
  rank: number;
  badges: string[];
  isCurrentPlayer?: boolean;
}

export interface FinalResult {
  sessionId: string;
  winnerPlayerId: string;
  totalPhotos: number;
  totalPointsDistributed: number;
  awards: {
    title: string;
    description: string;
    playerId: string;
    playerName: string;
    playerAvatar: string;
    metric: string;
  }[];
  rankings: LeaderboardEntry[];
}
