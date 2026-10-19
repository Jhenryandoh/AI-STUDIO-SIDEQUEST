import React, { useState } from 'react';
import { Camera, Heart, Trophy, Share2, Sparkles, MapPin, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateFinalAwards } from '../utils/gameLogic.ts';
import type { Player, Session, Submission } from '../types/index.ts';

interface FeedAndRecapViewProps {
  player: Player;
  session: Session | null;
  submissions: Submission[];
  isNightEnded: boolean;
  onUpvoteSubmission: (submissionId: string) => void;
  onForceEndNight?: () => void;
}

export const FeedAndRecapView: React.FC<FeedAndRecapViewProps> = ({
  player,
  session,
  submissions,
  isNightEnded,
  onUpvoteSubmission,
  onForceEndNight,
}) => {
  const [viewMode, setViewMode] = useState<'feed' | 'recap'>(isNightEnded ? 'recap' : 'feed');
  const [sharedToast, setSharedToast] = useState<boolean>(false);

  // Trigger celebration confetti when entering recap mode
  const handleTriggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b'],
    });
  };

  const handleShareRecap = () => {
    if (navigator.share) {
      navigator.share({
        title: 'NightQuest Night-Out Recap',
        text: `Our squad completed ${submissions.length} quests on NightQuest tonight!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    }
  };

  // Sample teammates list for awards calculation
  const mockPlayers = [
    { id: player.id, name: player.displayName, avatar: player.avatar },
    { id: 'p2', name: 'Marcus Reed', avatar: '🕶️ Neon Viper' },
    { id: 'p3', name: 'Chloe Chen', avatar: '🍸 Velvet Ghost' },
    { id: 'p4', name: 'Kai Jensen', avatar: '🎧 Bass Phantom' },
  ];

  const awards = calculateFinalAwards(submissions, mockPlayers);

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-24">
      {/* Mode Switch Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block">
            GALLERY & RECAP
          </span>
          <h2 className="text-xl font-display font-black text-white">
            {viewMode === 'feed' ? 'Live Squad Photo Feed' : 'Night-Out Final Recap'}
          </h2>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('feed')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
              viewMode === 'feed'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Feed
          </button>
          <button
            onClick={() => {
              setViewMode('recap');
              handleTriggerCelebration();
            }}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1 ${
              viewMode === 'recap'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Recap
          </button>
        </div>
      </div>

      {/* FEED MODE */}
      {viewMode === 'feed' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6">
              <Camera className="w-10 h-10 text-cyan-400 mx-auto mb-2 opacity-60" />
              <h3 className="font-display font-bold text-white text-base">No Photo Proofs Submitted Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Whenever anyone in your room verifies a quest, their photo, location, and score appear right here!
              </p>
            </div>
          ) : (
            submissions.map((sub) => {
              const hasUpvoted = sub.upvotes?.includes(player.id);

              return (
                <div
                  key={sub.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-2.5 p-3"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{sub.playerAvatar.split(' ')[0]}</span>
                      <div>
                        <span className="text-xs font-bold text-white block">{sub.playerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {sub.playerCountry || 'Explorer'} • {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                      +{sub.pointsAwarded} pts
                    </span>
                  </div>

                  {/* Quest Title Badge */}
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-purple-950/50 border border-purple-500/30 text-xs font-bold text-purple-200">
                    🎯 {sub.questTitle}
                  </div>

                  {/* Photo Container */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
                    <img
                      src={sub.photoUrl}
                      alt={sub.caption}
                      className="w-full h-full object-cover"
                    />

                    {/* Geotag badge */}
                    {sub.lat && sub.lng && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" /> Geotagged
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  {sub.caption && (
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{sub.caption}"
                    </p>
                  )}

                  {/* Upvotes & Status Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>

                    <button
                      onClick={() => onUpvoteSubmission(sub.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        hasUpvoted
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/50'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-rose-400 text-rose-400' : ''}`} />
                      <span>{sub.upvotes?.length || 0} Upvotes</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* RECAP MODE */}
      {viewMode === 'recap' && (
        <div className="space-y-4">
          {/* Winner Showcase Card */}
          <div className="bg-gradient-to-b from-amber-950/70 via-purple-950/60 to-slate-900 border border-amber-500/40 rounded-2xl p-5 text-center relative overflow-hidden shadow-2xl">
            <span className="text-4xl block mb-2">👑</span>
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-black uppercase mb-1">
              GRAND CHAMPION OF THE NIGHT
            </div>
            <h3 className="text-2xl font-display font-black text-white">{player.displayName}</h3>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Total Points: <span className="text-amber-400 font-black">740 PTS</span> • 4 Quests Completed
            </p>

            <button
              onClick={handleShareRecap}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-400/20 inline-flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Night Recap Card
            </button>
            {sharedToast && (
              <p className="text-[11px] text-emerald-400 font-mono mt-2 animate-fade-in">
                ✓ Recap link copied to clipboard!
              </p>
            )}
          </div>

          {/* MVP Awards */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> End-of-Night Awards
            </span>
            <div className="grid grid-cols-1 gap-2">
              {awards.map((award, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{award.playerAvatar.split(' ')[0]}</span>
                    <div>
                      <span className="text-xs font-bold text-white block">{award.title}</span>
                      <span className="text-[10px] text-slate-400">{award.description}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-300 block">{award.playerName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{award.metric}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Night Photos Collage */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-cyan-400" /> Night Gallery Recap ({submissions.length} Photos)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl overflow-hidden border border-slate-800 relative aspect-square bg-black group"
                >
                  <img src={s.photoUrl} alt={s.caption} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                    <span className="text-[10px] font-bold text-white line-clamp-1">{s.questTitle}</span>
                    <span className="text-[9px] text-slate-300 font-mono">By {s.playerName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Host End Session Button */}
          {!isNightEnded && onForceEndNight && (
            <button
              onClick={onForceEndNight}
              className="w-full py-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 font-bold text-xs font-mono transition-colors"
            >
              Host: Lock Session & Finalize Night
            </button>
          )}
        </div>
      )}
    </div>
  );
};
