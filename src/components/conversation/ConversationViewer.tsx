import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Message, DailyStats } from '../../types/archive';
import { MessageBubble } from './MessageBubble';
import { DaySummaryHeader } from './DaySummaryHeader';
import { TimelineScrubber } from './TimelineScrubber';
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';

interface ConversationViewerProps {
  date: string;
  messages: Message[];
  dailyStats: DailyStats[];
  isLoading: boolean;
  onSelectDate: (date: string) => void;
  highlightMessageId?: string | null;
  onOpenAiSummary?: () => void;
}

export const ConversationViewer: React.FC<ConversationViewerProps> = ({
  date,
  messages,
  dailyStats,
  isLoading,
  onSelectDate,
  highlightMessageId,
  onOpenAiSummary,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  const currentStats = useMemo(() => {
    return dailyStats.find((d) => d.date === date);
  }, [dailyStats, date]);

  const allDates = useMemo(() => {
    return dailyStats.map((d) => d.date).sort();
  }, [dailyStats]);

  // Filtered messages
  const filteredMessages = useMemo(() => {
    if (!filterQuery.trim()) return messages;
    const q = filterQuery.toLowerCase();
    return messages.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        m.senderDisplay.toLowerCase().includes(q) ||
        (m.shareText && m.shareText.toLowerCase().includes(q))
    );
  }, [messages, filterQuery]);

  // Virtualizer for smooth 60fps scrolling
  const rowVirtualizer = useVirtualizer({
    count: filteredMessages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 12,
  });

  // Jump to specific message when highlightMessageId is provided
  useEffect(() => {
    if (highlightMessageId && filteredMessages.length > 0) {
      const targetIndex = filteredMessages.findIndex(
        (m) => m.id === highlightMessageId
      );
      if (targetIndex !== -1) {
        rowVirtualizer.scrollToIndex(targetIndex, { align: 'center' });
      }
    }
  }, [highlightMessageId, filteredMessages, rowVirtualizer]);

  // Jump to a specific hour in the day
  const handleJumpToHour = (targetHour: number) => {
    const targetIndex = filteredMessages.findIndex((m) => {
      const d = new Date(m.timestamp);
      return d.getHours() >= targetHour;
    });

    if (targetIndex !== -1) {
      rowVirtualizer.scrollToIndex(targetIndex, { align: 'start' });
    }
  };

  const scrollToTop = () => {
    rowVirtualizer.scrollToIndex(0, { align: 'start' });
  };

  const scrollToBottom = () => {
    if (filteredMessages.length > 0) {
      rowVirtualizer.scrollToIndex(filteredMessages.length - 1, { align: 'end' });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] bg-[#0b0d10] overflow-hidden">
      {/* Day Summary & Review Header */}
      <DaySummaryHeader
        stats={currentStats}
        date={date}
        allDates={allDates}
        onSelectDate={onSelectDate}
        filterQuery={filterQuery}
        onFilterChange={setFilterQuery}
        onOpenAiSummary={onOpenAiSummary}
      />

      {/* Main Conversation Body: Messages Stream + Timeline Scrubber */}
      <div className="flex-1 flex overflow-hidden relative">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-xs font-mono">Loading conversation for {date}...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#8b949e] p-8 text-center">
            <p className="font-editorial text-lg text-white">No messages found</p>
            <p className="text-xs mt-1">
              {filterQuery ? `No matches for "${filterQuery}"` : 'No messages recorded on this day.'}
            </p>
          </div>
        ) : (
          <div
            ref={parentRef}
            className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 relative"
          >
            {/* Virtualized Container */}
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const message = filteredMessages[virtualRow.index];
                const isHighlighted = message.id === highlightMessageId;

                const isGroupedWithPrevious =
                  virtualRow.index > 0 &&
                  filteredMessages[virtualRow.index - 1].sender === message.sender &&
                  Math.abs(message.timestamp - filteredMessages[virtualRow.index - 1].timestamp) < 120000;

                const isGroupedWithNext =
                  virtualRow.index < filteredMessages.length - 1 &&
                  filteredMessages[virtualRow.index + 1].sender === message.sender &&
                  Math.abs(filteredMessages[virtualRow.index + 1].timestamp - message.timestamp) < 120000;

                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <MessageBubble
                      message={message}
                      isHighlighted={isHighlighted}
                      isGroupedWithPrevious={isGroupedWithPrevious}
                      isGroupedWithNext={isGroupedWithNext}
                    />
                  </div>
                );
              })}
            </div>

            {/* Jump Top & Bottom Float Controls */}
            <div className="fixed bottom-16 right-36 z-30 hidden md:flex flex-col gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <button
                onClick={scrollToTop}
                className="p-2 rounded-full bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white shadow-lg transition-colors"
                title="Jump to beginning of day"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={scrollToBottom}
                className="p-2 rounded-full bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white shadow-lg transition-colors"
                title="Jump to end of day"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 24-Hour Activity Timeline Scrubber on the Right */}
        {currentStats && (
          <TimelineScrubber
            hourlyActivity={currentStats.hourlyActivity}
            onJumpToHour={handleJumpToHour}
          />
        )}
      </div>
    </div>
  );
};
