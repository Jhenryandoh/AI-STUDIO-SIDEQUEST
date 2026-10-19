import React, { useState } from 'react';
import { User, Award, Globe, Trophy, Shield, X, Edit2, LogOut, Check } from 'lucide-react';
import { AVATAR_OPTIONS, COUNTRY_LIST, saveStoredPlayer } from '../utils/storage.ts';
import type { Player } from '../types/index.ts';

interface ProfileModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlayer: (updated: Player) => void;
  onSwitchUser: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  player,
  isOpen,
  onClose,
  onUpdatePlayer,
  onSwitchUser,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(player?.displayName || '');
  const [country, setCountry] = useState<string>(player?.country || 'United States');
  const [avatar, setAvatar] = useState<string>(player?.avatar || AVATAR_OPTIONS[0]);

  if (!isOpen || !player) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Player = {
      ...player,
      displayName: name.trim(),
      country,
      avatar,
    };
    saveStoredPlayer(updated);
    onUpdatePlayer(updated);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-sm bg-[#0e1017] border border-purple-500/30 rounded-2xl p-5 shadow-2xl shadow-purple-950/60 my-auto space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{avatar.split(' ')[0]}</span>
            <div>
              <h2 className="text-lg font-display font-black text-white">{player.displayName}</h2>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-400" /> {player.country}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">All-Time Score</span>
            <span className="text-base font-display font-black text-cyan-400">
              {player.allTimePoints} pts
            </span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Nights Out</span>
            <span className="text-base font-display font-black text-fuchsia-400">
              {player.totalNightsPlayed} Sessions
            </span>
          </div>
        </div>

        {/* Trophies Case */}
        <div>
          <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Trophy Case
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {player.trophies.map((trophy, idx) => (
              <div
                key={idx}
                className="p-2 bg-purple-950/30 border border-purple-500/20 rounded-xl flex items-center gap-2"
              >
                <span className="text-base">🏅</span>
                <span className="text-[11px] font-bold text-purple-200">{trophy}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit or Switch User */}
        {!isEditing ? (
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={() => {
                onSwitchUser();
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-rose-950/50 border border-rose-500/30 hover:bg-rose-900/50 text-xs font-bold text-rose-300 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Switch ID
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                {COUNTRY_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-cyan-500 text-black font-extrabold text-xs"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
