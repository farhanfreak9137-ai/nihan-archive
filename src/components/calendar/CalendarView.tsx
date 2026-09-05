import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  MessageCircle,
  Share2,
  Smile,
  Clock,
  Calendar as CalendarIcon,
  TrendingUp,
} from 'lucide-react';
import { DailyStats } from '../../types/archive';

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
    return months.length > 0 ? months : ['2026-07', '2026-08', '2026-09'];
  }, [dailyStats]);

  // Default to latest active month
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => {
    return availableMonths[availableMonths.length - 1] || '2026-09';
  });
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

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

    // First day of month (0 = Sunday, 1 = Monday ... 6 = Saturday)
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    // Adjust to Monday start: 0 = Mon, 6 = Sun
    const startOffset = (firstDayIndex + 6) % 7;

    // Number of days in month
    const totalDays = new Date(year, month, 0).getDate();

    // Generate grid items
    const cells: { dateStr?: string; dayNumber?: number; isCurrentMonth: boolean }[] = [];

    // Empty lead cells
    for (let i = 0; i < startOffset; i++) {
      cells.push({ isCurrentMonth: false });
    }

    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Trailing cells to complete 7-column rows
    while (cells.length % 7 !== 0) {
      cells.push({ isCurrentMonth: false });
    }

    return {
      year,
      month,
      monthName,
      cells,
    };
  }, [currentYearMonth]);

  // Total messages for current selected month
  const currentMonthTotal = useMemo(() => {
    return dailyStats
      .filter((d) => d.date.startsWith(currentYearMonth))
      .reduce((acc, d) => acc + d.totalMessages, 0);
  }, [dailyStats, currentYearMonth]);

  const hoveredStat = hoveredDate ? statsMap.get(hoveredDate) : null;

  return (
    <div className="space-y-6">
      {/* Header Controls & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#21262d]">
        <div>
          <h2 className="text-2xl font-editorial text-[#f0f6fc] tracking-tight">
            Calendar Explorer
          </h2>
          <p className="text-xs text-[#8b949e]">
            Interactive conversation heat map across July, August, and September 2026.
          </p>
        </div>

        {/* Month Navigation Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#12161c] border border-[#21262d] rounded-xl p-1 shadow-sm">
            <button
              onClick={prevMonth}
              disabled={currentYearMonth === '2026-07'}
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
              disabled={currentYearMonth === '2026-09'}
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
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-mono tracking-wider text-[#8b949e] uppercase py-1">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {monthInfo.cells.map((cell, idx) => {
              if (!cell.isCurrentMonth || !cell.dateStr) {
                return (
                  <div
                    key={`empty_${idx}`}
                    className="min-h-[96px] sm:min-h-[110px] rounded-xl border border-transparent bg-[#0b0d10]/40 opacity-20 pointer-events-none"
                  />
                );
              }

              const stat = statsMap.get(cell.dateStr);
              const hasMessages = !!stat && stat.totalMessages > 0;
              const isSelected = selectedDate === cell.dateStr;

              // Intensity styles based on activityScore / message count
              let intensityBorder = 'border-[#21262d]';
              let intensityBg = 'bg-[#12161c]/60';
              let glowEffect = '';

              if (hasMessages) {
                if (stat.totalMessages >= 1500) {
                  // Climax/Mega Active Day
                  intensityBorder = 'border-rose-500/50 hover:border-rose-400';
                  intensityBg = 'bg-rose-950/25 hover:bg-rose-900/35';
                  glowEffect = 'shadow-[0_0_15px_rgba(244,63,94,0.15)]';
                } else if (stat.totalMessages >= 1000) {
                  // Heavy Active Day
                  intensityBorder = 'border-rose-500/30 hover:border-rose-400/60';
                  intensityBg = 'bg-[#1a1420] hover:bg-[#241a2c]';
                } else if (stat.totalMessages >= 500) {
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
                  onClick={() => hasMessages && onSelectDate(cellDate)}
                  onMouseEnter={() => setHoveredDate(cellDate)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={!hasMessages}
                  className={`relative p-2 sm:p-2.5 min-h-[96px] sm:min-h-[110px] rounded-xl border text-left flex flex-col justify-between transition-all duration-150 ${intensityBorder} ${intensityBg} ${glowEffect} ${
                    isSelected ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-950/30' : ''
                  } ${!hasMessages ? 'cursor-not-allowed' : 'cursor-pointer group'}`}
                >
                  {/* Top Bar: Date number + indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-medium ${
                        isSelected
                          ? 'text-rose-400 font-bold'
                          : hasMessages
                          ? 'text-[#f0f6fc]'
                          : 'text-[#484f58]'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasMessages && stat.totalMessages >= 1200 && (
                      <span className="flex items-center text-rose-400 text-[10px]" title="Heavy marathon day">
                        <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                      </span>
                    )}
                  </div>

                  {/* Center/Bottom: Message count & Split Bar */}
                  {hasMessages ? (
                    <div className="mt-auto space-y-1.5 w-full">
                      <div className="text-[11px] font-mono text-[#f0f6fc] font-medium leading-none">
                        {stat.totalMessages.toLocaleString()}
                        <span className="text-[9px] text-[#8b949e] font-sans ml-0.5 hidden sm:inline">
                          msgs
                        </span>
                      </div>

                      {/* Sender distribution bar */}
                      <div className="w-full h-1 rounded-full bg-[#21262d] overflow-hidden flex">
                        <div
                          style={{ width: `${stat.nilaPercentage}%` }}
                          className="h-full bg-rose-500/80 transition-all"
                        />
                        <div
                          style={{ width: `${stat.farhanPercentage}%` }}
                          className="h-full bg-sky-400/80 transition-all"
                        />
                      </div>

                      {/* Mini counts */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#8b949e] leading-none pt-0.5">
                        <span className="text-rose-400/80">{stat.nilaMessages}</span>
                        <span className="text-sky-400/80">{stat.farhanMessages}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto text-[10px] text-[#484f58] font-mono">
                      —
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Hover Info Card & Top Active Days */}
        <div className="space-y-4">
          {/* Day Inspection Card */}
          <div className="p-4 rounded-2xl border border-[#21262d] bg-[#12161c] space-y-4 min-h-[220px]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8b949e] uppercase tracking-wider">
              <CalendarIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Day Inspection</span>
            </div>

            {hoveredStat ? (
              <div className="space-y-3.5 animate-fade-in">
                <div>
                  <div className="font-editorial text-lg text-white font-medium">
                    {hoveredStat.date}
                  </div>
                  <div className="text-xs text-rose-400 font-mono font-medium">
                    {hoveredStat.totalMessages.toLocaleString()} Total Messages
                  </div>
                </div>

                {/* Sender Breakdown */}
                <div className="space-y-1.5 text-xs bg-[#0b0d10] p-2.5 rounded-xl border border-[#21262d]">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-300 font-medium">NILA:</span>
                    <span className="font-mono text-[#f0f6fc]">
                      {hoveredStat.nilaMessages.toLocaleString()}{' '}
                      <span className="text-[#8b949e] text-[10px]">
                        ({hoveredStat.nilaPercentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sky-300 font-medium">FARHAN:</span>
                    <span className="font-mono text-[#f0f6fc]">
                      {hoveredStat.farhanMessages.toLocaleString()}{' '}
                      <span className="text-[#8b949e] text-[10px]">
                        ({hoveredStat.farhanPercentage}%)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Shares & Reactions */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#161b22] border border-[#21262d]">
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <div className="text-[10px] text-[#8b949e]">Shares</div>
                      <div className="font-mono font-medium">{hoveredStat.shares}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#161b22] border border-[#21262d]">
                    <Smile className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <div className="text-[10px] text-[#8b949e]">Reactions</div>
                      <div className="font-mono font-medium">{hoveredStat.reactions}</div>
                    </div>
                  </div>
                </div>

                {/* Peak Hour */}
                <div className="flex items-center gap-2 text-xs text-[#8b949e] pt-1 border-t border-[#21262d]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Peak:{' '}
                    <strong className="text-white font-mono">
                      {hoveredStat.peakHour % 12 || 12} {hoveredStat.peakHour >= 12 ? 'PM' : 'AM'}
                    </strong>{' '}
                    ({hoveredStat.peakHourCount} msgs)
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-center text-xs text-[#8b949e] space-y-1">
                <MessageCircle className="w-6 h-6 text-[#30363d]" />
                <p>Hover over any calendar cell to view daily metrics</p>
              </div>
            )}
          </div>

          {/* Top 5 Most Active Days Section */}
          <div className="p-4 rounded-2xl border border-[#21262d] bg-[#12161c] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8b949e] uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              <span>Most Active Days</span>
            </div>

            <div className="space-y-1.5">
              {topActiveDays.map((day, idx) => (
                <button
                  key={day.date}
                  onClick={() => onSelectDate(day.date)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all border ${
                    selectedDate === day.date
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : 'bg-[#161b22] border-[#21262d] hover:border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 text-[10px] font-mono text-[#8b949e]">
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-white font-medium">{day.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-rose-400 font-medium">
                      {day.totalMessages.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#8b949e]">msgs</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
