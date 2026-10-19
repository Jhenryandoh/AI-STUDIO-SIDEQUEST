import React, { useState } from 'react';
import { Sparkles, Camera, SkipForward, Eye, EyeOff, ShieldAlert, Zap, Clock, Wand2, Star, CheckCircle } from 'lucide-react';
import type { AssignedQuest, Player, Session } from '../types/index.ts';

interface QuestsViewProps {
  session: Session;
  player: Player;
  assignedQuests: AssignedQuest[];
  onOpenCompleteModal: (quest: AssignedQuest) => void;
  onSkipQuest: (questId: string) => void;
  onGenerateAIQuest: (venueHint: string) => Promise<void>;
  onTriggerSecretQuest: () => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  session,
  player,
  assignedQuests,
  onOpenCompleteModal,
  onSkipQuest,
  onGenerateAIQuest,
  onTriggerSecretQuest,
}) => {
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [venueHint, setVenueHint] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [showAIPrompt, setShowAIPrompt] = useState<boolean>(false);

  const regularQuests = assignedQuests.filter((q) => !q.isSecret && q.status === 'assigned');
  const secretQuests = assignedQuests.filter((q) => q.isSecret && q.status === 'assigned');
  const completedCount = assignedQuests.filter((q) => q.status === 'completed').length;

  const toggleRevealSecret = (questId: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [questId]: !prev[questId] }));
  };

  const handleGenerate = async () => {
    if (isGeneratingAI) return;
    setIsGeneratingAI(true);
    try {
      await onGenerateAIQuest(venueHint || 'Neighborhood Nightclub & Cocktail Bar');
      setShowAIPrompt(false);
      setVenueHint('');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-20">
      {/* Top Banner / Session Summary */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/70 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block">
            NIGHT OPS DASHBOARD
          </span>
          <h2 className="text-xl font-display font-black text-white">Active Challenges</h2>
          <p className="text-xs text-slate-400">
            {regularQuests.length + secretQuests.length} assigned • {completedCount} verified tonight
          </p>
        </div>

        {/* AI Quest Button */}
        <button
          onClick={() => setShowAIPrompt(!showAIPrompt)}
          className="px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-xs font-bold text-purple-200 border border-purple-500/40 flex items-center gap-1.5 transition-all shadow-sm"
          title="Spawn AI-tailored quest for current venue"
        >
          <Wand2 className="w-3.5 h-3.5 text-cyan-400" /> +AI Quest
        </button>
      </div>

      {/* AI Custom Quest Input Popup */}
      {showAIPrompt && (
        <div className="bg-slate-900 border border-purple-500/50 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI Dynamic Quest Generator
            </span>
            <button
              onClick={() => setShowAIPrompt(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Tell the AI where your squad is right now (e.g., "Rooftop lounge", "Karaoke dive bar", "Taco stand") to generate a tailor-made mission!
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={venueHint}
              onChange={(e) => setVenueHint(e.target.value)}
              placeholder="e.g. Neon arcade bar in Brooklyn"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleGenerate}
              disabled={isGeneratingAI}
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all disabled:opacity-50"
            >
              {isGeneratingAI ? 'Thinking...' : 'Generate'}
            </button>
          </div>
        </div>
      )}

      {/* SECRET QUEST SECTION (For Groups) */}
      {session.mode === 'group' && (
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-[#100712] to-black p-4 shadow-xl shadow-rose-950/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider">
                SECRET SQUAD PROTOCOL
              </span>
            </div>
            {secretQuests.length === 0 && (
              <button
                onClick={onTriggerSecretQuest}
                className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900"
              >
                Trigger Secret Quest
              </button>
            )}
          </div>

          {secretQuests.length > 0 ? (
            secretQuests.map((quest) => {
              const isRevealed = revealedSecrets[quest.id];
              return (
                <div key={quest.id} className="space-y-3 mt-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-extrabold text-white text-base">
                        {isRevealed ? quest.title : '🔒 TOP SECRET MISSION (TAP TO REVEAL)'}
                      </h3>
                      <p className="text-xs text-rose-200/80 mt-1 font-mono">
                        {isRevealed
                          ? quest.description
                          : 'A stealth challenge has been unlocked for your group. Keep it quiet from unsuspecting bystanders!'}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full font-mono text-xs font-black text-rose-300 bg-rose-950/80 border border-rose-500/40 shrink-0">
                      +{quest.points} PTS
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => toggleRevealSecret(quest.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-rose-400" />}
                      {isRevealed ? 'Hide Intel' : 'Reveal Intel'}
                    </button>

                    {isRevealed && (
                      <button
                        onClick={() => onOpenCompleteModal(quest)}
                        className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" /> Complete Secret Quest
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 mt-1">
              Secret group quests appear randomly throughout the night during group play. You can also trigger one manually!
            </p>
          )}
        </div>
      )}

      {/* REGULAR ACTIVE QUESTS */}
      <div className="space-y-3">
        {regularQuests.map((quest) => {
          const categoryColors: Record<string, string> = {
            photo_op: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30',
            icebreaker: 'text-fuchsia-400 bg-fuchsia-950/60 border-fuchsia-500/30',
            dare: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
            trivia: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
          };

          const diffBadge = {
            casual: 'text-emerald-400',
            spicy: 'text-amber-400',
            savage: 'text-rose-400',
          }[quest.difficulty];

          return (
            <div
              key={quest.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 transition-all space-y-3 relative overflow-hidden group shadow-md"
            >
              {/* Category & Points Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                      categoryColors[quest.category] || 'text-slate-400 bg-slate-800 border-slate-700'
                    }`}
                  >
                    {quest.category.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase ${diffBadge}`}>
                    • {quest.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-cyan-300 font-mono font-black text-sm bg-cyan-950/50 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                  <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                  +{quest.points}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-display font-extrabold text-white group-hover:text-cyan-200 transition-colors">
                  {quest.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {quest.description}
                </p>
              </div>

              {/* Actions: Complete (Camera) & Skip */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => onOpenCompleteModal(quest)}
                  aria-label={`Complete quest ${quest.title}`}
                  className="flex-1 py-2.5 rounded-xl font-display font-bold text-xs bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white shadow-md shadow-purple-600/25 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" /> COMPLETE QUEST (PHOTO PROOF)
                </button>

                <button
                  onClick={() => onSkipQuest(quest.id)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
                  title="Skip quest (reroll)"
                  aria-label="Skip quest"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {regularQuests.length === 0 && (
          <div className="text-center py-10 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-display font-bold text-white text-base">All Active Quests Conquered!</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Your squad has completed all currently assigned challenges.
            </p>
            <button
              onClick={() => onGenerateAIQuest('Neighborhood Hotspots')}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25"
            >
              Generate Fresh Batch with AI
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
