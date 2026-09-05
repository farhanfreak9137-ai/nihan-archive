import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
} from 'lucide-react';
import {
  ArchiveMetadata,
  DailyStats,
  ExpressionEntry,
  NicknameEntry,
} from '../../types/archive';
import { fetchExpressions, fetchNicknames } from '../../lib/data';

import { ArchiveWrappedModal } from './ArchiveWrappedModal';
import { Sparkles, Play } from 'lucide-react';

interface AnalyticsViewProps {
  metadata: ArchiveMetadata | null;
  dailyStats: DailyStats[];
  onSearchExpression: (query: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  metadata,
  onSearchExpression,
}) => {
  const [expressions, setExpressions] = useState<ExpressionEntry[]>([]);
  const [nicknames, setNicknames] = useState<NicknameEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'balance' | 'time' | 'expressions' | 'nicknames' | 'reactions'>('balance');
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      try {
        const [exp, nicks] = await Promise.all([
          fetchExpressions(),
          fetchNicknames(),
        ]);
        if (!isCancelled) {
          setExpressions(exp);
          setNicknames(nicks);
        }
      } catch (e) {
        console.error('Failed to load analytics records:', e);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, []);

  if (!metadata) return null;

  const nilaPercent = ((metadata.participantsDisplay.NILA / metadata.totalMessages) * 100).toFixed(1);
  const farhanPercent = ((metadata.participantsDisplay.FARHAN / metadata.totalMessages) * 100).toFixed(1);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxHourlyTotal = Math.max(...metadata.hourlyTotals, 1);
  const maxDayOfWeekTotal = Math.max(...metadata.dayOfWeekTotals, 1);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Archive Wrapped Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-purple-950/80 via-rose-950/70 to-[#0b0d10] border border-rose-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>ANNUAL STORYTELLING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-editorial text-white font-bold tracking-tight">
            Our Archive Wrapped
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Experience the story of your connection through an interactive, full-screen animated retrospective. From 3 AM chats to voice note marathons and peak milestones.
          </p>
        </div>

        <button
          onClick={() => setIsWrappedOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm font-mono flex items-center gap-2.5 shadow-lg shadow-rose-500/30 active:scale-95 transition-all shrink-0"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch Story Mode</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-editorial text-white tracking-tight">
          Relationship & Conversation Analytics
        </h2>
        <p className="text-xs text-[#8b949e]">
          Empirical, data-driven analysis derived directly from 52,784 timestamped messages.
        </p>
      </div>

      {/* Analytics Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#21262d] pb-2 overflow-x-auto text-xs font-mono">
        {[
          { id: 'balance', label: 'Communication Balance' },
          { id: 'time', label: '24h & Weekly Rhythm' },
          { id: 'expressions', label: 'Lexical Expressions' },
          { id: 'nicknames', label: 'Nickname Dictionary' },
          { id: 'reactions', label: 'Reactions & Shares' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium'
                : 'text-[#8b949e] hover:text-white hover:bg-[#12161c]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: COMMUNICATION BALANCE */}
      {activeTab === 'balance' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Balance Meter Card */}
          <div className="p-6 rounded-2xl bg-[#12161c] border border-[#21262d] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-lg text-white font-medium">
                Overall Message Balance
              </h3>
              <span className="text-xs font-mono text-[#8b949e]">
                52,784 Total Messages
              </span>
            </div>

            {/* Split Visual Bar */}
            <div className="space-y-2">
              <div className="w-full h-4 rounded-full bg-[#161b22] overflow-hidden flex border border-[#21262d]">
                <div
                  style={{ width: `${nilaPercent}%` }}
                  className="h-full bg-rose-500 transition-all flex items-center justify-center text-[10px] font-mono text-white font-bold"
                />
                <div
                  style={{ width: `${farhanPercent}%` }}
                  className="h-full bg-sky-400 transition-all flex items-center justify-center text-[10px] font-mono text-black font-bold"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-medium">NILA: {nilaPercent}%</span>
                <span className="text-sky-400 font-medium">FARHAN: {farhanPercent}%</span>
              </div>
            </div>

            {/* Stats Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-2">
                <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>NILA</span>
                </div>
                <div className="text-3xl font-mono text-white font-bold">
                  {metadata.participantsDisplay.NILA.toLocaleString()}
                </div>
                <div className="text-xs text-[#8b949e]">
                  Average{' '}
                  <strong className="text-white font-mono">
                    {Math.round(metadata.participantsDisplay.NILA / metadata.activeDays)}
                  </strong>{' '}
                  messages per day across 60 active days.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-2">
                <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span>FARHAN</span>
                </div>
                <div className="text-3xl font-mono text-white font-bold">
                  {metadata.participantsDisplay.FARHAN.toLocaleString()}
                </div>
                <div className="text-xs text-[#8b949e]">
                  Average{' '}
                  <strong className="text-white font-mono">
                    {Math.round(metadata.participantsDisplay.FARHAN / metadata.activeDays)}
                  </strong>{' '}
                  messages per day across 60 active days.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIME & RHYTHM */}
      {activeTab === 'time' && (
        <div className="space-y-6 animate-fade-in">
          {/* 24-Hour Activity Histogram */}
          <div className="p-6 rounded-2xl bg-[#12161c] border border-[#21262d] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-lg text-white font-medium">
                  24-Hour Activity Distribution
                </h3>
                <p className="text-xs text-[#8b949e]">
                  Aggregated conversation volume by hour of day (00:00 to 23:00)
                </p>
              </div>
              <Clock className="w-4 h-4 text-rose-400" />
            </div>

            {/* Bar Chart */}
            <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 items-end h-48 pt-6 border-b border-[#21262d]">
              {metadata.hourlyTotals.map((count, hour) => {
                const heightPercent = Math.max(4, Math.round((count / maxHourlyTotal) * 100));
                const ampm = hour >= 12 ? 'p' : 'a';
                const displayH = hour % 12 === 0 ? 12 : hour % 12;

                return (
                  <div
                    key={hour}
                    className="flex flex-col items-center gap-1.5 h-full justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#161b22] border border-[#30363d] px-1.5 py-0.5 rounded text-[10px] font-mono text-white pointer-events-none z-20 whitespace-nowrap shadow-md">
                      {hour}:00 • {count.toLocaleString()} msgs
                    </div>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t transition-all ${
                        count >= 3500
                          ? 'bg-rose-500 group-hover:bg-rose-400'
                          : count >= 2000
                          ? 'bg-amber-400 group-hover:bg-amber-300'
                          : 'bg-sky-500/70 group-hover:bg-sky-400'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-[#8b949e]">
                      {displayH}{ampm}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day of Week Distribution */}
          <div className="p-6 rounded-2xl bg-[#12161c] border border-[#21262d] space-y-4">
            <h3 className="font-editorial text-lg text-white font-medium">
              Day of Week Activity
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {metadata.dayOfWeekTotals.map((total, idx) => {
                const heightPercent = Math.round((total / maxDayOfWeekTotal) * 100);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#161b22] border border-[#21262d] text-center space-y-1.5"
                  >
                    <div className="text-xs font-mono font-medium text-[#8b949e]">
                      {daysOfWeek[idx]}
                    </div>
                    <div className="text-sm font-mono text-white font-semibold">
                      {total.toLocaleString()}
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#0b0d10] overflow-hidden">
                      <div
                        style={{ width: `${heightPercent}%` }}
                        className="h-full bg-rose-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEXICAL EXPRESSIONS */}
      {activeTab === 'expressions' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 rounded-xl bg-[#12161c] border border-[#21262d] text-xs text-[#8b949e]">
            Precise lexical regex matching across the archive. Distinguishes message count, total occurrences, and sender attribution.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expressions.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-xl bg-[#12161c] border border-[#21262d] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-editorial text-lg text-white font-medium">
                      "{exp.label}"
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      {exp.category}
                    </span>
                  </div>

                  <button
                    onClick={() => onSearchExpression(exp.label)}
                    className="p-1.5 rounded-lg bg-[#161b22] hover:bg-rose-500/20 text-[#8b949e] hover:text-rose-300 border border-[#21262d] transition-colors"
                    title={`Search "${exp.label}" in archive`}
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Message Count */}
                  <div className="p-2.5 rounded-lg bg-[#0b0d10] border border-[#21262d] space-y-1">
                    <div className="text-[10px] text-[#8b949e] font-mono uppercase">
                      In Messages
                    </div>
                    <div className="text-base font-mono text-white font-semibold">
                      {exp.messagesCount.total}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                      <span className="text-rose-400">NILA: {exp.messagesCount.NILU}</span>
                      <span className="text-sky-400">FARHAN: {exp.messagesCount.farhannn}</span>
                    </div>
                  </div>

                  {/* Raw Occurrences */}
                  <div className="p-2.5 rounded-lg bg-[#0b0d10] border border-[#21262d] space-y-1">
                    <div className="text-[10px] text-[#8b949e] font-mono uppercase">
                      Total Occurrences
                    </div>
                    <div className="text-base font-mono text-white font-semibold">
                      {exp.totalOccurrences.total}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                      <span className="text-rose-400">NILA: {exp.totalOccurrences.NILU}</span>
                      <span className="text-sky-400">FARHAN: {exp.totalOccurrences.farhannn}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: NICKNAME DICTIONARY */}
      {activeTab === 'nicknames' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 rounded-xl bg-[#12161c] border border-[#21262d] text-xs text-[#8b949e]">
            Contextual frequency analysis of affection terms and nicknames used between NILA and FARHAN. Click any term to search its messages.
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {nicknames.map((nick) => (
              <div
                key={nick.nickname}
                onClick={() => onSearchExpression(nick.nickname)}
                className="p-3.5 rounded-xl bg-[#12161c] border border-[#21262d] hover:border-[#30363d] hover:bg-[#161b22] cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-editorial text-base text-white font-medium group-hover:text-rose-300 transition-colors">
                    {nick.nickname}
                  </span>
                  <span className="text-xs font-mono text-white font-bold bg-[#0b0d10] px-2 py-0.5 rounded border border-[#21262d]">
                    {nick.totalCount}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#8b949e] pt-1 border-t border-[#21262d]">
                  <span className="text-rose-400">NILA: {nick.bySender.NILU}</span>
                  <span className="text-sky-400">FARHAN: {nick.bySender.farhannn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REACTIONS & SHARES */}
      {activeTab === 'reactions' && (
        <div className="space-y-6 animate-fade-in">
          {/* Shares Breakdown */}
          <div className="p-6 rounded-2xl bg-[#12161c] border border-[#21262d] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-lg text-white font-medium">
                Shared Content Breakdown
              </h3>
              <span className="text-xs font-mono text-white">
                {metadata.shares.total.toLocaleString()} Total Shares
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-1">
                <div className="text-[10px] uppercase font-mono text-[#8b949e]">Instagram Reels</div>
                <div className="text-2xl font-mono text-white font-bold">{metadata.shares.reels}</div>
                <div className="text-[11px] text-[#8b949e] font-mono">
                  NILA {metadata.sharesBySender.NILU.reels} • FARHAN {metadata.sharesBySender.farhannn.reels}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-1">
                <div className="text-[10px] uppercase font-mono text-[#8b949e]">Posts</div>
                <div className="text-2xl font-mono text-white font-bold">{metadata.shares.posts}</div>
                <div className="text-[11px] text-[#8b949e] font-mono">
                  NILA {metadata.sharesBySender.NILU.posts} • FARHAN {metadata.sharesBySender.farhannn.posts}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-1">
                <div className="text-[10px] uppercase font-mono text-[#8b949e]">Stories</div>
                <div className="text-2xl font-mono text-white font-bold">{metadata.shares.stories}</div>
                <div className="text-[11px] text-[#8b949e] font-mono">
                  NILA {metadata.sharesBySender.NILU.stories} • FARHAN {metadata.sharesBySender.farhannn.stories}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-1">
                <div className="text-[10px] uppercase font-mono text-[#8b949e]">Other Links</div>
                <div className="text-2xl font-mono text-white font-bold">{metadata.shares.other}</div>
                <div className="text-[11px] text-[#8b949e] font-mono">
                  NILA {metadata.sharesBySender.NILU.other} • FARHAN {metadata.sharesBySender.farhannn.other}
                </div>
              </div>
            </div>
          </div>

          {/* Reactions Usage Breakdown */}
          <div className="p-6 rounded-2xl bg-[#12161c] border border-[#21262d] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-lg text-white font-medium">
                Reaction Usage Matrix
              </h3>
              <span className="text-xs font-mono text-white">
                {metadata.reactions.total.toLocaleString()} Total Reactions
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(metadata.reactions.byEmoji).map(([emoji, counts]) => (
                <div
                  key={emoji}
                  className="p-3.5 rounded-xl bg-[#161b22] border border-[#21262d] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <div className="text-sm font-mono text-white font-bold">
                        {counts.total}
                      </div>
                      <div className="text-[10px] text-[#8b949e] font-mono">
                        N {counts.NILU} • F {counts.farhannn}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Archive Wrapped Modal */}
      <ArchiveWrappedModal
        isOpen={isWrappedOpen}
        onClose={() => setIsWrappedOpen(false)}
        metadata={metadata}
      />
    </div>
  );
};
