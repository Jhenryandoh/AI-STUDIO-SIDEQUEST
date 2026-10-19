-- =========================================================================
-- NIGHTQUEST DATABASE SCHEMA (PostgreSQL 14+)
-- Default Port: 5432
-- Connection URL: postgresql://postgres:password@localhost:5432/nightquest_db
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(64) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255) NOT NULL DEFAULT '⚡ Cyber Fox',
    device_token VARCHAR(255) NOT NULL UNIQUE,
    email_or_phone VARCHAR(255),
    country VARCHAR(100) DEFAULT 'United States',
    country_code VARCHAR(8),
    total_nights_played INTEGER NOT NULL DEFAULT 0,
    all_time_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_players_device_token ON players(device_token);
CREATE INDEX IF NOT EXISTS idx_players_country ON players(country);

-- 2. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) PRIMARY KEY,
    room_code VARCHAR(12) NOT NULL UNIQUE,
    host_player_id VARCHAR(64) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('solo', 'duo', 'group')),
    vibe VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('casual', 'spicy', 'savage')),
    duration_minutes INTEGER NOT NULL DEFAULT 120,
    status VARCHAR(20) NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'active', 'ended')),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    center_area_name VARCHAR(255),
    started_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_room_code ON sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_sessions_status_ends_at ON sessions(status, ends_at);

-- 3. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(30) NOT NULL DEFAULT '#a855f7',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teams_session_id ON teams(session_id);

-- 4. SESSION_PLAYERS TABLE
CREATE TABLE IF NOT EXISTS session_players (
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    player_id VARCHAR(64) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id VARCHAR(64) REFERENCES teams(id) ON DELETE SET NULL,
    total_points INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_session_players_lookup ON session_players(session_id, player_id);

-- 5. QUEST_TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS quest_templates (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('photo_op', 'icebreaker', 'dare', 'trivia', 'secret')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('casual', 'spicy', 'savage')),
    points INTEGER NOT NULL DEFAULT 100,
    vibe_tags TEXT[] NOT NULL DEFAULT '{}',
    requires_group_size INTEGER NOT NULL DEFAULT 1,
    is_secret BOOLEAN NOT NULL DEFAULT FALSE,
    safety_note TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_quest_templates_category ON quest_templates(category, difficulty);

-- 6. ASSIGNED_QUESTS TABLE
CREATE TABLE IF NOT EXISTS assigned_quests (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    player_id VARCHAR(64) REFERENCES players(id) ON DELETE SET NULL,
    team_id VARCHAR(64) REFERENCES teams(id) ON DELETE SET NULL,
    quest_template_id VARCHAR(64) REFERENCES quest_templates(id),
    custom_title VARCHAR(200),
    custom_description TEXT,
    points INTEGER NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    is_secret BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'completed', 'skipped', 'expired')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_assigned_quests_session ON assigned_quests(session_id, status);

-- 7. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(64) PRIMARY KEY,
    assigned_quest_id VARCHAR(64) NOT NULL REFERENCES assigned_quests(id) ON DELETE CASCADE,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    player_id VARCHAR(64) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    photo_url VARCHAR(1024) NOT NULL,
    thumbnail_url VARCHAR(1024) NOT NULL,
    caption TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    country VARCHAR(100),
    review_status VARCHAR(30) NOT NULL DEFAULT 'auto_approved' CHECK (review_status IN ('auto_approved', 'host_approved', 'pending', 'rejected')),
    points_awarded INTEGER NOT NULL DEFAULT 0,
    ai_confidence_score NUMERIC(5,2),
    safety_passed BOOLEAN DEFAULT TRUE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submissions_session_time ON submissions(session_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_player ON submissions(player_id);

-- 8. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    player_id VARCHAR(64) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    spot_name VARCHAR(150),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_locations_session ON locations(session_id, updated_at DESC);

-- 9. CHAT_MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    sender_id VARCHAR(64) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    message_type VARCHAR(30) NOT NULL DEFAULT 'chat',
    text TEXT NOT NULL,
    media_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at ASC);

-- 10. FINAL_RESULTS TABLE
CREATE TABLE IF NOT EXISTS final_results (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    winner_player_id VARCHAR(64) REFERENCES players(id),
    total_photos INTEGER NOT NULL DEFAULT 0,
    total_points_distributed INTEGER NOT NULL DEFAULT 0,
    rankings_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    awards_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_final_results_session ON final_results(session_id);
