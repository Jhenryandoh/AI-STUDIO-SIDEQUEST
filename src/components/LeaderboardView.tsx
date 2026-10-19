import React, { useState } from 'react';
import { Trophy, Globe, Users, Flame, Award, ShieldCheck, Sparkles } from 'lucide-react';
import type { LeaderboardEntry, Player, Session } from '../types/index.ts';

interface LeaderboardViewProps {
  player: Player;
  session: Session | null;
  sessionLeaderboard: LeaderboardEntry[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  player,
  session,
  sessionLeaderboard,
}) => {
  const [filter, setFilter] = useState<'session' | 'friends' | 'country' | 'global'>('session');

  // Sample data for Friends, Country, and Global
  const friendsLeaderboard: LeaderboardEntry[] = [
    {
      playerId: player.id,
      playerName: player.displayName,
      playerAvatar: player.avatar,
      country: player.country,
      points: sessionLeaderboard.find((p) => p.playerId === player.id)?.points || 420,
      questsCompleted: sessionLeaderboard.find((p) => p.playerId === player.id)?.questsCompleted || 3,
      rank: 1,
      badges: ['Squad Host', 'Night Stalker'],
      isCurrentPlayer: true,
    },
    {
      playerId: 'f1',
      playerName: 'Marcus Reed',
      playerAvatar: '🕶️ Neon Viper',
      country: 'United States',
      points: 360,
      questsCompleted: 2,
      rank: 2,
      badges: ['Speed Demon'],
    },
    {
      playerId: 'f2',
      playerName: 'Chloe Chen',
      playerAvatar: '🍸 Velvet Ghost',
      country: 'Canada',
      points: 290,
      questsCompleted: 2,
      rank: 3,
      badges: ['Shutter King'],
    },
    {
      playerId: 'f3',
      playerName: 'Elena Rostova',
      playerAvatar: '🦉 Night Owl',
      country: 'Germany',
      points: 210,
      questsCompleted: 1,
      rank: 4,
      badges: ['Icebreaker Pro'],
    },
  ];

  const countryLeaderboard: LeaderboardEntry[] = [
    {
      playerId: 'c1',
      playerName: 'Jax "Midnight" Cole',
      playerAvatar: '🔥 Sol Flare',
      country: player.country,
      points: 2840,
      questsCompleted: 18,
      rank: 1,
      badges: ['Country Champion', 'Top MVP'],
    },
    {
      playerId: 'c2',
      playerName: 'Sora Tanaka',
      playerAvatar: '⚡ Cyber Fox',
      country: player.country,
      points: 2410,
      questsCompleted: 15,
      rank: 2,
      badges: ['Secret Agent'],
    },
    {
      playerId: 'c3',
      playerName: 'Liam O’Connor',
      playerAvatar: '🎧 Bass Phantom',
      country: player.country,
      points: 1980,
      questsCompleted: 12,
      rank: 3,
      badges: ['Neon Stalker'],
    },
    {
      playerId: player.id,
      playerName: `${player.displayName} (YOU)`,
      playerAvatar: player.avatar,
      country: player.country,
      points: (player.allTimePoints || 0) + (sessionLeaderboard.find((p) => p.playerId === player.id)?.points || 420),
      questsCompleted: 4,
      rank: 8,
      badges: ['Rising Star'],
      isCurrentPlayer: true,
    },
  ];

  const globalLeaderboard: LeaderboardEntry[] = [
    {
      playerId: 'g1',
      playerName: 'NeonValkyrie_Tokyo',
      playerAvatar: '⚡ Cyber Fox',
      country: 'Japan',
      points: 8920,
      questsCompleted: 54,
      rank: 1,
      badges: ['World Grandmaster', 'VIP Explorer'],
    },
    {
      playerId: 'g2',
      playerName: 'Berlin_BassMaster',
      playerAvatar: '🎧 Bass Phantom',
      country: 'Germany',
      points: 7450,
      questsCompleted: 46,
      rank: 2,
      badges: ['Legendary Daredevil'],
    },
    {
      playerId: 'g3',
      playerName: 'SohoSpecter_NYC',
      playerAvatar: '🍸 Velvet Ghost',
      country: 'United States',
      points: 6810,
      questsCompleted: 39,
      rank: 3,
      badges: ['Mixology Maestro'],
    },
    {
      playerId: 'g4',
      playerName: 'RioCarnivalKing',
      playerAvatar: '🔥 Sol Flare',
      country: 'Brazil',
      points: 6200,
      questsCompleted: 36,
      rank: 4,
      badges: ['Party Dynamo'],
    },
    {
      playerId: player.id,
      playerName: `${player.displayName} (YOU)`,
      playerAvatar: player.avatar,
      country: player.country,
      points: (player.allTimePoints || 0) + (sessionLeaderboard.find((p) => p.playerId === player.id)?.points || 420),
      questsCompleted: 4,
      rank: 142,
      badges: ['Explorer'],
      isCurrentPlayer: true,
    },
  ];

  const activeList =
    filter === 'session'
      ? sessionLeaderboard
      : filter === 'friends'
      ? friendsLeaderboard
      : filter === 'country'
      ? countryLeaderboard
      : globalLeaderboard;

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold mb-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" /> NIGHTQUEST HIGH ROLLER RANKS
        </div>
        <h2 className="text-2xl font-display font-black text-white">Leaderboards</h2>
        <p className="text-xs text-slate-400">
          Rankings update dynamically with every verified photo proof
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-4 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setFilter('session')}
          className={`py-1.5 font-bold rounded-lg transition-all ${
            filter === 'session'
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Room
        </button>
        <button
          onClick={() => setFilter('friends')}
          className={`py-1.5 font-bold rounded-lg transition-all ${
            filter === 'friends'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Friends
        </button>
        <button
          onClick={() => setFilter('country')}
          className={`py-1.5 font-bold rounded-lg transition-all ${
            filter === 'country'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Country
        </button>
        <button
          onClick={() => setFilter('global')}
          className={`py-1.5 font-bold rounded-lg transition-all ${
            filter === 'global'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Global
        </button>
      </div>

      {/* Top 3 Podium Cards (if >= 3 players) */}
      {activeList.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 pt-2 items-end">
          {/* 2nd Place */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2.5 text-center relative order-1">
            <span className="text-lg">🥈</span>
            <div className="text-xl my-1">{activeList[1].playerAvatar.split(' ')[0]}</div>
            <span className="text-xs font-bold text-white block truncate">{activeList[1].playerName}</span>
            <span className="text-xs font-mono font-black text-cyan-400 block mt-0.5">
              {activeList[1].points} pts
            </span>
            <span className="text-[9px] text-slate-400 font-mono">{activeList[1].country}</span>
          </div>

          {/* 1st Place (Crown) */}
          <div className="bg-gradient-to-b from-amber-950/60 to-purple-950/60 border border-amber-500/50 rounded-2xl p-3 text-center relative -translate-y-2 shadow-xl shadow-amber-950/40 order-2">
            <span className="text-xl">👑</span>
            <div className="text-2xl my-1">{activeList[0].playerAvatar.split(' ')[0]}</div>
            <span className="text-xs font-black text-amber-200 block truncate">
              {activeList[0].playerName}
            </span>
            <span className="text-sm font-mono font-black text-amber-400 block mt-0.5">
              {activeList[0].points} pts
            </span>
            <span className="text-[10px] text-amber-300/80 font-mono font-bold block">
              1ST PLACE
            </span>
          </div>

          {/* 3rd Place */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2.5 text-center relative order-3">
            <span className="text-lg">🥉</span>
            <div className="text-xl my-1">{activeList[2].playerAvatar.split(' ')[0]}</div>
            <span className="text-xs font-bold text-white block truncate">{activeList[2].playerName}</span>
            <span className="text-xs font-mono font-black text-fuchsia-400 block mt-0.5">
              {activeList[2].points} pts
            </span>
            <span className="text-[9px] text-slate-400 font-mono">{activeList[2].country}</span>
          </div>
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-2">
        {activeList.map((entry) => {
          const isUser = entry.playerId === player.id;

          return (
            <div
              key={entry.playerId}
              className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                isUser
                  ? 'bg-purple-950/50 border border-purple-500/50 text-white shadow-sm'
                  : 'bg-slate-900/60 border border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-sm text-slate-400 w-5 text-center">
                  #{entry.rank}
                </span>
                <span className="text-xl">{entry.playerAvatar.split(' ')[0]}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{entry.playerName}</span>
                    {isUser && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {entry.country} • {entry.questsCompleted} quests completed
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-black text-sm text-cyan-400 block">
                  {entry.points} pts
                </span>
                {entry.badges?.[0] && (
                  <span className="text-[9px] text-purple-300 font-mono block">
                    {entry.badges[0]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
