import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar as CalendarIcon,
  Trophy,
} from 'lucide-react';
import { DailyStats } from '../../types/archive';
import { DaySnippetCard } from './DaySnippetCard';
import { OnThisDayBanner } from '../ui/OnThisDayBanner';

interface CalendarViewProps {
  dailyStats: DailyStats[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  dailyStats,
  selectedDate,
  onSelectDate,
}) => {
  // Derive all active months from dailyStats dynamically
  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(dailyStats.map((d) => d.date.slice(0, 7)))).sort();
    return months.length > 0 ? months : ['2026-07', '2026-08', '2026-09', '2026-10'];
  }, [dailyStats]);

  // Default to selectedDate month or latest active month
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => {
    if (selectedDate) return selectedDate.slice(0, 7);
    return availableMonths[availableMonths.length - 1] || '2026-10';
  });

  // Sync currentYearMonth when selectedDate changes or when availableMonths load
  React.useEffect(() => {
    if (selectedDate) {
      const ym = selectedDate.slice(0, 7);
      if (availableMonths.includes(ym)) {
        setCurrentYearMonth(ym);
      }
    }
  }, [selectedDate, availableMonths]);

  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [mobileInspectDate, setMobileInspectDate] = useState<string | null>(null);

  // Month navigation
  const currentMonthIdx = availableMonths.indexOf(currentYearMonth);
  const prevMonth = () => {
    if (currentMonthIdx > 0) {
      setCurrentYearMonth(availableMonths[currentMonthIdx - 1]);
    }
  };

  const nextMonth = () => {
    if (currentMonthIdx < availableMonths.length - 1) {
      setCurrentYearMonth(availableMonths[currentMonthIdx + 1]);
    }
  };

  // Map daily stats by YYYY-MM-DD for O(1) lookup
  const statsMap = useMemo(() => {
    const map = new Map<string, DailyStats>();
    for (const d of dailyStats) {
      map.set(d.date, d);
    }
    return map;
  }, [dailyStats]);

  // Top 5 most active days in the entire archive
  const topActiveDays = useMemo(() => {
    return [...dailyStats]
      .sort((a, b) => b.totalMessages - a.totalMessages)
      .slice(0, 5);
  }, [dailyStats]);

  const totalArchiveMessages = useMemo(() => {
    return dailyStats.reduce((sum, d) => sum + d.totalMessages, 0);
  }, [dailyStats]);

  const streakStats = useMemo(() => {
    if (dailyStats.length === 0) {
      return {
        longestStreak: 0,
        longestStreakStart: '',
        longestStreakEnd: '',
        totalSpanDays: 0,
        activeDays: 0,
        description: '',
      };
    }
    const sorted = [...dailyStats].sort((a, b) => a.date.localeCompare(b.date));
    let maxStreak = 0;
    let curStreak = 1;
    let maxStart = sorted[0].date;
    let maxEnd = sorted[0].date;
    let curStart = sorted[0].date;

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date);
      const curr = new Date(sorted[i].date);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        curStreak++;
        if (curStreak > maxStreak) {
          maxStreak = curStreak;
          maxStart = curStart;
          maxEnd = sorted[i].date;
        }
      } else {
        curStreak = 1;
        curStart = sorted[i].date;
      }
    }
    if (maxStreak === 0) {
      maxStreak = 1;
      maxStart = sorted[0].date;
      maxEnd = sorted[0].date;
    }

    const firstDate = new Date(sorted[0].date);
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const totalSpanDays = Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const description = `${sorted.length} active days across a ${totalSpanDays}-day journey, peaking with an unbroken ${maxStreak}-day streak from ${maxStart} to ${maxEnd}.`;

    return {
      longestStreak: maxStreak,
      longestStreakStart: maxStart,
      longestStreakEnd: maxEnd,
      totalSpanDays,
      activeDays: sorted.length,
      description,
    };
  }, [dailyStats]);

  // Month metadata
  const monthInfo = useMemo(() => {
    const [yearStr, monthStr] = currentYearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 7, 8, 9

    const monthNames = [
      '',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const monthName = monthNames[month];

    // First day of month
    const firstDay = new Date(year, month - 1, 1);
    // Day of week: 0 is Sun, 1 is Mon... convert to Monday-first (0 is Mon, 6 is Sun)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    // Number of days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    const cells: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
    }[] = [];

    // Empty lead cells
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({
        dayNumber: 0,
        dateStr: '',
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayPad = d < 10 ? `0${d}` : `${d}`;
      const monthPad = month < 10 ? `0${month}` : `${month}`;
      const dateStr = `${year}-${monthPad}-${dayPad}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
      });
    }

    return {
      year,
      month,
      monthName,
      cells,
    };
  }, [currentYearMonth]);

  // Current month total messages
  const currentMonthTotal = useMemo(() => {
    return dailyStats
      .filter((d) => d.date.startsWith(currentYearMonth))
      .reduce((sum, d) => sum + d.totalMessages, 0);
  }, [dailyStats, currentYearMonth]);

  const displayedStat = useMemo(() => {
    const target = hoveredDate || selectedDate;
    return statsMap.get(target) || dailyStats[0];
  }, [hoveredDate, selectedDate, statsMap, dailyStats]);

  const mobileStat = mobileInspectDate ? statsMap.get(mobileInspectDate) : null;

  return (
    <div className="space-y-6">
      {/* On This Day Time Machine Banner */}
      <OnThisDayBanner
        dailyStats={dailyStats}
        currentDate={selectedDate}
        onJumpToDate={onSelectDate}
      />

      {/* Dynamic Chat Streak & Activity Banner */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-rose-500/15 via-purple-500/10 to-sky-500/15 border border-rose-500/25 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/30 shrink-0">
              <Flame className="w-6 h-6 fill-white text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-editorial text-white font-semibold">
                  {streakStats.activeDays} Active Days • {streakStats.longestStreak}-Day Peak Streak
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Peak: {streakStats.longestStreakStart} → {streakStats.longestStreakEnd}
                </span>
              </div>
              <p className="text-xs text-[#8b949e]">
                {streakStats.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-[#0b0d10]/60 border border-white/10">
              <span className="text-[#8b949e]">Total: </span>
              <span className="text-white font-semibold">{totalArchiveMessages.toLocaleString()} msgs</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#0b0d10]/60 border border-white/10">
              <span className="text-[#8b949e]">Daily Avg: </span>
              <span className="text-rose-400 font-semibold">
                ~{Math.round(totalArchiveMessages / Math.max(1, dailyStats.length)).toLocaleString()} msgs/day
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21262d] pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-editorial text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-rose-500" />
            <span>Archive Calendar Heatmap</span>
          </h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Explore {dailyStats.length} days of conversations. Tap any day to inspect highlights or jump straight to that day's dialogue.
          </p>
        </div>

        {/* Month Navigation Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-[#12161c] border border-[#21262d] rounded-xl p-1 shadow-sm">
            <button
              onClick={prevMonth}
              disabled={currentMonthIdx <= 0}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c222c] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-mono font-medium text-[#f0f6fc] min-w-[120px] text-center">
              {monthInfo.monthName} 2026
            </span>
            <button
              onClick={nextMonth}
              disabled={currentMonthIdx >= availableMonths.length - 1}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c222c] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#21262d] text-xs">
            <span className="text-[#8b949e]">Month Total:</span>
            <span className="font-mono text-white font-medium">
              {currentMonthTotal.toLocaleString()} msgs
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar Grid (3 Columns on Large Screens) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Weekday Labels (Monday to Sunday) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-[11px] font-mono tracking-wider text-[#8b949e] uppercase py-1">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthInfo.cells.map((cell, idx) => {
              if (!cell.isCurrentMonth || !cell.dateStr) {
                return (
                  <div
                    key={`empty_${idx}`}
                    className="min-h-[75px] sm:min-h-[105px] rounded-xl border border-transparent bg-[#0b0d10]/40 opacity-20 pointer-events-none"
                  />
                );
              }

              const stat = statsMap.get(cell.dateStr);
              const hasMessages = !!stat && stat.totalMessages > 0;
              const isSelected = selectedDate === cell.dateStr;

              // Top peak day crown badges
              const isRank1 = cell.dateStr === '2026-10-11';
              const isRank2 = cell.dateStr === '2026-10-07';
              const isRank3 = cell.dateStr === '2026-10-14';

              // Intensity styles based on activityScore / message count
              let intensityBorder = 'border-[#21262d]';
              let intensityBg = 'bg-[#12161c]/60';
              let glowEffect = '';

              if (hasMessages) {
                if (stat.totalMessages >= 500) {
                  // Climax/Mega Active Day
                  intensityBorder = 'border-rose-500/50 hover:border-rose-400';
                  intensityBg = 'bg-rose-950/25 hover:bg-rose-900/35';
                  glowEffect = 'shadow-[0_0_15px_rgba(244,63,94,0.15)]';
                } else if (stat.totalMessages >= 300) {
                  // Heavy Active Day
                  intensityBorder = 'border-rose-500/30 hover:border-rose-400/60';
                  intensityBg = 'bg-[#1a1420] hover:bg-[#241a2c]';
                } else if (stat.totalMessages >= 100) {
                  // Medium Active Day
                  intensityBorder = 'border-[#30363d] hover:border-[#484f58]';
                  intensityBg = 'bg-[#161b22] hover:bg-[#1c222c]';
                } else {
                  // Light Day
                  intensityBorder = 'border-[#21262d] hover:border-[#30363d]';
                  intensityBg = 'bg-[#12161c] hover:bg-[#161b22]';
                }
              } else {
                intensityBorder = 'border-[#1c2128]';
                intensityBg = 'bg-[#0f1217]/50 opacity-40';
              }

              const cellDate = cell.dateStr;

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => {
                    if (!hasMessages) return;
                    if (window.innerWidth < 1024) {
                      setMobileInspectDate(cellDate);
                    } else {
                      onSelectDate(cellDate);
                    }
                  }}
                  onMouseEnter={() => setHoveredDate(cellDate)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={!hasMessages}
                  className={`relative p-1.5 sm:p-2.5 min-h-[75px] sm:min-h-[105px] rounded-xl border text-left flex flex-col justify-between transition-all duration-150 ${intensityBorder} ${intensityBg} ${glowEffect} ${
                    isSelected ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-950/30' : ''
                  } ${!hasMessages ? 'cursor-not-allowed' : 'cursor-pointer group active:scale-95'}`}
                >
                  {/* Top Bar: Date number + Peak Badges */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-mono font-medium ${
                        isSelected ? 'text-rose-400 font-bold' : hasMessages ? 'text-[#f0f6fc]' : 'text-[#8b949e]'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Peak Day Badges */}
                    {isRank1 && (
                      <span className="text-xs" title="Rank #1 Peak Day in Archive!">
                        👑
                      </span>
                    )}
                    {isRank2 && (
                      <span className="text-xs" title="Rank #2 Most Active Day!">
                        🥈
                      </span>
                    )}
                    {isRank3 && (
                      <span className="text-xs" title="Rank #3 Most Active Day!">
                        🥉
                      </span>
                    )}

                    {hasMessages && !isRank1 && !isRank2 && !isRank3 && stat.activityScore >= 80 && (
                      <Flame className="w-3 h-3 text-rose-400 fill-rose-400/80" />
                    )}
                  </div>

                  {/* Message Count Metric */}
                  {hasMessages ? (
                    <div className="space-y-0.5 mt-1">
                      <div className="text-[11px] sm:text-xs font-mono font-semibold text-white tracking-tight">
                        {stat.totalMessages.toLocaleString()}
                        <span className="hidden sm:inline text-[9px] text-[#8b949e] font-normal ml-0.5">
                          msgs
                        </span>
                      </div>

                      {/* Mini balance bar */}
                      <div className="h-1 w-full rounded-full bg-slate-800/80 overflow-hidden flex">
                        <div
                          style={{
                            width: `${stat.sumaiyaPercentage ?? 50}%`,
                          }}
                          className="h-full bg-rose-500"
                        />
                        <div
                          style={{
                            width: `${stat.nihanPercentage ?? 50}%`,
                          }}
                          className="h-full bg-sky-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-[#8b949e]/40">—</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Activity Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#8b949e] pt-3 px-1 border-t border-[#21262d] gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px]">Intensity:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#12161c] border border-[#21262d]" title="Light (<100 msgs)" />
                <span className="w-3 h-3 rounded bg-[#161b22] border border-[#30363d]" title="Medium (100-300 msgs)" />
                <span className="w-3 h-3 rounded bg-[#1a1420] border border-rose-500/30" title="Heavy (300-500 msgs)" />
                <span className="w-3 h-3 rounded bg-rose-950/40 border border-rose-500" title="Peak (>500 msgs)" />
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                SUMAIYA
              </span>
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                NIHAN
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Dynamic Day Snippet Card & Top Active Days */}
        <div className="space-y-4">
          {/* Day Snippet Inspector */}
          {displayedStat && (
            <div className="hidden lg:block">
              <DaySnippetCard
                stats={displayedStat}
                onOpenDay={(date) => onSelectDate(date)}
              />
            </div>
          )}

          {/* Top 5 Most Active Days Section */}
          <div className="p-4 rounded-2xl border border-[#21262d] bg-[#12161c] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8b949e] uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Record Peak Days</span>
            </div>

            <div className="space-y-1.5">
              {topActiveDays.map((day, idx) => {
                const crowns = ['👑', '🥈', '🥉', '#4', '#5'];
                return (
                  <button
                    key={day.date}
                    onClick={() => onSelectDate(day.date)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all border ${
                      selectedDate === day.date
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200 shadow-sm'
                        : 'bg-[#161b22] border-[#21262d] hover:border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 text-xs text-center font-mono">
                        {crowns[idx]}
                      </span>
                      <div>
                        <span className="font-mono text-white font-medium block">
                          {day.date}
                        </span>
                        <span className="text-[10px] text-[#8b949e]">
                          {Math.round(day.activeDurationMinutes / 60)}h active
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-rose-400 font-semibold text-xs">
                        {day.totalMessages.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#8b949e]">msgs</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Day Inspection Drawer */}
      {mobileStat && (
        <DaySnippetCard
          stats={mobileStat}
          onOpenDay={(date) => {
            setMobileInspectDate(null);
            onSelectDate(date);
          }}
          onClose={() => setMobileInspectDate(null)}
          isMobileDrawer={true}
        />
      )}
    </div>
  );
};
