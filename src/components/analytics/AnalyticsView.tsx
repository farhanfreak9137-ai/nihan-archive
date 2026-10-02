import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Search,
  Sparkles,
  Play,
  Moon,
  Flame,
  Heart,
  Sun,
  Zap,
  ArrowRight,
} from 'lucide-react';
import {
  ArchiveMetadata,
  DailyStats,
  ExpressionEntry,
  NicknameEntry,
} from '../../types/archive';
import { fetchExpressions, fetchNicknames } from '../../lib/data';
import { ArchiveWrappedModal } from './ArchiveWrappedModal';
import { RelationshipAuraModal } from './RelationshipAuraModal';

interface AnalyticsViewProps {
  metadata: ArchiveMetadata | null;
  dailyStats: DailyStats[];
  onSearchExpression: (query: string) => void;
  onSelectDate?: (date: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  metadata,
  dailyStats,
  onSearchExpression,
  onSelectDate,
}) => {
  const [expressions, setExpressions] = useState<ExpressionEntry[]>([]);
  const [nicknames, setNicknames] = useState<NicknameEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'surprises' | 'aura' | 'balance' | 'time' | 'expressions' | 'nicknames' | 'reactions'>('surprises');
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [isAuraOpen, setIsAuraOpen] = useState(false);

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

  // Surprise Deep-Dive Analytics Computations
  const surpriseStats = useMemo(() => {
    // 1. Night Owls (hours 0, 1, 2, 3, 4)
    const nightHours = [0, 1, 2, 3, 4];
    let nightMessages = 0;
    for (const h of nightHours) {
      nightMessages += metadata.hourlyTotals[h] || 0;
    }
    const nightPercentage = ((nightMessages / metadata.totalMessages) * 100).toFixed(1);

    // 2. Daytime (hours 7 to 19)
    let dayMessages = 0;
    for (let h = 7; h <= 19; h++) {
      dayMessages += metadata.hourlyTotals[h] || 0;
    }
    const dayPercentage = ((dayMessages / metadata.totalMessages) * 100).toFixed(1);

    // 3. Top 5 Marathon Days
    const marathons = [...dailyStats]
      .sort((a, b) => b.totalMessages - a.totalMessages)
      .slice(0, 5);

    // 4. Heart Reactions
    const redHeartsData = metadata.reactions.byEmoji['❤️'] || metadata.reactions.byEmoji['❤'] || { total: 0, NILU: 0, farhannn: 0 };
    const whiteHeartsData = metadata.reactions.byEmoji['🤍'] || { total: 0, NILU: 0, farhannn: 0 };
    const totalHearts = (redHeartsData.total || 0) + (whiteHeartsData.total || 0);
    const heartPercentage = metadata.reactions.total > 0
      ? ((totalHearts / metadata.reactions.total) * 100).toFixed(1)
      : '0';

    // 5. Daily Velocity
    const avgMessagesPerDay = Math.round(metadata.totalMessages / Math.max(1, metadata.activeDays));
    const avgVoiceNotesPerDay = (metadata.media.audio / Math.max(1, metadata.activeDays)).toFixed(1);

    return {
      nightMessages,
      nightPercentage,
      dayMessages,
      dayPercentage,
      marathons,
      totalHearts,
      heartPercentage,
      redHeartsData,
      whiteHeartsData,
      avgMessagesPerDay,
      avgVoiceNotesPerDay,
    };
  }, [metadata, dailyStats]);

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

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAuraOpen(true)}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600/30 to-rose-600/30 hover:from-purple-600/40 hover:to-rose-600/40 border border-purple-500/40 text-purple-200 font-semibold text-xs sm:text-sm font-mono flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            title="Open Relationship Aura & Mood Spectrum"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>Relationship Aura</span>
          </button>
          <button
            onClick={() => setIsWrappedOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm font-mono flex items-center gap-2.5 shadow-lg shadow-rose-500/30 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Story Mode</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-editorial text-white tracking-tight">
          Relationship & Conversation Analytics
        </h2>
        <p className="text-xs text-[#8b949e]">
          Empirical, data-driven analysis derived directly from {metadata.totalMessages.toLocaleString()} timestamped messages.
        </p>
      </div>

      {/* Analytics Category Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-[#21262d] pb-2 overflow-x-auto text-xs font-mono no-scrollbar">
        {[
          { id: 'surprises', label: '✨ Deep Connection & Surprises' },
          { id: 'aura', label: '🔮 Relationship Aura & Spectrum' },
          { id: 'balance', label: 'Communication Balance' },
          { id: 'time', label: '24h & Weekly Rhythm' },
          { id: 'expressions', label: 'Lexical Expressions' },
          { id: 'nicknames', label: 'Nickname Dictionary' },
          { id: 'reactions', label: 'Reactions & Shares' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg shrink-0 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium'
                : 'text-[#8b949e] hover:text-white hover:bg-[#12161c]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 0: DEEP CONNECTION & SURPRISES */}
      {activeTab === 'surprises' && (
        <div className="space-y-6 animate-fade-in">
          {/* Section 1: The Night Owls Index */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#12161c] via-[#161b22] to-[#0f1319] border border-purple-500/30 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold mb-2">
                  <Moon className="w-3.5 h-3.5 text-purple-400" />
                  <span>NIGHT OWLS INDEX • 12 AM – 5 AM</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-editorial text-white font-bold tracking-tight">
                  Late-Night Heart-to-Hearts
                </h3>
                <p className="text-xs text-[#8b949e]">
                  Over a quarter of your entire relationship unfolded while the rest of the world was asleep.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-3xl font-editorial font-bold text-purple-300 block">
                  {surpriseStats.nightMessages.toLocaleString()}
                </span>
                <span className="text-[11px] font-mono text-[#8b949e]">
                  {surpriseStats.nightPercentage}% of all messages
                </span>
              </div>
            </div>

            {/* Night vs Day Visual Progress Bar */}
            <div className="space-y-2 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs font-mono">
                <span className="text-purple-300 flex items-center gap-1">
                  <Moon className="w-3 h-3 shrink-0" />
                  <span>Midnight to 5 AM: {surpriseStats.nightPercentage}%</span>
                </span>
                <span className="text-amber-300 flex items-center gap-1">
                  <Sun className="w-3 h-3 shrink-0" />
                  <span>Daylight Hours (7 AM - 7 PM): {surpriseStats.dayPercentage}%</span>
                </span>
              </div>

              <div className="w-full h-4 rounded-full bg-[#0b0d10] overflow-hidden flex border border-[#21262d]">
                <div
                  style={{ width: `${surpriseStats.nightPercentage}%` }}
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all flex items-center justify-center text-[10px] font-mono text-white font-bold"
                />
                <div
                  style={{ width: `${100 - Number(surpriseStats.nightPercentage)}%` }}
                  className="h-full bg-gradient-to-r from-amber-500/40 to-rose-500/40 transition-all flex items-center justify-center text-[10px] font-mono text-white/80"
                />
              </div>
            </div>

            {/* Night Owl Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
              <div className="p-4 rounded-2xl bg-[#0b0d10]/80 border border-[#21262d] space-y-1">
                <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Midnight Messages</span>
                <span className="text-xl font-editorial font-bold text-white">
                  {surpriseStats.nightMessages.toLocaleString()}
                </span>
                <p className="text-[11px] text-[#8b949e]">
                  Peak late-night hour: <strong className="text-white font-mono">12 AM - 1 AM</strong> (7,126 msgs)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0d10]/80 border border-[#21262d] space-y-1">
                <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Nila's Night Share</span>
                <span className="text-xl font-editorial font-bold text-rose-300">50.6%</span>
                <p className="text-[11px] text-[#8b949e]">
                  9,054 messages sent after midnight
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0d10]/80 border border-[#21262d] space-y-1">
                <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Farhan's Night Share</span>
                <span className="text-xl font-editorial font-bold text-sky-300">49.4%</span>
                <p className="text-[11px] text-[#8b949e]">
                  8,827 messages sent after midnight
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Texting Marathons Hall of Fame */}
          <div className="p-6 rounded-3xl bg-[#12161c] border border-[#21262d] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold mb-2">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>TOP 5 TEXTING MARATHONS</span>
                </div>
                <h3 className="text-xl font-editorial text-white font-bold tracking-tight">
                  The Heavyweight Conversation Days
                </h3>
                <p className="text-xs text-[#8b949e]">
                  The all-time record days where conversations never stopped from sunrise to dawn.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {surpriseStats.marathons.map((day, idx) => {
                const medals = ['🥇', '🥈', '🥉', '4th', '5th'];
                const nilaPct = ((day.nilaMessages / day.totalMessages) * 100).toFixed(0);
                const farhanPct = ((day.farhanMessages / day.totalMessages) * 100).toFixed(0);

                return (
                  <div
                    key={day.date}
                    className="p-4 rounded-2xl bg-[#161b22] hover:bg-[#1a2029] border border-[#21262d] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0b0d10] border border-[#21262d] flex items-center justify-center text-base font-mono font-bold shrink-0">
                        {medals[idx]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-editorial text-base text-white font-semibold whitespace-nowrap">
                            {day.date}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0b0d10] text-[#8b949e] border border-[#21262d] whitespace-nowrap">
                            Peak: {day.peakHour}:00 ({day.peakHourCount} msgs)
                          </span>
                        </div>
                        <div className="text-[11px] sm:text-xs text-[#8b949e] font-mono mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <strong className="text-rose-400 whitespace-nowrap">Nila: {day.nilaMessages}</strong> ({nilaPct}%) •{' '}
                          <strong className="text-sky-400 whitespace-nowrap">Farhan: {day.farhanMessages}</strong> ({farhanPct}%) •{' '}
                          <span className="whitespace-nowrap">🎙️ {day.audioNotes} voice notes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <span className="text-xl font-mono font-bold text-white">
                        {day.totalMessages.toLocaleString()} msgs
                      </span>
                      {onSelectDate && (
                        <button
                          onClick={() => onSelectDate(day.date)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-1 transition-colors"
                        >
                          <span>View Day</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Affection Chemistry & Daily Velocity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Heart Reactions Chemistry */}
            <div className="p-6 rounded-3xl bg-[#12161c] border border-[#21262d] space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="font-editorial text-lg text-white font-bold">
                  Heart Reactions Chemistry
                </h3>
              </div>
              <p className="text-xs text-[#8b949e]">
                Hearts dominate your reaction vocabulary above all other emojis combined.
              </p>

              <div className="p-4 rounded-2xl bg-[#161b22] border border-[#21262d] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8b949e]">Combined Heart Reactions</span>
                  <span className="text-2xl font-mono font-bold text-rose-400">
                    {surpriseStats.totalHearts.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs font-mono text-[#8b949e]">
                  Hearts make up <strong className="text-white">{surpriseStats.heartPercentage}%</strong> of all {metadata.reactions.total.toLocaleString()} reactions given!
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#0b0d10] border border-[#21262d]">
                    <span className="text-base block mb-1">❤️ Red Hearts</span>
                    <span className="text-white font-bold">{surpriseStats.redHeartsData.total.toLocaleString()} times</span>
                    <span className="text-[10px] text-[#8b949e] block">N: {surpriseStats.redHeartsData.NILU} • F: {surpriseStats.redHeartsData.farhannn}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0b0d10] border border-[#21262d]">
                    <span className="text-base block mb-1">🤍 White Hearts</span>
                    <span className="text-white font-bold">{surpriseStats.whiteHeartsData.total.toLocaleString()} times</span>
                    <span className="text-[10px] text-[#8b949e] block">N: {surpriseStats.whiteHeartsData.NILU} • F: {surpriseStats.whiteHeartsData.farhannn}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Velocity & Stamina */}
            <div className="p-6 rounded-3xl bg-[#12161c] border border-[#21262d] space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-editorial text-lg text-white font-bold">
                  Daily Rhythm & Consistency
                </h3>
              </div>
              <p className="text-xs text-[#8b949e]">
                Every single day without exception was marked by communication.
              </p>

              <div className="p-4 rounded-2xl bg-[#161b22] border border-[#21262d] space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#0b0d10] border border-[#21262d]">
                    <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Daily Average</span>
                    <span className="text-xl font-mono font-bold text-white">
                      {surpriseStats.avgMessagesPerDay}
                    </span>
                    <span className="text-[10px] text-[#8b949e] block">messages / day</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b0d10] border border-[#21262d]">
                    <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Voice Cadence</span>
                    <span className="text-xl font-mono font-bold text-teal-300">
                      {surpriseStats.avgVoiceNotesPerDay}
                    </span>
                    <span className="text-[10px] text-[#8b949e] block">voice notes / day</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs font-mono text-[#8b949e]">
                  Active Streak: <strong className="text-white">{metadata.activeDays} consecutive active days</strong> from {metadata.startDate} to {metadata.endDate}.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RELATIONSHIP AURA & SPECTRUM */}
      {activeTab === 'aura' && (
        <div className="space-y-6 animate-fade-in">
          {/* Hero Studio Banner */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950/80 via-purple-950/70 to-[#0b0d10] border border-purple-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>EMOTIONAL ENERGY SYNTHESIS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-editorial text-white font-bold tracking-tight">
                The Relationship Aura Spectrum
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                A dynamic chromatic translation of your emotional rhythms. Derived from 80,988 messages, 2,147 voice notes, reaction ratios, and late-night nocturnal frequencies.
              </p>
            </div>

            <button
              onClick={() => setIsAuraOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-rose-500 to-amber-500 hover:from-purple-600 hover:to-amber-600 text-white font-semibold text-xs sm:text-sm font-mono flex items-center gap-2.5 shadow-lg shadow-purple-500/30 active:scale-95 transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Launch Interactive Aura Studio 🔮</span>
            </button>
          </div>

          {/* 4 Monthly Mood Aura Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-editorial text-white font-medium">
                Monthly Mood & Aura Spectra
              </h3>
              <span className="text-xs font-mono text-[#8b949e]">
                Click any chapter to inspect
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* July */}
              <div
                onClick={() => setIsAuraOpen(true)}
                className="cursor-pointer p-5 rounded-3xl bg-gradient-to-br from-[#16131c] via-[#12161c] to-[#0b0d10] border border-amber-500/30 hover:border-amber-400/60 shadow-lg transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    July 2026 • Chapter 1
                  </span>
                  <span className="text-[#8b949e]">19,000+ msgs</span>
                </div>
                <h4 className="text-lg font-editorial text-white font-bold group-hover:text-amber-200 transition-colors">
                  Electric Genesis & Tender Awakening
                </h4>
                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  The initial spark of playful sarcasm, Nila's iconic 10 rules, and the first midnight "I love you".
                </p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span className="ml-1 text-[#8b949e]">Gold • Crimson • Cyan</span>
                </div>
              </div>

              {/* August */}
              <div
                onClick={() => setIsAuraOpen(true)}
                className="cursor-pointer p-5 rounded-3xl bg-gradient-to-br from-[#16121c] via-[#12161c] to-[#0b0d10] border border-purple-500/30 hover:border-purple-400/60 shadow-lg transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    August 2026 • Chapter 2
                  </span>
                  <span className="text-[#8b949e]">25,000+ msgs</span>
                </div>
                <h4 className="text-lg font-editorial text-white font-bold group-hover:text-purple-200 transition-colors">
                  Velvet Midnight & Poetic Yearning
                </h4>
                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  The 3 AM conversations, the longing for physical hugs, and the dream of holding each other so scents fuse.
                </p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-purple-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="ml-1 text-[#8b949e]">Indigo • Fuchsia • Rose</span>
                </div>
              </div>

              {/* September */}
              <div
                onClick={() => setIsAuraOpen(true)}
                className="cursor-pointer p-5 rounded-3xl bg-gradient-to-br from-[#1c1214] via-[#12161c] to-[#0b0d10] border border-rose-500/30 hover:border-rose-400/60 shadow-lg transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    September 2026 • Chapter 3
                  </span>
                  <span className="text-[#8b949e]">35,000+ msgs</span>
                </div>
                <h4 className="text-lg font-editorial text-white font-bold group-hover:text-rose-200 transition-colors">
                  High-Frequency Climax & Stormproof Devotion
                </h4>
                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  The all-time 2,096-message marathon, explosive voice note velocity, and steady reassurance when things got heavy.
                </p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-rose-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-1 text-[#8b949e]">Crimson • Amber • Emerald</span>
                </div>
              </div>

              {/* October */}
              <div
                onClick={() => setIsAuraOpen(true)}
                className="cursor-pointer p-5 rounded-3xl bg-gradient-to-br from-[#12181b] via-[#12161c] to-[#0b0d10] border border-teal-500/30 hover:border-teal-400/60 shadow-lg transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    October 2026 • Chapter 4
                  </span>
                  <span className="text-[#8b949e]">Autumn Gateway</span>
                </div>
                <h4 className="text-lg font-editorial text-white font-bold group-hover:text-teal-200 transition-colors">
                  Peaceful Horizon & The Shared Future
                </h4>
                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  "Meri khushi, mera sukoon aur mera aane wala kal... sab sirf tumse hai." Complete serenity and certainty.
                </p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-teal-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  <span className="ml-1 text-[#8b949e]">Lavender • Peach • Teal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: COMMUNICATION BALANCE */}
      {activeTab === 'balance' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Balance Meter Card */}
          <div className="p-6 rounded-2xl bg-[#12161c] border border-[#21262d] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
              <h3 className="font-editorial text-lg text-white font-medium">
                Overall Message Balance
              </h3>
              <span className="text-xs font-mono text-[#8b949e]">
                {metadata.totalMessages.toLocaleString()} Total Messages
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
                  messages per day across {metadata.activeDays} active days.
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
                  messages per day across {metadata.activeDays} active days.
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
            <div className="overflow-x-auto no-scrollbar pb-2">
              <div className="flex items-end gap-1.5 h-48 pt-6 min-w-[560px] border-b border-[#21262d]">
                {metadata.hourlyTotals.map((count, hour) => {
                  const heightPercent = Math.max(4, Math.round((count / maxHourlyTotal) * 100));
                  const ampm = hour >= 12 ? 'p' : 'a';
                  const displayH = hour % 12 === 0 ? 12 : hour % 12;

                  return (
                    <div
                      key={hour}
                      className="flex-1 min-w-[18px] flex flex-col items-center gap-1.5 h-full justify-end group relative"
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
          </div>

          {/* Day of Week Distribution */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[#12161c] border border-[#21262d] space-y-4">
            <h3 className="font-editorial text-lg text-white font-medium">
              Day of Week Activity
            </h3>
            <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-7 gap-2">
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
                    <div className="text-xs sm:text-sm font-mono text-white font-semibold truncate" title={total.toLocaleString()}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-1">
                <div className="text-[10px] uppercase font-mono text-[#8b949e]">Instagram Reels</div>
                <div className="text-2xl font-mono text-white font-bold">{metadata.shares.reels}</div>
                <div className="text-[11px] text-[#8b949e] font-mono break-words">
                  NILA {metadata.sharesBySender.NILU.reels} • FARHAN {metadata.sharesBySender.farhannn.reels}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-1">
                <div className="text-[10px] uppercase font-mono text-[#8b949e]">Posts</div>
                <div className="text-2xl font-mono text-white font-bold">{metadata.shares.posts}</div>
                <div className="text-[11px] text-[#8b949e] font-mono break-words">
                  NILA {metadata.sharesBySender.NILU.posts} • FARHAN {metadata.sharesBySender.farhannn.posts}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-1">
                <div className="text-[10px] uppercase font-mono text-[#8b949e]">Stories</div>
                <div className="text-2xl font-mono text-white font-bold">{metadata.shares.stories}</div>
                <div className="text-[11px] text-[#8b949e] font-mono break-words">
                  NILA {metadata.sharesBySender.NILU.stories} • FARHAN {metadata.sharesBySender.farhannn.stories}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-1">
                <div className="text-[10px] uppercase font-mono text-[#8b949e]">Other Links</div>
                <div className="text-2xl font-mono text-white font-bold">{metadata.shares.other}</div>
                <div className="text-[11px] text-[#8b949e] font-mono break-words">
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
        dailyStats={dailyStats}
      />

      {/* Relationship Aura & Mood Spectrum Modal */}
      <RelationshipAuraModal
        isOpen={isAuraOpen}
        onClose={() => setIsAuraOpen(false)}
        metadata={metadata}
        dailyStats={dailyStats}
        expressions={expressions}
        nicknames={nicknames}
        onSelectDate={onSelectDate}
      />
    </div>
  );
};
