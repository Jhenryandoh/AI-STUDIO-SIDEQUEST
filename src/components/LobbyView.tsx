import React, { useState } from 'react';
import { Users, User, Flame, Clock, Radio, QrCode, Copy, Check, Play, MapPin, Compass, Sparkles, PlusCircle } from 'lucide-react';
import type { GameDifficulty, GameMode, GameVibe, Player, Session } from '../types/index.ts';
import { generateRoomCode } from '../utils/gameLogic.ts';
import { getSamplePublicRooms } from '../utils/storage.ts';

interface LobbyViewProps {
  player: Player;
  currentSession: Session | null;
  onCreateSession: (settings: {
    mode: GameMode;
    vibe: GameVibe;
    difficulty: GameDifficulty;
    durationMinutes: number;
    isPublic: boolean;
  }) => void;
  onJoinSession: (roomCode: string) => void;
  onStartNight: () => void;
  userCoords?: { lat: number; lng: number };
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  player,
  currentSession,
  onCreateSession,
  onJoinSession,
  onStartNight,
  userCoords = { lat: 40.7580, lng: -73.9855 },
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'public'>('create');
  const [mode, setMode] = useState<GameMode>('group');
  const [vibe, setVibe] = useState<GameVibe>('bar_crawl');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('spicy');
  const [durationMinutes, setDurationMinutes] = useState<number>(180); // 3 hours
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [inputCode, setInputCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  // Available nearby public rooms
  const nearbyPublicRooms = getSamplePublicRooms(userCoords.lat, userCoords.lng);

  const handleCopyCode = () => {
    if (currentSession) {
      navigator.clipboard?.writeText(currentSession.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If already in an active session lobby
  if (currentSession) {
    const isHost = currentSession.hostPlayerId === player.id;

    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Night Out Room Header */}
        <div className="bg-gradient-to-b from-purple-950/60 to-slate-900/90 border border-purple-500/30 rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/30 text-purple-200 text-xs font-mono font-bold mb-3">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> SQUAD LOBBY ASSEMBLED
          </div>

          <h2 className="text-3xl font-display font-black text-white tracking-tight">
            Room: <span className="text-cyan-400 font-mono">{currentSession.roomCode}</span>
          </h2>

          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Share this code or QR with friends on your night out to join the live tracking & quest battle.
          </p>

          {/* Quick Actions */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              {copied ? 'Code Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-xs font-bold text-purple-200 border border-purple-500/40 transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-fuchsia-400" /> Show QR
            </button>
          </div>
        </div>

        {/* Session Vitals */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Mode</span>
            <span className="text-xs font-bold text-cyan-400 uppercase">{currentSession.mode}</span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Vibe</span>
            <span className="text-xs font-bold text-fuchsia-400 capitalize">
              {currentSession.vibe.replace('_', ' ')}
            </span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Night Timer</span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {currentSession.durationMinutes / 60}h Limit
            </span>
          </div>
        </div>

        {/* Players In Lobby */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" /> Active Squad (4 Connected)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live Ready
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{player.avatar.split(' ')[0]}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{player.displayName}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      YOU
                    </span>
                    {isHost && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                        HOST
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {player.country} • Ready
                  </span>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Teammates */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🕶️</span>
                <div>
                  <span className="text-xs font-semibold text-slate-200">Marcus Reed</span>
                  <span className="block text-[10px] text-slate-400 font-mono">Synced • 30m away</span>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍸</span>
                <div>
                  <span className="text-xs font-semibold text-slate-200">Chloe Chen</span>
                  <span className="block text-[10px] text-slate-400 font-mono">Synced • In Soho</span>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎧</span>
                <div>
                  <span className="text-xs font-semibold text-slate-200">Kai Jensen</span>
                  <span className="block text-[10px] text-slate-400 font-mono">Synced • Joined</span>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* Start Button */}
        {isHost ? (
          <button
            onClick={onStartNight}
            className="w-full py-3.5 rounded-2xl font-display font-black text-sm tracking-wide bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black shadow-xl shadow-emerald-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" /> LAUNCH NIGHTQUEST (START TIMER)
          </button>
        ) : (
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <p className="text-xs text-amber-300 font-mono animate-pulse">
              ⏳ Waiting for the Host ({currentSession.hostName}) to start the night out...
            </p>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="bg-[#0f111a] border border-purple-500/40 rounded-2xl p-6 text-center max-w-xs w-full shadow-2xl">
              <h3 className="font-display font-extrabold text-white text-lg mb-1">Squad Pass</h3>
              <p className="text-xs text-slate-400 mb-4">Let friends scan to join room instantly</p>
              
              {/* Synthetic SVG QR pattern */}
              <div className="bg-white p-3 rounded-xl inline-block mx-auto mb-4 shadow-inner">
                <svg className="w-44 h-44" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#ffffff" />
                  {/* Outer corner squares */}
                  <rect x="10" y="10" width="25" height="25" fill="#000000" />
                  <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                  <rect x="18" y="18" width="9" height="9" fill="#000000" />

                  <rect x="65" y="10" width="25" height="25" fill="#000000" />
                  <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                  <rect x="73" y="18" width="9" height="9" fill="#000000" />

                  <rect x="10" y="65" width="25" height="25" fill="#000000" />
                  <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                  <rect x="18" y="73" width="9" height="9" fill="#000000" />

                  {/* QR Matrix dots */}
                  <rect x="42" y="15" width="6" height="6" fill="#000000" />
                  <rect x="52" y="18" width="6" height="6" fill="#000000" />
                  <rect x="42" y="28" width="6" height="6" fill="#000000" />
                  <rect x="40" y="42" width="20" height="20" fill="#a855f7" />
                  <rect x="45" y="45" width="10" height="10" fill="#ffffff" />
                  <rect x="48" y="48" width="4" height="4" fill="#000000" />

                  <rect x="68" y="45" width="6" height="6" fill="#000000" />
                  <rect x="78" y="55" width="6" height="6" fill="#000000" />
                  <rect x="68" y="68" width="6" height="6" fill="#000000" />
                  <rect x="80" y="78" width="6" height="6" fill="#000000" />

                  <rect x="25" y="45" width="6" height="6" fill="#000000" />
                  <rect x="15" y="55" width="6" height="6" fill="#000000" />
                  <rect x="42" y="72" width="6" height="6" fill="#000000" />
                  <rect x="52" y="80" width="6" height="6" fill="#000000" />
                </svg>
              </div>

              <div className="font-mono font-bold text-lg text-cyan-400 mb-4 tracking-widest">
                {currentSession.roomCode}
              </div>

              <button
                onClick={() => setShowQRModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700"
              >
                Close QR Code
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not in a session yet: Create, Join Code, or Explore Nearby Public Rooms
  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-tr from-purple-900/50 via-slate-900 to-cyan-950/40 border border-purple-500/30 rounded-2xl p-5 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> NIGHTOUT GAME ENGINE
        </div>
        <h2 className="text-2xl font-display font-black text-white">Assemble Your Squad</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Start a room, join with a code, or hop into a public room in your neighborhood.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('create')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'create'
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Create Room
        </button>
        <button
          onClick={() => setActiveTab('join')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'join'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Join Code
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'public'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" /> Nearby
        </button>
      </div>

      {/* CREATE TAB */}
      {activeTab === 'create' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
          {/* Game Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Game Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'solo', label: 'Solo', icon: User, desc: 'Lone Wolf' },
                { id: 'duo', label: 'Duo', icon: Users, desc: 'Partner Co-Op' },
                { id: 'group', label: 'Group', icon: Users, desc: 'Squad & Secret Quests' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id as GameMode)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    mode === item.id
                      ? 'border-purple-500 bg-purple-950/40 text-purple-200 ring-1 ring-purple-400'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <item.icon className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                  <span className="block text-xs font-bold">{item.label}</span>
                  <span className="text-[9px] text-slate-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vibe Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Night Vibe</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'bar_crawl', label: '🍻 Bar Crawl', desc: 'Pubs, coasters & toasts' },
                { id: 'club_energy', label: '⚡ Club Energy', desc: 'High beat, dance circles' },
                { id: 'chill_lounge', label: '🍸 Chill Lounge', desc: 'Cocktails, deep talk' },
                { id: 'wild_adventure', label: '🔥 Wild Adventure', desc: 'Spontaneous street dares' },
                { id: 'rooftop_vibes', label: '🌙 Rooftop & Skyline', desc: 'Scenic views & photos' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setVibe(item.id as GameVibe)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    vibe === item.id
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-400'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-200">{item.label}</span>
                  <span className="text-[10px] text-slate-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Challenge Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'casual', label: 'Casual', color: 'text-emerald-400', desc: '1.0x Pts' },
                { id: 'spicy', label: 'Spicy', color: 'text-amber-400', desc: '1.5x Pts' },
                { id: 'savage', label: 'Savage', color: 'text-rose-400', desc: '2.0x Pts' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDifficulty(item.id as GameDifficulty)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    difficulty === item.id
                      ? 'border-fuchsia-500 bg-fuchsia-950/40 text-fuchsia-200 ring-1 ring-fuchsia-500'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className={`block text-xs font-bold ${item.color}`}>{item.label}</span>
                  <span className="text-[10px] font-mono text-slate-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Limit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Overall Night Timer
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {durationMinutes / 60} Hours ({durationMinutes} mins)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[60, 120, 180, 240].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all ${
                    durationMinutes === mins
                      ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400'
                  }`}
                >
                  {mins / 60} hr{mins > 60 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Public Lobby Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Open to Nearby Public Players</span>
              <span className="text-[10px] text-slate-400">Visible on the local map within walking radius</span>
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          <button
            onClick={() =>
              onCreateSession({
                mode,
                vibe,
                difficulty,
                durationMinutes,
                isPublic,
              })
            }
            className="w-full py-3.5 rounded-xl font-display font-extrabold text-sm tracking-wide bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white shadow-xl shadow-purple-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> CREATE NIGHTQUEST ROOM
          </button>
        </div>
      )}

      {/* JOIN TAB */}
      {activeTab === 'join' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Enter 6-Character Room Code
            </label>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g., NQ-SOHO or NQ-AB123"
              className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl px-4 py-3 text-base font-mono font-bold text-center tracking-widest text-cyan-300 placeholder-slate-600 uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <button
            onClick={() => onJoinSession(inputCode)}
            disabled={!inputCode.trim()}
            className="w-full py-3.5 rounded-xl font-display font-extrabold text-sm tracking-wide bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            JOIN SESSION NOW
          </button>
        </div>
      )}

      {/* NEARBY PUBLIC ROOMS (Geofenced within user coordinates) */}
      {activeTab === 'public' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Nearby Active Rooms in Your Area
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Within 5 km</span>
          </div>
          <p className="text-[11px] text-slate-400">
            These public sessions are happening right now around your GPS coordinates.
          </p>

          <div className="space-y-2.5 pt-1">
            {nearbyPublicRooms.map((room) => (
              <div
                key={room.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 transition-all flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-white">{room.roomCode}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 mt-0.5">
                    {room.locationCenter?.areaName || 'Downtown'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Host: {room.hostName} • {room.vibe.replace('_', ' ')} • {room.playerIds.length} players
                  </p>
                </div>

                <button
                  onClick={() => onJoinSession(room.roomCode)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold transition-all shadow"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
