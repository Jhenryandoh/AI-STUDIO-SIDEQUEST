import React from 'react';
import { Compass, MapPin, MessageSquare, Trophy, Camera } from 'lucide-react';

export type TabType = 'quests' | 'map' | 'chat' | 'leaderboard' | 'feed';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeQuestsCount: number;
  unreadChatCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  activeQuestsCount,
  unreadChatCount = 0,
}) => {
  const tabs = [
    {
      id: 'quests' as TabType,
      label: 'Quests',
      icon: Compass,
      badge: activeQuestsCount > 0 ? activeQuestsCount : undefined,
    },
    {
      id: 'map' as TabType,
      label: 'Live Map',
      icon: MapPin,
      pulse: true,
    },
    {
      id: 'chat' as TabType,
      label: 'Squad Chat',
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
    },
    {
      id: 'leaderboard' as TabType,
      label: 'Ranks',
      icon: Trophy,
    },
    {
      id: 'feed' as TabType,
      label: 'Proofs & Recap',
      icon: Camera,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#090a10]/95 backdrop-blur-xl border-t border-purple-900/30 px-2 py-1.5 pb-safe"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-cyan-400 bg-gradient-to-t from-cyan-950/40 to-transparent'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
              role="tab"
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 bg-fuchsia-600 text-white font-mono font-bold text-[9px] px-1.5 py-0.2 rounded-full border border-[#090a10]">
                    {tab.badge}
                  </span>
                )}

                {tab.pulse && !tab.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold text-cyan-300' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
