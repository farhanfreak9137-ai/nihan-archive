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

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedDate: string;
  totalDays: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedDate,
  totalDays,
}) => {
  const navItems = [
    {
      id: 'calendar' as ActiveTab,
      label: 'Calendar',
      sublabel: `${totalDays || 60} active days`,
      icon: CalendarIcon,
    },
    {
      id: 'conversation' as ActiveTab,
      label: 'Conversation',
      sublabel: selectedDate || 'Select a day',
      icon: MessageSquare,
    },
    {
      id: 'search' as ActiveTab,
      label: 'Search Archive',
      sublabel: '52,784 messages',
      icon: Search,
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics',
      sublabel: 'Balance & lexical trends',
      icon: BarChart2,
    },
    {
      id: 'media' as ActiveTab,
      label: 'Media Vault',
      sublabel: '1,014 reels • 166 posts',
      icon: Film,
    },
    {
      id: 'moments' as ActiveTab,
      label: 'Important Moments',
      sublabel: 'Milestones & timeline',
      icon: Sparkles,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#21262d] bg-[#0b0d10] p-4 shrink-0 min-h-[calc(100vh-61px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] uppercase font-mono tracking-widest text-[#8b949e]">
          Archive Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group relative ${
                isActive
                  ? 'bg-[#161b22] text-white font-medium border border-[#30363d] shadow-sm'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#12161c]'
              }`}
            >
              {/* Active Indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-rose-500" />
              )}

              <div
                className={`p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'bg-[#12161c] text-[#8b949e] group-hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm truncate leading-tight">{item.label}</div>
                <div className="text-[11px] text-[#8b949e] truncate font-sans">
                  {item.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-[#21262d] px-3">
        <div className="text-xs text-[#8b949e] space-y-1">
          <div className="font-editorial text-[#f0f6fc] text-sm">Private Archive</div>
          <p className="text-[11px] leading-relaxed text-[#8b949e]">
            Deterministic analysis of 52,784 exported messages. Fully local & zero external storage.
          </p>
        </div>
      </div>
    </aside>
  );
};
