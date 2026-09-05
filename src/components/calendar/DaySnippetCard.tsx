import React from 'react';
import {
  Flame,
  MessageCircle,
  Clock,
  Mic,
  Image as ImageIcon,
  Share2,
  ArrowRight,
  X,
} from 'lucide-react';
import { DailyStats } from '../../types/archive';

interface DaySnippetCardProps {
  stats: DailyStats;
  onOpenDay: (date: string) => void;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export const DaySnippetCard: React.FC<DaySnippetCardProps> = ({
  stats,
  onOpenDay,
  onClose,
  isMobileDrawer = false,
}) => {
  const nilaPct = stats.nilaPercentage;
  const farhanPct = stats.farhanPercentage;

  // Format date: "Tuesday, August 14, 2026"
  const dateObj = new Date(`${stats.date}T00:00:00`);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate day vibe badge
  const getDayVibe = () => {
    if (stats.peakHour >= 1 && stats.peakHour <= 4) {
      return {
        label: `Late Night Talks until ${stats.peakHour === 0 ? 12 : stats.peakHour} AM`,
        emoji: '🌙',
        color: 'text-purple-300 bg-purple-500/15 border-purple-500/30',
      };
    }
    if (stats.totalMessages >= 1400) {
      return {
        label: 'Record Peak Day',
        emoji: '👑',
        color: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
      };
    }
    if (stats.audioNotes >= 15) {
      return {
        label: 'Voice Note Marathon',
        emoji: '🎙️',
        color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
      };
    }
    if (stats.photos >= 5) {
      return {
        label: 'Photo Diary Day',
        emoji: '📸',
        color: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
      };
    }
    if (stats.shares >= 15) {
      return {
        label: 'Reel Sharing Binge',
        emoji: '🍿',
        color: 'text-sky-300 bg-sky-500/15 border-sky-500/30',
      };
    }
    return {
      label: 'Deep Conversation',
      emoji: '💬',
      color: 'text-slate-300 bg-slate-500/15 border-slate-500/30',
    };
  };

  const vibe = getDayVibe();

  const content = (
    <div className="relative p-4 sm:p-5 rounded-2xl glass-panel shadow-2xl border border-white/10 space-y-4">
      {/* Header with Date and Activity Badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider block">
            {stats.date}
          </span>
          <h3 className="text-base sm:text-lg font-editorial text-white font-semibold leading-tight">
            {formattedDate}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold">
            <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{stats.activityScore} pts</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Vibe Pill */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${vibe.color}`}
        >
          <span>{vibe.emoji}</span>
          <span>{vibe.label}</span>
        </span>

        <span className="text-xs font-mono text-[#8b949e] flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Peak: {stats.peakHour}:00</span>
        </span>
      </div>

      {/* Message Count & Balance Bar */}
      <div className="space-y-1.5 p-3 rounded-xl bg-[#0b0d10]/60 border border-[#21262d]">
        <div className="flex justify-between items-center text-xs">
          <span className="text-white font-medium flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>{stats.totalMessages.toLocaleString()} messages</span>
          </span>
          <span className="text-[11px] font-mono text-[#8b949e]">
            {Math.round(stats.activeDurationMinutes / 60)}h active
          </span>
        </div>

        {/* Sender Ratio Bar */}
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
          <div style={{ width: `${nilaPct}%` }} className="h-full bg-rose-500" />
          <div style={{ width: `${farhanPct}%` }} className="h-full bg-sky-400" />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-[#8b949e]">
          <span className="text-rose-400">NILA: {stats.nilaMessages} ({Math.round(nilaPct)}%)</span>
          <span className="text-sky-400">FARHAN: {stats.farhanMessages} ({Math.round(farhanPct)}%)</span>
        </div>
      </div>

      {/* Media & Reactions Mini-Grid */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 rounded-lg bg-[#0b0d10]/40 border border-[#21262d]">
          <span className="block text-[10px] text-[#8b949e] font-mono">Photos</span>
          <span className="font-semibold text-white mt-0.5 block flex items-center justify-center gap-1">
            <ImageIcon className="w-3 h-3 text-rose-400" />
            {stats.photos}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#0b0d10]/40 border border-[#21262d]">
          <span className="block text-[10px] text-[#8b949e] font-mono">Voice</span>
          <span className="font-semibold text-white mt-0.5 block flex items-center justify-center gap-1">
            <Mic className="w-3 h-3 text-emerald-400" />
            {stats.audioNotes}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#0b0d10]/40 border border-[#21262d]">
          <span className="block text-[10px] text-[#8b949e] font-mono">Shares</span>
          <span className="font-semibold text-white mt-0.5 block flex items-center justify-center gap-1">
            <Share2 className="w-3 h-3 text-sky-400" />
            {stats.shares}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#0b0d10]/40 border border-[#21262d]">
          <span className="block text-[10px] text-[#8b949e] font-mono">Reacts</span>
          <span className="font-semibold text-white mt-0.5 block flex items-center justify-center gap-1">
            <span>❤️</span>
            {stats.reactions}
          </span>
        </div>
      </div>

      {/* Action Button: Jump to Day */}
      <button
        onClick={() => onOpenDay(stats.date)}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all"
      >
        <span>Open Day's Dialogue</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  if (isMobileDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-3 pb-safe animate-fade-in">
        <div className="w-full max-w-md">{content}</div>
      </div>
    );
  }

  return content;
};
