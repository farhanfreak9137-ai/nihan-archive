import React from 'react';
import {
  Calendar as CalendarIcon,
  MessageSquare,
  Search,
  BarChart2,
  Film,
  Sparkles,
  Heart,
  Flame,
  ShieldCheck,
  Zap,
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
      label: 'Calendar Heatmap',
      sublabel: `${totalDays || 87} days uninterrupted`,
      icon: CalendarIcon,
      accentColor: 'text-amber-400',
      iconBg: 'bg-gradient-to-br from-amber-500/25 to-orange-500/10 border-amber-500/30 text-amber-300 shadow-amber-500/20',
      activeCard: 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/50 shadow-lg shadow-amber-950/40 text-white',
      glowBar: 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]',
      badge: `${totalDays || 87}d`,
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'conversation' as ActiveTab,
      label: 'Conversation Stream',
      sublabel: selectedDate ? `Viewing ${selectedDate}` : 'Select a day',
      icon: MessageSquare,
      accentColor: 'text-sky-400',
      iconBg: 'bg-gradient-to-br from-sky-500/25 to-blue-500/10 border-sky-500/30 text-sky-300 shadow-sky-500/20',
      activeCard: 'bg-gradient-to-r from-sky-500/20 via-blue-500/10 to-transparent border-sky-500/50 shadow-lg shadow-sky-950/40 text-white',
      glowBar: 'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]',
      badge: 'Live',
      badgeStyle: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
    {
      id: 'search' as ActiveTab,
      label: 'Search Archive',
      sublabel: 'Instant full-text lookup',
      icon: Search,
      accentColor: 'text-indigo-400',
      iconBg: 'bg-gradient-to-br from-indigo-500/25 to-purple-500/10 border-indigo-500/30 text-indigo-300 shadow-indigo-500/20',
      activeCard: 'bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-transparent border-indigo-500/50 shadow-lg shadow-indigo-950/40 text-white',
      glowBar: 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.8)]',
      badge: '/',
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-mono',
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Lexical Analytics',
      sublabel: 'Balance & word frequencies',
      icon: BarChart2,
      accentColor: 'text-emerald-400',
      iconBg: 'bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-500/20',
      activeCard: 'bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/50 shadow-lg shadow-emerald-950/40 text-white',
      glowBar: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]',
      badge: 'Metrics',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'media' as ActiveTab,
      label: 'Media Vault',
      sublabel: 'Reels, photos & voice notes',
      icon: Film,
      accentColor: 'text-fuchsia-400',
      iconBg: 'bg-gradient-to-br from-fuchsia-500/25 to-pink-500/10 border-fuchsia-500/30 text-fuchsia-300 shadow-fuchsia-500/20',
      activeCard: 'bg-gradient-to-r from-fuchsia-500/20 via-pink-500/10 to-transparent border-fuchsia-500/50 shadow-lg shadow-fuchsia-950/40 text-white',
      glowBar: 'bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.8)]',
      badge: 'Gallery',
      badgeStyle: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    },
    {
      id: 'vault' as ActiveTab,
      label: 'The Intimate Vault',
      sublabel: 'Uncensored 18+ dialogues',
      icon: Flame,
      accentColor: 'text-rose-400',
      iconBg: 'bg-gradient-to-br from-rose-600/30 to-red-600/15 border-rose-500/40 text-rose-300 shadow-rose-600/30',
      activeCard: 'bg-gradient-to-r from-rose-600/25 via-red-950/30 to-transparent border-rose-500 shadow-xl shadow-rose-950/50 ring-1 ring-rose-500/40 text-white',
      glowBar: 'bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.9)]',
      badge: '🔞 18+',
      badgeStyle: 'bg-gradient-to-r from-rose-500/30 to-red-600/30 text-rose-200 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse font-bold',
    },
    {
      id: 'journey' as ActiveTab,
      label: 'The Journey',
      sublabel: 'Milestones & chapter story',
      icon: Heart,
      accentColor: 'text-pink-400',
      iconBg: 'bg-gradient-to-br from-pink-500/25 to-rose-500/10 border-pink-500/30 text-pink-300 shadow-pink-500/20',
      activeCard: 'bg-gradient-to-r from-pink-500/20 via-rose-500/10 to-transparent border-pink-500/50 shadow-lg shadow-pink-950/40 text-white',
      glowBar: 'bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.8)]',
      badge: 'Story',
      badgeStyle: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    },
    {
      id: 'moments' as ActiveTab,
      label: 'Important Moments',
      sublabel: 'Landmark memories & hall of fame',
      icon: Sparkles,
      accentColor: 'text-purple-400',
      iconBg: 'bg-gradient-to-br from-purple-500/25 to-pink-500/10 border-purple-500/30 text-purple-300 shadow-purple-500/20',
      activeCard: 'bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-transparent border-purple-500/50 shadow-lg shadow-purple-950/40 text-white',
      glowBar: 'bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]',
      badge: 'Hall of Fame',
      badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-68 lg:w-72 border-r border-[#21262d] bg-[#090b0e]/95 backdrop-blur-2xl p-4 shrink-0 min-h-[calc(100vh-61px)] select-none relative overflow-hidden">
      {/* Background Decorative Ambient Radial Glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-1.5 text-[11px] uppercase font-mono tracking-wider font-semibold text-rose-400">
          <Zap className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>ARCHIVE PORTALS</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#8b949e]">
          {navItems.length} Views
        </span>
      </div>

      {/* Nav Items List */}
      <div className="space-y-1.5 relative z-10 flex-1 overflow-y-auto pr-0.5 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all duration-200 group relative border ${
                isActive
                  ? `${item.activeCard}`
                  : 'bg-[#12161c]/50 hover:bg-[#161c24] border-[#1d222b] hover:border-[#303846] text-slate-300 hover:text-white hover:translate-x-1.5 shadow-sm'
              }`}
            >
              {/* Active Neon Glow Left Indicator Bar */}
              {isActive && (
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-full ${item.glowBar}`}
                />
              )}

              {/* Icon Container with glowing background */}
              <div
                className={`p-2.5 rounded-xl border transition-all duration-200 shadow-sm shrink-0 ${
                  isActive
                    ? `${item.iconBg} scale-105 ring-1 ring-white/20`
                    : 'bg-[#161b22] border-[#252c38] text-slate-400 group-hover:text-white group-hover:scale-110 group-hover:border-[#384355]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`} />
              </div>

              {/* Title, Subtitle, & Badge */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5 leading-tight">
                  <span
                    className={`text-sm truncate font-medium ${
                      isActive ? 'text-white font-semibold' : 'text-slate-200 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border shrink-0 ${
                        isActive
                          ? item.badgeStyle
                          : 'bg-[#0f1318] text-[#8b949e] border-[#21262d] group-hover:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div
                  className={`text-[11px] truncate font-sans mt-0.5 ${
                    isActive ? 'text-slate-300' : 'text-[#8b949e] group-hover:text-slate-400'
                  }`}
                >
                  {item.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Exciting Couple Aura & Connection Status Card at Bottom */}
      <div className="mt-auto pt-4 relative z-10">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#16131c] via-[#12161c] to-[#0c0e12] border border-rose-500/25 shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-rose-500/15 via-purple-500/10 to-transparent rounded-full blur-xl pointer-events-none" />

          {/* Intertwined Couple Initials */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-[10px] font-mono font-bold shadow-md shadow-rose-500/30 ring-2 ring-[#0c0e12]">
                N
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-mono font-bold shadow-md shadow-sky-500/30 ring-2 ring-[#0c0e12]">
                F
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Offline & Safe</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-white font-medium">
              <span>Farhan & Nila Archive</span>
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
            <p className="text-[11px] leading-relaxed text-[#8b949e] font-sans">
              87 days of memories, late-night talks & voice notes preserved forever.
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#8b949e]">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3 h-3 text-rose-400" />
              <span>Zero external cloud</span>
            </span>
            <span className="text-rose-400/90 font-semibold">100% Private</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
