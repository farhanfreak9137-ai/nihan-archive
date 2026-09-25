import React, { useState, useMemo } from 'react';
import { History, ArrowRight, X } from 'lucide-react';
import { DailyStats } from '../../types/archive';

interface OnThisDayBannerProps {
  dailyStats: DailyStats[];
  currentDate: string;
  onJumpToDate: (date: string) => void;
}

export const OnThisDayBanner: React.FC<OnThisDayBannerProps> = ({
  dailyStats,
  currentDate,
  onJumpToDate,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Find anniversary or past month memories
  const memories = useMemo(() => {
    if (!currentDate || dailyStats.length === 0) return [];
    const [, , day] = currentDate.split('-');

    // Find any day with the same day-of-month in previous months
    const candidates = dailyStats.filter((d) => {
      if (d.date === currentDate) return false;
      const parts = d.date.split('-');
      return parts[2] === day; // same day number (e.g. 10th of July or 10th of August)
    });

    if (candidates.length > 0) {
      return candidates;
    }

    // Fallback: If no same-day matches (e.g. early September with no same day in July/August),
    // pick top historical milestone day in past months
    const otherMonthDays = dailyStats.filter((d) => d.date.slice(0, 7) !== currentDate.slice(0, 7));
    if (otherMonthDays.length > 0) {
      return [...otherMonthDays].sort((a, b) => b.totalMessages - a.totalMessages).slice(0, 2);
    }

    return [];
  }, [dailyStats, currentDate]);

  if (isDismissed || memories.length === 0) return null;

  const memory = memories[0];
  const formattedDate = (() => {
    try {
      const d = new Date(memory.date + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return memory.date;
    }
  })();

  return (
    <div className="relative overflow-hidden rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-[#12161c] border border-amber-500/30 shadow-lg backdrop-blur-md transition-all animate-fade-in">
      {/* Ambient subtle glow */}
      <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left icon & text */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 sm:mt-0">
            <History className="w-4 h-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/20">
                On This Day
              </span>
              <span className="text-xs font-editorial text-white font-medium truncate">
                {formattedDate}
              </span>
            </div>
            <p className="text-xs text-[#8b949e] font-sans leading-relaxed break-words">
              You shared{' '}
              <strong className="text-white font-semibold">{memory.totalMessages.toLocaleString()} messages</strong>
              {memory.audioNotes > 0 && ` • ${memory.audioNotes} voice notes`}
              {memory.reels > 0 && ` • ${memory.reels} reels`}
              {memory.activityScore >= 80 && ' 🔥 Peak connection'}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0">
          <button
            onClick={() => onJumpToDate(memory.date)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs font-mono shadow-sm active:scale-95 transition-all"
          >
            <span>Relive Day</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
