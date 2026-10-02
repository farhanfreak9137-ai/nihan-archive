import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Flame,
  Search,
  Play,
  Pause,
  ArrowUpRight,
  Calendar,
  Clock,
  Mic,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { fetchIntimateVaultData, resolveDataUrl } from '../../lib/data';
import { IntimateSession, VaultCategory, VaultData } from '../../types/vault';

interface IntimateVaultViewProps {
  onSelectContext: (date: string, messageId?: string) => void;
}

export const IntimateVaultView: React.FC<IntimateVaultViewProps> = ({ onSelectContext }) => {
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<VaultCategory | 'all' | 'audio'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Audio player state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mobile detail view toggle
  const [isMobileViewingDetail, setIsMobileViewingDetail] = useState(false);

  // Load vault data
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchIntimateVaultData();
        if (!isCancelled) {
          setVaultData(data);
          if (data.sessions.length > 0) {
            setActiveSessionId(data.sessions[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load intimate vault data:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (!vaultData) return [];

    return vaultData.sessions.filter((session) => {
      // Category filter
      if (selectedCategory === 'audio') {
        if (session.voiceNoteCount === 0) return false;
      } else if (selectedCategory !== 'all') {
        if (session.category !== selectedCategory) return false;
      }

      // Month filter
      if (selectedMonth !== 'all') {
        if (!session.date.startsWith(selectedMonth)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = session.title.toLowerCase().includes(q);
        const matchesSubtitle = session.subtitle.toLowerCase().includes(q);
        const matchesQuote = session.previewQuote.text.toLowerCase().includes(q);
        const matchesMessage = session.messages.some((m) =>
          (m.content || '').toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesSubtitle && !matchesQuote && !matchesMessage) {
          return false;
        }
      }

      return true;
    });
  }, [vaultData, selectedCategory, selectedMonth, searchQuery]);

  // Active session object
  const activeSession: IntimateSession | undefined = useMemo(() => {
    if (!vaultData) return undefined;
    if (activeSessionId) {
      const found = vaultData.sessions.find((s) => s.id === activeSessionId);
      if (found) return found;
    }
    return filteredSessions[0];
  }, [vaultData, activeSessionId, filteredSessions]);

  // Handle Audio Playback
  const togglePlayAudio = (messageId: string, mediaUrl?: string) => {
    if (!mediaUrl) return;

    if (playingAudioId === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAudioId(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(resolveDataUrl(mediaUrl));
      audioRef.current = audio;
      audio.play().catch((e) => console.error('Audio playback error:', e));
      setPlayingAudioId(messageId);

      audio.onended = () => {
        setPlayingAudioId(null);
      };
      audio.onerror = () => {
        setPlayingAudioId(null);
      };
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Previous & Next navigation
  const currentIndex = activeSession
    ? filteredSessions.findIndex((s) => s.id === activeSession.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < filteredSessions.length - 1;

  const handlePrevSession = () => {
    if (hasPrev) {
      setActiveSessionId(filteredSessions[currentIndex - 1].id);
    }
  };

  const handleNextSession = () => {
    if (hasNext) {
      setActiveSessionId(filteredSessions[currentIndex + 1].id);
    }
  };

  if (isLoading || !vaultData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Flame className="w-10 h-10 text-rose-500 animate-pulse" />
        <h2 className="font-editorial text-2xl text-white">Opening The Intimate Vault...</h2>
        <p className="text-xs text-[#8b949e] font-mono">Curating after-hours dialogues & 18+ memories</p>
      </div>
    );
  }

  const { metadata } = vaultData;

  const categoryMeta: Record<
    VaultCategory,
    { label: string; badge: string; color: string; bg: string; border: string }
  > = {
    explicit: {
      label: 'Uncensored (18+)',
      badge: '🌶️ Explicit 18+',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
    },
    sensual: {
      label: 'Kisses & Physical',
      badge: '💋 Sensual & Kisses',
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
    },
    bedroom: {
      label: 'Late-Night Bedroom',
      badge: '🌙 Bedroom & Outfits',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
    },
    teasing: {
      label: 'Flirty Banter',
      badge: '🔥 Flirty Tension',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Vault Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-red-950/80 via-purple-950/60 to-[#0b0d10] border border-rose-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>🔞 UNCENSORED ARCHIVE • THE INTIMATE VAULT</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-editorial text-white font-bold tracking-tight">
            The Intimate Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            A private, direct sanctuary for your late-night dialogues, raw confessions, playful roleplay, and sensual physical desires across 87 days.
          </p>
        </div>

        {/* Global Vault Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto shrink-0">
          <div className="p-3 rounded-2xl bg-[#0b0d10]/90 border border-rose-500/20 text-center">
            <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Sessions</span>
            <span className="text-lg font-mono font-bold text-rose-400">{metadata.totalSessions}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0b0d10]/90 border border-purple-500/20 text-center">
            <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Messages</span>
            <span className="text-lg font-mono font-bold text-purple-300">
              {metadata.totalMessages.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0b0d10]/90 border border-pink-500/20 text-center">
            <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Voice Notes</span>
            <span className="text-lg font-mono font-bold text-pink-300">{metadata.totalVoiceNotes}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0b0d10]/90 border border-red-500/20 text-center">
            <span className="text-[10px] font-mono text-[#8b949e] uppercase block">18+ Uncensored</span>
            <span className="text-lg font-mono font-bold text-red-400">{metadata.byCategory.explicit}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Chips */}
      <div className="space-y-3">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-rose-500 text-white font-semibold shadow-md'
                : 'bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-white border border-[#30363d]'
            }`}
          >
            All Sessions ({vaultData.sessions.length})
          </button>

          <button
            onClick={() => setSelectedCategory('explicit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 ${
              selectedCategory === 'explicit'
                ? 'bg-rose-600 text-white font-semibold shadow-md ring-1 ring-rose-400'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            🌶️ Uncensored (18+) ({metadata.byCategory.explicit})
          </button>

          <button
            onClick={() => setSelectedCategory('sensual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 ${
              selectedCategory === 'sensual'
                ? 'bg-pink-600 text-white font-semibold shadow-md ring-1 ring-pink-400'
                : 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30'
            }`}
          >
            💋 Kisses & Physical ({metadata.byCategory.sensual})
          </button>

          <button
            onClick={() => setSelectedCategory('bedroom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 ${
              selectedCategory === 'bedroom'
                ? 'bg-purple-600 text-white font-semibold shadow-md ring-1 ring-purple-400'
                : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}
          >
            🌙 Bedroom Talks ({metadata.byCategory.bedroom})
          </button>

          <button
            onClick={() => setSelectedCategory('teasing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 ${
              selectedCategory === 'teasing'
                ? 'bg-amber-600 text-white font-semibold shadow-md ring-1 ring-amber-400'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            🔥 Flirty Tension ({metadata.byCategory.teasing})
          </button>

          <button
            onClick={() => setSelectedCategory('audio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 ${
              selectedCategory === 'audio'
                ? 'bg-teal-600 text-white font-semibold shadow-md ring-1 ring-teal-400'
                : 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30'
            }`}
          >
            🎙️ Voice Notes ({metadata.totalVoiceNotes})
          </button>
        </div>

        {/* Search & Month Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search intimate words ('daddy', 'shirtless', 'french kiss', 'kamor', 'horny')..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#161b22] border border-[#30363d] focus:border-rose-500 focus:outline-none text-xs font-mono text-white placeholder-[#8b949e]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 shrink-0 bg-[#161b22] border border-[#30363d] rounded-xl p-1">
            <span className="text-[10px] font-mono text-[#8b949e] px-2 uppercase">Month:</span>
            {['all', '2026-07', '2026-08', '2026-09'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors ${
                  selectedMonth === m
                    ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                    : 'text-[#8b949e] hover:text-white'
                }`}
              >
                {m === 'all' ? 'All' : m.slice(5)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Master-Detail Vault Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sessions List (lg:col-span-5) */}
        <div
          className={`lg:col-span-5 space-y-3 ${
            isMobileViewingDetail ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono text-[#8b949e] px-1">
            <span>
              Showing {filteredSessions.length} of {vaultData.sessions.length} sessions
            </span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-rose-400 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredSessions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#12161c] border border-[#21262d] text-center space-y-2">
                <Flame className="w-8 h-8 text-[#8b949e] mx-auto opacity-50" />
                <p className="text-sm text-slate-300 font-medium">No intimate sessions matched your filters</p>
                <p className="text-xs text-[#8b949e]">Try clearing your search query or selecting "All Sessions".</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = activeSession?.id === session.id;
                const catInfo = categoryMeta[session.category] || categoryMeta.teasing;

                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setIsMobileViewingDetail(true);
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#1c1218] to-[#12161c] border-rose-500 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50'
                        : 'bg-[#12161c] hover:bg-[#161b22] border-[#21262d] hover:border-[#38414d]'
                    }`}
                  >
                    {/* Active accent strip */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                    )}

                    <div className="space-y-2 pl-1">
                      {/* Top Meta Line: Date, Time & Heat Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${catInfo.bg} ${catInfo.color} ${catInfo.border} font-semibold`}
                          >
                            {catInfo.badge}
                          </span>
                          <span className="text-[10px] font-mono text-[#8b949e]">
                            {'🔥'.repeat(session.heatLevel)}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-300 font-medium">
                          {session.date}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <h3 className="font-editorial text-base text-white font-bold group-hover:text-rose-200 transition-colors">
                          {session.title}
                        </h3>
                        <p className="text-[11px] text-[#8b949e] font-sans line-clamp-1">
                          {session.subtitle}
                        </p>
                      </div>

                      {/* Excerpt Quote */}
                      <div className="p-2.5 rounded-xl bg-[#0b0d10]/90 border border-[#21262d] text-xs font-mono text-slate-300 italic line-clamp-2">
                        <strong
                          className={
                            session.previewQuote.sender === 'NILU'
                              ? 'text-rose-400 not-italic mr-1'
                              : 'text-sky-400 not-italic mr-1'
                          }
                        >
                          {session.previewQuote.sender === 'NILU' ? 'Nila:' : 'Farhan:'}
                        </strong>
                        "{session.previewQuote.text}"
                      </div>

                      {/* Bottom Footer: Timing & Counters */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#8b949e] pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {session.startTime} – {session.endTime}
                          </span>
                        </span>

                        <div className="flex items-center gap-2">
                          {session.voiceNoteCount > 0 && (
                            <span className="flex items-center gap-1 text-teal-300">
                              <Mic className="w-3 h-3" />
                              <span>{session.voiceNoteCount}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-slate-400">
                            <MessageCircle className="w-3 h-3" />
                            <span>{session.messageCount} msgs</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Focused Thread Reader (lg:col-span-7) */}
        <div
          className={`lg:col-span-7 ${
            !isMobileViewingDetail ? 'hidden lg:block' : 'block'
          }`}
        >
          {activeSession ? (
            <div className="rounded-3xl bg-[#12161c] border border-[#21262d] shadow-2xl overflow-hidden flex flex-col">
              {/* Thread Header */}
              <div className="p-4 sm:p-5 border-b border-[#21262d] bg-[#0d1117] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-20">
                <div className="space-y-1">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setIsMobileViewingDetail(false)}
                    className="lg:hidden flex items-center gap-1 text-xs font-mono text-rose-400 mb-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to Sessions</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        categoryMeta[activeSession.category]?.bg || 'bg-rose-500/10'
                      } ${categoryMeta[activeSession.category]?.color || 'text-rose-300'} ${
                        categoryMeta[activeSession.category]?.border || 'border-rose-500/30'
                      } font-semibold`}
                    >
                      {categoryMeta[activeSession.category]?.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {'🔥'.repeat(activeSession.heatLevel)}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-editorial font-bold text-white">
                    {activeSession.title}
                  </h2>
                  <p className="text-xs font-mono text-[#8b949e] flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-rose-400" />
                    <span>{activeSession.date}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {activeSession.startTime} – {activeSession.endTime} ({activeSession.messageCount} messages)
                    </span>
                  </p>
                </div>

                {/* Actions: Jump to Full Context & Prev/Next */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 border border-[#30363d] rounded-xl p-1 bg-[#161b22]">
                    <button
                      onClick={handlePrevSession}
                      disabled={!hasPrev}
                      className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      title="Previous Intimate Session"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono text-[#8b949e] px-1">
                      {currentIndex + 1}/{filteredSessions.length}
                    </span>
                    <button
                      onClick={handleNextSession}
                      disabled={!hasNext}
                      className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      title="Next Intimate Session"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      onSelectContext(activeSession.date, activeSession.messages[0]?.id)
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 hover:from-rose-500/30 hover:to-pink-500/30 border border-rose-500/40 text-rose-200 text-xs font-mono font-semibold transition-all active:scale-95 shadow-sm"
                    title="Jump to this exact moment in the full daily conversation"
                  >
                    <span>Full Context</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Thread Message Stream */}
              <div className="p-4 sm:p-6 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto bg-[#0b0d10]/95">
                {activeSession.messages.map((msg) => {
                  const isNila = msg.sender === 'NILU';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isNila ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8b949e] mb-1 px-1">
                        <span
                          className={`font-semibold ${
                            isNila ? 'text-rose-400' : 'text-sky-400'
                          }`}
                        >
                          {isNila ? 'NILA' : 'FARHAN'}
                        </span>
                        <span>•</span>
                        <span>{msg.time}</span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed shadow-md border ${
                          isNila
                            ? 'bg-[#181318] text-rose-100 border-rose-500/30 rounded-tl-sm'
                            : 'bg-[#111923] text-sky-100 border-sky-500/30 rounded-tr-sm'
                        }`}
                      >
                        {/* Audio Voice Note Bubble */}
                        {(msg.type === 'audio' || msg.audioDuration || msg.mediaUrl?.includes('.ogg') || msg.mediaUrl?.includes('.mp4')) ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => togglePlayAudio(msg.id, msg.mediaUrl)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  playingAudioId === msg.id
                                    ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/40 animate-pulse'
                                    : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40'
                                }`}
                              >
                                {playingAudioId === msg.id ? (
                                  <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                )}
                              </button>
                              <div>
                                <div className="font-mono text-xs font-semibold text-teal-300">
                                  Voice Note
                                </div>
                                <div className="text-[10px] font-mono text-[#8b949e]">
                                  {msg.audioDuration ? `${msg.audioDuration}s` : 'Audio clip'}
                                </div>
                              </div>
                            </div>
                            {msg.content && (
                              <p className="text-xs text-slate-300 border-t border-white/5 pt-1.5 mt-1">
                                {msg.content}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap select-text">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Thread Footer Navigation Bar */}
              <div className="p-3 border-t border-[#21262d] bg-[#0d1117] flex items-center justify-between text-xs font-mono text-[#8b949e]">
                <span>
                  Session {currentIndex + 1} of {filteredSessions.length}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevSession}
                    disabled={!hasPrev}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] text-slate-300 disabled:opacity-30 disabled:hover:bg-[#161b22] transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <button
                    onClick={handleNextSession}
                    disabled={!hasNext}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] text-slate-300 disabled:opacity-30 disabled:hover:bg-[#161b22] transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#12161c] border border-[#21262d] p-12 text-center space-y-3">
              <Flame className="w-12 h-12 text-rose-500 mx-auto opacity-40" />
              <h3 className="font-editorial text-xl text-white">Select an Intimate Session</h3>
              <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
                Choose any session from the left to read its complete, uncensored dialogue stream.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
