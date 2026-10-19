import type { Player, Session, AssignedQuest, Submission, ChatMessage, PlayerLocation } from '../types/index.ts';

const PLAYER_KEY = 'nightquest_player_profile';
const SESSION_KEY = 'nightquest_active_session';
const OFFLINE_QUEUE_KEY = 'nightquest_offline_queue';

export const AVATAR_OPTIONS = [
  '⚡ Cyber Fox',
  '🕶️ Neon Viper',
  '🍸 Velvet Ghost',
  '🦉 Night Owl',
  '🚀 Stellar Punk',
  '🎧 Bass Phantom',
  '🔥 Sol Flare',
  '🌙 Lunar Shadow',
];

export const COUNTRY_LIST = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Spain',
  'Italy',
  'Netherlands',
  'Brazil',
  'Mexico',
  'Singapore',
  'South Africa',
  'Sweden',
  'Other / Global',
];

export function getStoredPlayer(): Player | null {
  try {
    const raw = localStorage.getItem(PLAYER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredPlayer(player: Player): void {
  try {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
  } catch (e) {
    console.error('Failed to save player to localStorage', e);
  }
}

export function createGuestPlayer(name: string, country: string = 'United States', emailOrPhone?: string, avatar?: string): Player {
  const token = 'guest_' + Math.random().toString(36).substring(2, 10);
  const newPlayer: Player = {
    id: 'p_' + Date.now().toString(36),
    displayName: name.trim() || 'NightExplorer',
    country: country || 'United States',
    emailOrPhone: emailOrPhone?.trim() || '',
    avatar: avatar || AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
    deviceToken: token,
    createdAt: Date.now(),
    totalNightsPlayed: 1,
    allTimePoints: 0,
    trophies: ['First Night Out', 'Night Stalker'],
  };
  saveStoredPlayer(newPlayer);
  return newPlayer;
}

// Sample nearby public rooms for instant exploration
export function getSamplePublicRooms(userLat: number = 40.7306, userLng: number = -73.9352): Session[] {
  return [
    {
      id: 'session_pub_soho',
      roomCode: 'NQ-SOHO',
      hostPlayerId: 'p_host_alex',
      hostName: 'Alex Mercer',
      mode: 'group',
      vibe: 'bar_crawl',
      difficulty: 'spicy',
      durationMinutes: 180,
      status: 'active',
      startedAt: Date.now() - 3600000,
      endsAt: Date.now() + 7200000,
      maxPlayers: 12,
      isPublic: true,
      locationCenter: {
        lat: userLat + 0.0035,
        lng: userLng - 0.002,
        areaName: 'Downtown Neon Corridor',
      },
      teams: [],
      playerIds: ['p_host_alex', 'p_2', 'p_3', 'p_4'],
    },
    {
      id: 'session_pub_rooftop',
      roomCode: 'NQ-ROOF',
      hostPlayerId: 'p_host_elena',
      hostName: 'Elena Rostova',
      mode: 'group',
      vibe: 'rooftop_vibes',
      difficulty: 'casual',
      durationMinutes: 120,
      status: 'active',
      startedAt: Date.now() - 1800000,
      endsAt: Date.now() + 5400000,
      maxPlayers: 8,
      isPublic: true,
      locationCenter: {
        lat: userLat - 0.004,
        lng: userLng + 0.005,
        areaName: 'Sky Lounge District',
      },
      teams: [],
      playerIds: ['p_host_elena', 'p_5', 'p_6'],
    },
  ];
}

// Mock active players around the user for live tracking demo
export function getInitialTeammateLocations(userLat: number, userLng: number): PlayerLocation[] {
  return [
    {
      playerId: 'teammate_1',
      playerName: 'Marcus Reed',
      playerAvatar: '🕶️ Neon Viper',
      sessionId: 'current',
      lat: userLat + 0.0018,
      lng: userLng + 0.0012,
      updatedAt: Date.now(),
      currentSpot: 'Rooftop Bar patio',
    },
    {
      playerId: 'teammate_2',
      playerName: 'Chloe Chen',
      playerAvatar: '🍸 Velvet Ghost',
      sessionId: 'current',
      lat: userLat - 0.0015,
      lng: userLng + 0.0021,
      updatedAt: Date.now(),
      currentSpot: 'Neon Alleyway Food Truck',
    },
    {
      playerId: 'teammate_3',
      playerName: 'Kai Jensen',
      playerAvatar: '🎧 Bass Phantom',
      sessionId: 'current',
      lat: userLat + 0.0003,
      lng: userLng - 0.0025,
      updatedAt: Date.now(),
      currentSpot: 'Arcade Lounge basement',
    },
  ];
}
