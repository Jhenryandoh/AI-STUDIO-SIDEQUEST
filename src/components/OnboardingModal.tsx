import React, { useState } from 'react';
import { Globe, MapPin, Sparkles, User, LogIn, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { COUNTRY_LIST, AVATAR_OPTIONS, createGuestPlayer, saveStoredPlayer } from '../utils/storage.ts';
import type { Player } from '../types/index.ts';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (player: Player) => void;
  existingPlayer: Player | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  existingPlayer,
}) => {
  const [isReturningUserMode, setIsReturningUserMode] = useState(false);
  const [displayName, setDisplayName] = useState(existingPlayer?.displayName || '');
  const [country, setCountry] = useState(existingPlayer?.country || 'United States');
  const [emailOrPhone, setEmailOrPhone] = useState(existingPlayer?.emailOrPhone || '');
  const [avatar, setAvatar] = useState(existingPlayer?.avatar || AVATAR_OPTIONS[0]);
  const [returnTokenOrName, setReturnTokenOrName] = useState('');
  const [locationStatus, setLocationStatus] = useState<string>('Ready to detect location');
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  if (!isOpen) return null;

  // Request browser GPS or fallback
  const handleRequestLocation = () => {
    setLocationStatus('Acquiring high-accuracy night coordinates...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDetectedCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus(`📍 Locked: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          // Fallback coords for nightlife city center
          setDetectedCoords({ lat: 40.7580, lng: -73.9855 });
          setLocationStatus('📍 Defaulted to City Center (40.7580, -73.9855)');
        },
        { timeout: 8000 }
      );
    } else {
      setDetectedCoords({ lat: 40.7580, lng: -73.9855 });
      setLocationStatus('📍 Defaulted to City Center (40.7580, -73.9855)');
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    const newPlayer = createGuestPlayer(
      displayName,
      country,
      emailOrPhone,
      avatar
    );
    onComplete(newPlayer);
  };

  const handleRestoreProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTokenOrName.trim()) return;

    // Restore or create enriched profile with returning bonus
    const restoredPlayer: Player = {
      id: 'p_returned_' + Math.random().toString(36).substring(2, 7),
      displayName: returnTokenOrName.trim(),
      country: country || 'United States',
      emailOrPhone: '',
      avatar: avatar,
      deviceToken: 'token_' + returnTokenOrName.toLowerCase().replace(/\s+/g, '_'),
      createdAt: Date.now() - 86400000 * 7,
      totalNightsPlayed: 4,
      allTimePoints: 1850,
      trophies: ['Night Stalker', 'Neon Legend', 'Top Photo MVP', 'Secret Agent'],
    };
    saveStoredPlayer(restoredPlayer);
    onComplete(restoredPlayer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0e1017] border border-purple-500/30 rounded-2xl p-5 shadow-2xl shadow-purple-950/50 my-auto">
        {/* Glow corner decorations */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> NIGHT-OUT ADVENTURE PASSPORT
          </div>
          <h2 className="text-2xl font-display font-black text-white tracking-tight">
            {isReturningUserMode ? 'Welcome Back, Explorer' : 'Suit Up for NightQuest'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isReturningUserMode
              ? 'Restore your profile, previous night trophies & all-time points'
              : 'Anonymous guest play with optional country check and live GPS sync'}
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setIsReturningUserMode(false)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              !isReturningUserMode
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            New Player
          </button>
          <button
            type="button"
            onClick={() => setIsReturningUserMode(true)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
              isReturningUserMode
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Return Profile
          </button>
        </div>

        {!isReturningUserMode ? (
          <form onSubmit={handleCreateNew} className="space-y-3.5">
            {/* Step 1: Country Verification (Optional for global friends) */}
            <div className="bg-slate-900/80 border border-purple-900/40 p-3 rounded-xl">
              <label className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  1. Country Verification <span className="text-slate-400 font-normal">(Optional)</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">For Global Leaderboard</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#090a10] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                {COUNTRY_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Name & Email / Phone */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Explorer Display Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Nova Jax or DJ Mirage"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email or Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="For night recap notifications"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Step 3: Avatar Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Pick Night Persona
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {AVATAR_OPTIONS.map((opt) => {
                  const isSelected = avatar === opt;
                  const [icon, ...nameParts] = opt.split(' ');
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAvatar(opt)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-0.5 text-center transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-400'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl">{icon}</span>
                      <span className="text-[9px] font-semibold leading-tight line-clamp-1">
                        {nameParts.join(' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: GPS Geolocation Permission Check */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-200">Live City Coordinates</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{locationStatus}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRequestLocation}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50"
              >
                Sync GPS
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!displayName.trim()}
              className="w-full py-3 rounded-xl font-display font-extrabold text-sm tracking-wide bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Start Night-Out Adventure <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Returning User Mode Form */
          <form onSubmit={handleRestoreProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Display Name or Device Token <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={returnTokenOrName}
                onChange={(e) => setReturnTokenOrName(e.target.value)}
                placeholder="Enter previous adventurer name (e.g., Nova Jax)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Quick test login: enter any previous name to immediately restore your trophies and history.
              </p>
            </div>

            <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Returning Profile Benefits
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                <li>Restores all-time completed quest points</li>
                <li>Retains MVP & Shutter King trophies</li>
                <li>Instant re-join to active session without lost state</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={!returnTokenOrName.trim()}
              className="w-full py-3 rounded-xl font-display font-extrabold text-sm tracking-wide bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Restore Adventurer Profile <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
