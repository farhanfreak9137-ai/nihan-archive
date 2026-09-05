import React from 'react';
import {
  Calendar as CalendarIcon,
  MessageSquare,
  Search,
  BarChart2,
  Film,
  Sparkles,
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
    { id: 'search' as ActiveTab, label: 'Search', icon: Search },
    { id: 'analytics' as ActiveTab, label: 'Stats', icon: BarChart2 },
    { id: 'media' as ActiveTab, label: 'Media', icon: Film },
    { id: 'moments' as ActiveTab, label: 'Moments', icon: Sparkles },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0d10]/95 backdrop-blur-lg border-t border-[#21262d] px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
              isActive ? 'text-rose-400 font-medium' : 'text-[#8b949e]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-sans">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
