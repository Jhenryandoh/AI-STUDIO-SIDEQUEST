import React, { useState } from 'react';
import { Database, Server, X, Shield, Cpu, Cloud, Code, Terminal, CheckCircle2, Copy, Check } from 'lucide-react';

interface SystemArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemArchitectureModal: React.FC<SystemArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'tables' | 'apis' | 'realtime' | 'anticheat'>('overview');
  const [copiedSQL, setCopiedSQL] = useState<boolean>(false);

  if (!isOpen) return null;

  const copySchema = () => {
    const sql = `-- NightQuest PostgreSQL connection:
-- DATABASE_URL=postgresql://postgres:password@localhost:5432/nightquest_db
-- Run 'src/db/schema.sql' to initialize all tables and indexes.`;
    navigator.clipboard?.writeText(sql);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0c0e17] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl shadow-cyan-950/60 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-purple-900/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold mb-1">
              <Database className="w-3 h-3 text-cyan-400" /> SYSTEM ARCHITECTURE & POSTGRES SPEC
            </div>
            <h2 className="text-xl font-display font-black text-white">Database & API Blueprint</h2>
            <p className="text-xs text-slate-400">Connection strings, ports, tables, endpoints & anti-cheat</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 overflow-x-auto py-2.5 border-b border-slate-800 no-scrollbar text-xs font-semibold">
          {[
            { id: 'overview', label: 'Connections & Ports' },
            { id: 'tables', label: 'DB Tables (Postgres)' },
            { id: 'apis', label: 'REST Endpoints' },
            { id: 'realtime', label: 'Real-Time & Timer' },
            { id: 'anticheat', label: 'Anti-Cheat & Photos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? 'bg-cyan-500 text-black font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs text-slate-300 pr-1 font-mono">
          {activeSection === 'overview' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-cyan-400 font-bold block">1. Environment Variables & Ports</span>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <p><span className="text-purple-400 font-bold">PORT</span> = 3000 (Default HTTP & WebSockets)</p>
                  <p><span className="text-purple-400 font-bold">DATABASE_URL</span> = postgresql://postgres:password@localhost:5432/nightquest_db</p>
                  <p><span className="text-purple-400 font-bold">STORAGE_BUCKET</span> = S3 / Cloudflare R2 / Supabase Storage</p>
                  <p><span className="text-purple-400 font-bold">GEMINI_API_KEY</span> = Injected automatically for AI quest engine</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">PostgreSQL Driver Setup</span>
                  <button
                    onClick={copySchema}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
                  >
                    {copiedSQL ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSQL ? 'Copied' : 'Copy Connection'}
                  </button>
                </div>
                <pre className="text-[10px] bg-slate-900 p-2 rounded-lg text-slate-300 overflow-x-auto whitespace-pre-wrap">
{`npm install pg dotenv
// In your server connection pool:
import { Pool } from 'pg';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // concurrency limit
  idleTimeoutMillis: 30000
});`}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'tables' && (
            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-cyan-400 font-bold">players</span>: id, display_name, avatar, device_token (guest ID), country, all_time_points, created_at.
                <span className="block text-slate-400 text-[10px]">Index: idx_players_device_token, idx_players_country</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-cyan-400 font-bold">sessions</span>: id, room_code (unique), host_player_id, mode (solo/duo/group), vibe, difficulty, duration_minutes, status, started_at, ends_at.
                <span className="block text-slate-400 text-[10px]">Index: unique(room_code), (status, ends_at)</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-cyan-400 font-bold">session_players</span>: session_id, player_id, team_id, total_points, is_active, joined_at.
                <span className="block text-slate-400 text-[10px]">Composite PK: (session_id, player_id)</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-cyan-400 font-bold">quest_templates</span>: 60+ challenges with categories (photo_op, icebreaker, dare, trivia, secret).
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-cyan-400 font-bold">submissions</span>: id, assigned_quest_id, session_id, player_id, photo_url, thumbnail_url, caption, lat, lng, country, review_status, points_awarded.
                <span className="block text-slate-400 text-[10px]">Index: (session_id, submitted_at DESC)</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-cyan-400 font-bold">locations</span>: player_id, session_id, lat, lng, accuracy, spot_name, updated_at.
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-cyan-400 font-bold">final_results</span>: session_id, winner_player_id, rankings_json, awards_json, archived_at.
              </div>
            </div>
          )}

          {activeSection === 'apis' && (
            <div className="space-y-2 text-[11px]">
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-emerald-400 font-bold">POST /api/sessions</span> — Create new room
              </div>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-emerald-400 font-bold">POST /api/sessions/join</span> — Join by room code or GPS geofence
              </div>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold">GET /api/sessions/:id</span> — Room status & participants
              </div>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-emerald-400 font-bold">POST /api/sessions/:id/start</span> — Start countdown timer
              </div>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold">GET /api/sessions/:id/quests</span> — Active quests & secret quests
              </div>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-emerald-400 font-bold">POST /api/quests/:id/submit</span> — Photo upload & verification
              </div>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold">GET /api/sessions/:id/leaderboard</span> — Live score rankings
              </div>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-emerald-400 font-bold">POST /api/sessions/:id/location</span> — GPS ping for live map
              </div>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-purple-400 font-bold">POST /api/ai-quest/generate</span> — Dynamic Gemini AI quest
              </div>
            </div>
          )}

          {activeSection === 'realtime' && (
            <div className="space-y-2.5">
              <p className="text-[11px] leading-relaxed">
                Real-time updates synchronize across devices via WebSockets / Socket.IO event channels:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-cyan-300">
                <li><code className="text-white">player_joined</code> — Updates squad lobby roster</li>
                <li><code className="text-white">quest_completed</code> — Broadcasts photo & +pts sound alert</li>
                <li><code className="text-white">location_updated</code> — Updates live pins on Leaflet map</li>
                <li><code className="text-white">session_ended</code> — Triggers lock & MVP awards ceremony</li>
              </ul>
              <div className="p-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-amber-200 text-[10px]">
                ⚡ Anti-drift Timer: <code>ends_at</code> is maintained strictly on the server timestamp. Client calculates delta so clock shifts cannot cheat.
              </div>
            </div>
          )}

          {activeSection === 'anticheat' && (
            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold">1. Client-Side Image Compression</span>
                <p className="text-[10px] text-slate-400">
                  Resizes 5MB-10MB mobile camera photos down to 200KB via HTML5 canvas, generating 200x200 thumbnails.
                </p>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold">2. Country & Location Stamp Verification</span>
                <p className="text-[10px] text-slate-400">
                  Checks country match and verifies GPS coordinates are within range of venue.
                </p>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold">3. Watermarking & EXIF Simulation</span>
                <p className="text-[10px] text-slate-400">
                  Embeds verified timestamp into canvas pixels to prevent uploading stale screenshots.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
