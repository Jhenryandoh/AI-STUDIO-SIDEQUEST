import React from 'react';
import { Clock, ShieldCheck, Database, User, Bell, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { formatCountdown } from '../utils/gameLogic.ts';
import type { Player, Session } from '../types/index.ts';

interface HeaderHUDProps {
  session: Session | null;
  player: Player | null;
  timeRemainingMs: number;
  isExpired: boolean;
  onOpenProfile: () => void;
  onOpenDbSpecs: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  session,
  player,
  timeRemainingMs,
  isExpired,
  onOpenProfile,
  onOpenDbSpecs,
  soundEnabled,
  onToggleSound,
}) => {
  const isUrgent = timeRemainingMs < 30 * 60 * 1000 && timeRemainingMs > 0;
  const isStarted = session?.status === 'active';

  return (
    <header className="sticky top-0 z-40 bg-[#090a10]/95 backdrop-blur-md border-b border-purple-900/30 px-3 py-2 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-1.5">
        {/* Brand / Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-md shadow-purple-500/20">
            <div className="w-full h-full bg-[#090a10] rounded-[6px] flex items-center justify-center">
              <span className="font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-xs">
                NQ
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="font-display font-black text-xs tracking-wide text-white uppercase">
                NightQuest
              </h1>
              {session && (
                <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
                  {session.roomCode}
                </span>
              )}
            </div>
            <p className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {session ? session.mode.toUpperCase() : 'NIGHT-OUT'}
            </p>
          </div>
        </div>

        {/* Center Timer (Prominent Night Countdown) */}
        {isStarted && (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border shrink-0 transition-all ${
              isExpired
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                : isUrgent
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 animate-pulse'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
            }`}
            title="Remaining Night-Out Timer"
          >
            <Clock className={`w-3 h-3 ${isUrgent ? 'animate-spin' : ''}`} />
            <span className="font-mono font-bold text-[11px] tracking-wide">
              {isExpired ? 'TIME UP!' : formatCountdown(timeRemainingMs)}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-colors"
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            aria-label="Toggle sound effects"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Backend / Architecture Blueprint */}
          <button
            onClick={onOpenDbSpecs}
            className="w-7 h-7 rounded-lg bg-purple-950/50 border border-purple-500/40 text-purple-300 hover:text-purple-200 flex items-center justify-center transition-colors relative"
            title="View Database & API Architecture Blueprint"
            aria-label="View Database and API Architecture"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </button>

          {/* User Profile / Login */}
          <button
            onClick={onOpenProfile}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 flex items-center justify-center text-xs transition-colors"
            aria-label="Open User Profile and stats"
            title={player?.displayName || 'Profile'}
          >
            <span className="text-sm leading-none">{player?.avatar.split(' ')[0] || '⚡'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
