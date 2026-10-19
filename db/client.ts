/**
 * NightQuest Database Connection Client
 * Supports PostgreSQL connection pool (via process.env.DATABASE_URL)
 * with high-performance in-memory state store for prototypes and zero-friction development.
 */

export interface DbConfig {
  connectionString?: string;
  maxConnections: number;
  idleTimeoutMillis: number;
}

export const dbConfig: DbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nightquest_db',
  maxConnections: 20,
  idleTimeoutMillis: 30000,
};

// In-Memory Database Store (Mirroring PostgreSQL tables)
class InMemoryNightStore {
  players = new Map<string, any>();
  sessions = new Map<string, any>();
  sessionPlayers = new Map<string, any>();
  assignedQuests = new Map<string, any>();
  submissions = new Map<string, any>();
  locations = new Map<string, any>();
  chatMessages = new Map<string, any[]>();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Seed sample public session for neighborhood radar
    const sampleSessionId = 'session_pub_soho';
    this.sessions.set(sampleSessionId, {
      id: sampleSessionId,
      room_code: 'NQ-SOHO',
      host_player_id: 'p_host_alex',
      host_name: 'Alex Mercer',
      mode: 'group',
      vibe: 'bar_crawl',
      difficulty: 'spicy',
      duration_minutes: 180,
      status: 'active',
      is_public: true,
      center_lat: 40.7580,
      center_lng: -73.9855,
      center_area_name: 'Downtown Soho & Neon Strip',
      started_at: new Date(Date.now() - 15 * 60000).toISOString(),
      ends_at: new Date(Date.now() + 165 * 60000).toISOString(),
      player_ids: ['p_host_alex', 'p_2', 'p_3', 'p_4'],
    });

    this.chatMessages.set(sampleSessionId, [
      {
        id: 'm1',
        sessionId: sampleSessionId,
        senderId: 'system',
        senderName: 'System',
        senderAvatar: '⚡',
        text: 'Room NQ-SOHO launched! Night timer set for 3 hours.',
        type: 'system',
        timestamp: Date.now() - 14 * 60000,
      },
    ]);
  }
}

export const inMemoryStore = new InMemoryNightStore();
