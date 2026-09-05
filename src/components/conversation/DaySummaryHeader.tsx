import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Share2,
  Smile,
  Sparkles,
} from 'lucide-react';
import { DailyStats } from '../../types/archive';

interface DaySummaryHeaderProps {
  stats?: DailyStats;
  date: string;
  allDates: string[];
  onSelectDate: (date: string) => void;
  filterQuery: string;
  onFilterChange: (q: string) => void;
  onOpenAiSummary?: () => void;
}

export const DaySummaryHeader: React.FC<DaySummaryHeaderProps> = ({
  stats,
  date,
  allDates,
  onSelectDate,
  filterQuery,
  onFilterChange,
  onOpenAiSummary,
}) => {
  const currentIndex = allDates.indexOf(date);
  const prevDate = currentIndex > 0 ? allDates[currentIndex - 1] : null;
  const nextDate = currentIndex < allDates.length - 1 ? allDates[currentIndex + 1] : null;

  // Format date nicely: e.g. "Thursday, September 3, 2026"
  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(date + 'T12:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  }, [date]);

  // Mobile compact date e.g. "Sep 4, 2026"
  const shortFormattedDate = React.useMemo(() => {
    try {
      const d = new Date(date + 'T12:00:00');
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  }, [date]);

  const activeHoursStr = React.useMemo(() => {
    if (!stats) return '';
    const h = Math.floor(stats.activeDurationMinutes / 60);
    const m = stats.activeDurationMinutes % 60;
    return `${h}h ${m}m active`;
  }, [stats]);

  return (
    <div className="border-b border-[#21262d] bg-[#0b0d10] px-3 sm:px-6 py-2.5 sm:py-3 space-y-2 shrink-0 z-20">
      {/* Top Bar: Navigation + Title + Quick Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <h1 className="font-editorial text-base sm:text-2xl text-white font-medium tracking-tight truncate">
            <span className="sm:hidden">{shortFormattedDate}</span>
            <span className="hidden sm:inline">{formattedDate}</span>
          </h1>
          {stats && (
            <span className="text-[11px] font-mono text-[#8b949e] hidden md:inline">
              • {stats.totalMessages.toLocaleString()} msgs • {activeHoursStr}
            </span>
          )}
          {stats && stats.totalMessages >= 1200 && (
            <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 sm:px-2 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 shrink-0">
              <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
              <span className="hidden sm:inline">Marathon</span>
            </span>
          )}
        </div>

        {/* Date Prev/Next Buttons & AI Action */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenAiSummary && (
            <button
              onClick={onOpenAiSummary}
              className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 text-xs font-mono transition-colors"
              title="Generate Scoped AI Summary with Gemini"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Day Summary</span>
            </button>
          )}

          <div className="flex items-center bg-[#12161c] border border-[#21262d] rounded-xl p-0.5">
            <button
              onClick={() => prevDate && onSelectDate(prevDate)}
              disabled={!prevDate}
              className="p-1 sm:p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c222c] disabled:opacity-25 transition-colors"
              title={prevDate ? `Go to ${prevDate}` : 'No previous day'}
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="px-1.5 sm:px-2 text-[11px] sm:text-xs font-mono text-[#8b949e]">
              {currentIndex + 1} / {allDates.length}
            </span>
            <button
              onClick={() => nextDate && onSelectDate(nextDate)}
              disabled={!nextDate}
              className="p-1 sm:p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c222c] disabled:opacity-25 transition-colors"
              title={nextDate ? `Go to ${nextDate}` : 'No next day'}
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Second Bar: Compact Stat Pills Strip & Search */}
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {stats && (
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs font-mono shrink-0">
            {/* NILA Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161b22] border border-rose-500/25 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-rose-400 font-semibold text-[11px]">NILA</span>
              <span className="text-white font-semibold">{stats.nilaMessages.toLocaleString()}</span>
              <span className="text-[#8b949e] text-[10px]">({stats.nilaPercentage}%)</span>
            </div>

            {/* FARHAN Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161b22] border border-sky-500/25 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span className="text-sky-400 font-semibold text-[11px]">FARHAN</span>
              <span className="text-white font-semibold">{stats.farhanMessages.toLocaleString()}</span>
              <span className="text-[#8b949e] text-[10px]">({stats.farhanPercentage}%)</span>
            </div>

            {/* Shares Pill */}
            {stats.shares > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#161b22] border border-[#21262d] text-[#8b949e] shrink-0">
                <Share2 className="w-3 h-3 text-amber-400" />
                <span className="text-white font-medium">{stats.shares}</span>
                <span className="text-[10px]">({stats.reels} reels)</span>
              </div>
            )}

            {/* Reactions Pill */}
            {stats.reactions > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#161b22] border border-[#21262d] text-[#8b949e] shrink-0">
                <Smile className="w-3 h-3 text-emerald-400" />
                <span className="text-white font-medium">{stats.reactions}</span>
                <span className="text-[10px]">({stats.nilaReactions}N/{stats.farhanReactions}F)</span>
              </div>
            )}

            {/* Peak Hour */}
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-[#161b22] border border-[#21262d] text-[#8b949e] text-[11px] shrink-0">
              <Clock className="w-3 h-3 text-rose-400" />
              <span>Peak {stats.peakHour % 12 || 12}{stats.peakHour >= 12 ? 'PM' : 'AM'}</span>
            </div>
          </div>
        )}

        {/* Filter Input */}
        <div className="relative w-full sm:w-56 shrink-0">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="Filter messages..."
            className="w-full pl-2.5 pr-7 py-1 rounded-lg bg-[#12161c] border border-[#21262d] focus:border-rose-500 focus:outline-none text-xs text-white placeholder:text-[#484f58] transition-colors font-mono"
          />
          {filterQuery && (
            <button
              onClick={() => onFilterChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#8b949e] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
