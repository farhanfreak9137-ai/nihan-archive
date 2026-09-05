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

  const activeHoursStr = React.useMemo(() => {
    if (!stats) return '';
    const h = Math.floor(stats.activeDurationMinutes / 60);
    const m = stats.activeDurationMinutes % 60;
    return `${h}h ${m}m active`;
  }, [stats]);

  return (
    <div className="border-b border-[#21262d] bg-[#0b0d10] p-4 sm:p-6 space-y-4">
      {/* Top Bar: Navigation + Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-2xl sm:text-3xl text-white font-medium tracking-tight">
              {formattedDate}
            </h1>
            {stats && stats.totalMessages >= 1200 && (
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
                <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                Marathon Day
              </span>
            )}
          </div>
          {stats && (
            <p className="text-xs text-[#8b949e] font-mono flex items-center gap-2 flex-wrap">
              <span>{stats.totalMessages.toLocaleString()} messages</span>
              <span>•</span>
              <span>{activeHoursStr}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-rose-400" />
                Peak {stats.peakHour % 12 || 12} {stats.peakHour >= 12 ? 'PM' : 'AM'} ({stats.peakHourCount} msgs)
              </span>
            </p>
          )}
        </div>

        {/* Date Prev/Next Buttons & AI Action */}
        <div className="flex items-center gap-2">
          {onOpenAiSummary && (
            <button
              onClick={onOpenAiSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 text-xs font-mono transition-colors"
              title="Generate Scoped AI Summary with Gemini"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Day Summary</span>
            </button>
          )}

          <div className="flex items-center bg-[#12161c] border border-[#21262d] rounded-xl p-0.5">
            <button
              onClick={() => prevDate && onSelectDate(prevDate)}
              disabled={!prevDate}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c222c] disabled:opacity-25 transition-colors"
              title={prevDate ? `Go to ${prevDate}` : 'No previous day'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-[#8b949e]">
              Day {currentIndex + 1} of {allDates.length}
            </span>
            <button
              onClick={() => nextDate && onSelectDate(nextDate)}
              disabled={!nextDate}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c222c] disabled:opacity-25 transition-colors"
              title={nextDate ? `Go to ${nextDate}` : 'No next day'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Day in Review Summary Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* NILA Card */}
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#21262d] relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
            <div className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-medium">
              NILA
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-xl text-white font-semibold">
                {stats.nilaMessages.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#8b949e] font-mono">
                {stats.nilaPercentage}%
              </span>
            </div>
          </div>

          {/* FARHAN Card */}
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#21262d] relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-sky-400" />
            <div className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-medium">
              FARHAN
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-xl text-white font-semibold">
                {stats.farhanMessages.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#8b949e] font-mono">
                {stats.farhanPercentage}%
              </span>
            </div>
          </div>

          {/* SHARES Card */}
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#21262d]">
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-[#8b949e]">
              <span>Shares</span>
              <Share2 className="w-3 h-3 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-xl text-white font-semibold">
                {stats.shares}
              </span>
              <span className="text-[10px] text-[#8b949e] font-mono">
                ({stats.reels} reels)
              </span>
            </div>
          </div>

          {/* REACTIONS Card */}
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#21262d]">
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-[#8b949e]">
              <span>Reactions</span>
              <Smile className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-xl text-white font-semibold">
                {stats.reactions}
              </span>
              <span className="text-[10px] text-[#8b949e] font-mono">
                ({stats.nilaReactions} N / {stats.farhanReactions} F)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter in Day Search Input */}
      <div className="flex items-center justify-between pt-1">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="Filter messages in this day..."
            className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-[#12161c] border border-[#21262d] focus:border-rose-500 focus:outline-none text-xs text-white placeholder:text-[#484f58] transition-colors"
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

        {stats && (
          <div className="text-[11px] text-[#8b949e] font-mono hidden sm:block">
            {stats.firstMessage} → {stats.lastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
