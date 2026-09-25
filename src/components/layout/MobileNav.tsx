import React from 'react';
import {
  Calendar as CalendarIcon,
  MessageSquare,
  Search,
  BarChart2,
  Film,
  Sparkles,
  Heart,
} from 'lucide-react';
import { ActiveTab } from '../../hooks/useArchive';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'calendar' as ActiveTab, label: 'Calendar', icon: CalendarIcon },
    { id: 'conversation' as ActiveTab, label: 'Chat', icon: MessageSquare },
    { id: 'journey' as ActiveTab, label: 'Journey', icon: Heart },
    { id: 'media' as ActiveTab, label: 'Media', icon: Film },
    { id: 'analytics' as ActiveTab, label: 'Stats', icon: BarChart2 },
    { id: 'search' as ActiveTab, label: 'Search', icon: Search },
    { id: 'moments' as ActiveTab, label: 'Moments', icon: Sparkles },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0d10]/95 backdrop-blur-xl border-t border-[#21262d] px-1 sm:px-2 pt-1.5 pb-safe flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 py-1 px-1 sm:px-2 rounded-xl transition-all active:scale-90 flex-1 max-w-[54px] min-w-0 ${
              isActive
                ? 'text-rose-400 font-semibold scale-105'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-mono tracking-tight truncate">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
