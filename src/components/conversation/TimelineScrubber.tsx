import React from 'react';
import { Clock } from 'lucide-react';

interface TimelineScrubberProps {
  hourlyActivity: number[]; // 24 numbers
  onJumpToHour: (hour: number) => void;
  activeHour?: number;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  hourlyActivity,
  onJumpToHour,
  activeHour,
}) => {
  const maxHourlyCount = Math.max(...hourlyActivity, 1);

  return (
    <div className="hidden lg:flex flex-col justify-between w-28 bg-[#0b0d10]/95 border-l border-[#21262d] p-3 text-xs shrink-0 select-none overflow-y-auto">
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8b949e] uppercase tracking-wider mb-2">
        <Clock className="w-3 h-3 text-rose-400" />
        <span>24h Timeline</span>
      </div>

      <div className="space-y-1">
        {hourlyActivity.map((count, hour) => {
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 === 0 ? 12 : hour % 12;
          const label = `${displayHour}${ampm}`;
          const isCurrent = activeHour === hour;
          const hasActivity = count > 0;
          const densityWidth = hasActivity
            ? Math.max(4, Math.round((count / maxHourlyCount) * 28))
            : 2;

          return (
            <button
              key={hour}
              onClick={() => hasActivity && onJumpToHour(hour)}
              disabled={!hasActivity}
              className={`w-full flex items-center justify-between group py-0.5 px-1 rounded transition-colors text-[10px] font-mono ${
                !hasActivity
                  ? 'text-[#30363d] cursor-not-allowed'
                  : isCurrent
                  ? 'text-rose-400 font-bold bg-rose-500/10'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
              }`}
              title={`${label}: ${count} messages`}
            >
              <span className="w-8 text-left">{label}</span>

              {/* Activity indicator bar & dot */}
              <div className="flex items-center gap-1">
                {hasActivity ? (
                  <>
                    <div
                      style={{ width: `${densityWidth}px` }}
                      className={`h-1 rounded-full transition-all ${
                        count >= 100
                          ? 'bg-rose-500'
                          : count >= 40
                          ? 'bg-amber-400'
                          : 'bg-sky-400/80'
                      }`}
                    />
                    <span className="text-[9px] text-[#8b949e] w-5 text-right">
                      {count}
                    </span>
                  </>
                ) : (
                  <span className="text-[9px] text-[#21262d]">•</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
