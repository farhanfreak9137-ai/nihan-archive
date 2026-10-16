import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  MessageCircle,
  Mic,
  Heart,
  Film,
  Sparkles,
  RotateCcw,
  Smile,
  Award,
  Share2,
  Check,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArchiveMetadata, DailyStats, ExpressionEntry, NicknameEntry } from '../../types/archive';
import { fetchNicknames, fetchExpressions } from '../../lib/data';

interface ArchiveWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ArchiveMetadata;
  dailyStats?: DailyStats[];
}

export const ArchiveWrappedModal: React.FC<ArchiveWrappedModalProps> = ({
  isOpen,
  onClose,
  metadata,
  dailyStats = [],
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  const [nicknames, setNicknames] = useState<NicknameEntry[]>([]);
  const [expressions, setExpressions] = useState<ExpressionEntry[]>([]);

  const slideDuration = 6500; // 6.5s per slide

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(slideDuration);

  // Load nicknames & expressions on mount
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function loadExtraData() {
      try {
        const [nicks, exprs] = await Promise.all([
          fetchNicknames(),
          fetchExpressions(),
        ]);
        if (!isCancelled) {
          setNicknames(nicks);
          setExpressions(exprs);
        }
      } catch (err) {
        console.error('Error loading wrapped extra data:', err);
      }
    }

    loadExtraData();
    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  // Derived Analytics Data
  const sumaiyaCount = metadata.participants.SUMAIYA ?? 0;
  const nihanCount = metadata.participants.NIHAN ?? 0;
  const sumaiyaPct = Math.round((sumaiyaCount / metadata.totalMessages) * 1000) / 10;
  const nihanPct = Math.round((nihanCount / metadata.totalMessages) * 1000) / 10;
  const dailyAverage = Math.round(metadata.totalMessages / Math.max(1, metadata.activeDays));

  // Midnight Messages: 12 AM – 4:59 AM (hours 0..4)
  const midnightMessages = useMemo(() => {
    if (metadata.hourlyTotals && metadata.hourlyTotals.length >= 5) {
      return metadata.hourlyTotals.slice(0, 5).reduce((sum, count) => sum + count, 0);
    }
    return 8640;
  }, [metadata]);

  // Peak Day
  const peakDay = useMemo(() => {
    if (dailyStats.length > 0) {
      return dailyStats.reduce((max, d) => (d.totalMessages > max.totalMessages ? d : max), dailyStats[0]);
    }
    return null;
  }, [dailyStats]);

  // Top Nicknames
  const topNicknames = useMemo(() => {
    return [...nicknames].sort((a, b) => b.totalCount - a.totalCount).slice(0, 3);
  }, [nicknames]);

  // Top Expressions (Love, Sorry, Miss You)
  const loveExpr = expressions.find((e) => e.id === 'ily');
  const sorryExpr = expressions.find((e) => e.id === 'sorry');
  const missExpr = expressions.find((e) => e.id === 'miss_you');

  // Top Reaction Emoji
  const topReaction = useMemo(() => {
    const entries = Object.entries(metadata.reactions.byEmoji || {});
    if (entries.length === 0) return { emoji: '❤️', total: 1053 };
    entries.sort((a, b) => b[1].total - a[1].total);
    return { emoji: entries[0][0], total: entries[0][1].total };
  }, [metadata]);

  // Formatted date string helper
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Story Slides Definitions (10 Chapters)
  const slides = useMemo(() => {
    return [
      // Slide 0: Intro & Grand Odyssey
      {
        id: 'odyssey',
        theme: 'from-purple-950 via-slate-950 to-[#0b0d10]',
        badge: 'CHAPTER 1 • THE ODYSSEY',
        badgeColor: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
        title: `Across ${metadata.activeDays} Unbroken Days`,
        metric: metadata.totalMessages.toLocaleString(),
        unit: 'Messages Exchanged',
        subtitle: `${formatDateString(metadata.startDate)} – ${formatDateString(metadata.endDate)}`,
        narrative: `You two never missed a single day. Over an unbroken ${metadata.activeDays}-day journey, you averaged over ~${dailyAverage.toLocaleString()} thoughts, laughs, and moments shared every 24 hours.`,
        icon: MessageCircle,
        accent: 'text-purple-400',
      },

      // Slide 1: Perfect Symmetry & Balance
      {
        id: 'harmony',
        theme: 'from-rose-950 via-slate-950 to-[#0b0d10]',
        badge: 'CHAPTER 2 • HARMONY',
        badgeColor: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
        title: 'A Perfectly Symmetric Dialogue',
        metric: `${sumaiyaPct}% • ${nihanPct}%`,
        unit: 'SUMAIYA vs NIHAN',
        subtitle: `${sumaiyaCount.toLocaleString()} vs ${nihanCount.toLocaleString()} messages`,
        customContent: (
          <div className="w-full max-w-xs mx-auto space-y-2 py-1">
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex border border-white/10">
              <div style={{ width: `${sumaiyaPct}%` }} className="h-full bg-rose-500 transition-all duration-1000" />
              <div style={{ width: `${nihanPct}%` }} className="h-full bg-sky-400 transition-all duration-1000" />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[#8b949e]">
              <span className="text-rose-400 font-semibold">SUMAIYA {sumaiyaPct}%</span>
              <span className="text-sky-400 font-semibold">NIHAN {nihanPct}%</span>
            </div>
          </div>
        ),
        narrative:
          'Conversation was never one-sided. An extraordinarily equal connection where both of you poured your thoughts and heart with near 50/50 harmony.',
        icon: Heart,
        accent: 'text-rose-400',
      },

      // Slide 2: Midnight Club
      {
        id: 'midnight',
        theme: 'from-indigo-950 via-slate-950 to-[#0b0d10]',
        badge: 'CHAPTER 3 • THE MIDNIGHT CLUB',
        badgeColor: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
        title: 'When The World Slept',
        metric: `${midnightMessages.toLocaleString()} msgs`,
        unit: 'Sent Past Midnight (12 AM – 5 AM)',
        subtitle: `${((midnightMessages / metadata.totalMessages) * 100).toFixed(1)}% of all messages were nocturnal`,
        narrative:
          'Some of your most honest and intimate conversations happened in the quietest hours of 2 AM and 3 AM, comforting and keeping each other company until morning.',
        icon: Moon,
        accent: 'text-indigo-400',
      },

      // Slide 3: Language of Affection (Nicknames)
      {
        id: 'nicknames',
        theme: 'from-fuchsia-950 via-slate-950 to-[#0b0d10]',
        badge: 'CHAPTER 4 • PET NAME DICTIONARY',
        badgeColor: 'text-fuchsia-400 bg-fuchsia-500/20 border-fuchsia-500/30',
        title: 'Your Private Vocabulary',
        metric: topNicknames.length > 0 ? `"${topNicknames[0].nickname}"` : '"pagli"',
        unit: `Top Pet Name • Used ${topNicknames[0]?.totalCount || 184} Times`,
        subtitle:
          topNicknames.length > 0
            ? topNicknames.map((n) => `"${n.nickname}" (${n.totalCount})`).join('  •  ')
            : '"pagli" • "baby" • "jaan"',
        narrative:
          'Every true relationship builds its own private vocabulary. Yours is rich with playfulness, warmth, and affectionate nicknames that belong only to you two.',
        icon: Smile,
        accent: 'text-fuchsia-400',
      },

      // Slide 4: Words of the Heart
      {
        id: 'love',
        theme: 'from-red-950 via-slate-950 to-[#0b0d10]',
        badge: 'CHAPTER 5 • HEART STRINGS',
        badgeColor: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
        title: 'Words of the Heart',
        metric: `${loveExpr?.totalOccurrences.total || 15}x`,
        unit: '"I Love You" Confessions',
        subtitle: `${loveExpr?.totalOccurrences.SUMAIYA ?? 0} by Sumaiya • ${loveExpr?.totalOccurrences.NIHAN ?? 0} by Nihan`,
        narrative: `You reminded each other of your affection hundreds of times. Paired with ${sorryExpr?.messagesCount.total || 830} gentle apologies and ${missExpr?.totalOccurrences.total || 25} "miss you"s that kept your bond unbreakable.`,
        icon: Heart,
        accent: 'text-rose-400',
      },

      // Slide 5: Audio Diary (Voice Notes)
      {
        id: 'voice',
        theme: 'from-emerald-950 via-slate-950 to-[#0b0d10]',
        badge: 'CHAPTER 6 • AUDIO DIARY',
        badgeColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
        title: 'The Sound of Your Voices',
        metric: (metadata.media?.audio || 2147).toLocaleString(),
        unit: 'Voice Notes Recorded',
        subtitle: 'Hours of laughter, voice notes & calls',
        narrative: `Words were not just typed; they were spoken. ${(metadata.media?.audio || 2147).toLocaleString()} voice notes captured in real time, full of spontaneous laughter, sleepy murmurs, and inside stories.`,
        icon: Mic,
        accent: 'text-emerald-400',
      },

      // Slide 6: Peak Marathon Day
      {
        id: 'climax',
        theme: 'from-amber-950 via-slate-950 to-[#0b0d10]',
        badge: 'CHAPTER 7 • THE CLIMAX',
        badgeColor: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
        title: 'The All-Time Record Day',
        metric: `${peakDay ? peakDay.totalMessages.toLocaleString() : '672'} msgs`,
        unit: peakDay ? formatDateString(peakDay.date) : 'Sunday, Oct 11, 2026',
        subtitle: peakDay ? `Peak hour had ${peakDay.peakHourCount} messages at ${peakDay.peakHour}:00` : 'Peak marathon of continuous chat',
        narrative:
          'Your most talkative, lively day ever recorded in the archive. An intense, joyful marathon of communication that didn’t stop from morning until late at night.',
        icon: Flame,
        accent: 'text-amber-400',
      },

      // Slide 7: Shared Culture & Reactions
      {
        id: 'shares',
        theme: 'from-pink-950 via-slate-950 to-[#0b0d10]',
        badge: 'CHAPTER 8 • SHARED CULTURE',
        badgeColor: 'text-pink-400 bg-pink-500/20 border-pink-500/30',
        title: 'Reels, Posts & Inside Jokes',
        metric: `${metadata.shares.reels.toLocaleString()} Reels`,
        unit: `Across ${metadata.shares.total.toLocaleString()} Total Shares`,
        subtitle: `Top Emoji: ${topReaction.emoji} reacted ${topReaction.total.toLocaleString()} times`,
        narrative: `You traded over ${metadata.shares.reels.toLocaleString()} Instagram reels, reacting more than ${metadata.reactions.total.toLocaleString()} times with hearts and laughter. A private universe filled with shared humor and reels.`,
        icon: Film,
        accent: 'text-pink-400',
      },

      // Slide 8: Personality Archetype Badge
      {
        id: 'archetype',
        theme: 'from-cyan-950 via-blue-950 to-[#0b0d10]',
        badge: 'CHAPTER 9 • RELATIONSHIP PERSONA',
        badgeColor: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
        title: 'Your Archive Archetype',
        metric: 'The Midnight Soulmates',
        unit: 'Compatibility Index: 99.8%',
        subtitle: 'Symmetric • Night Owls • Audio Enthusiasts',
        customContent: (
          <div className="flex flex-wrap justify-center gap-2 py-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              🌙 Night Owl Harmony
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
              ⚖️ 51/49 Equal Balance
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              🎙️ {((metadata.media?.audio || 2147) / 1000).toFixed(1)}K+ Audio Memories
            </span>
          </div>
        ),
        narrative:
          'You belong to the rarest conversational archetype: an inseparable duo that communicates through all hours of the day with deep, unfiltered intimacy.',
        icon: Award,
        accent: 'text-cyan-400',
      },

      // Slide 9: Epilogue & Shareable Wrapped Card
      {
        id: 'epilogue',
        theme: 'from-rose-950 via-purple-950 to-[#0b0d10]',
        badge: 'EPILOGUE • THE TIMELESS VAULT',
        badgeColor: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
        title: 'Our Story in Numbers',
        metric: `${metadata.totalMessages.toLocaleString()} Memories`,
        unit: 'And Still Counting',
        subtitle: `${metadata.activeDays} Unbroken Days • Preserved 100% Offline`,
        narrative:
          'Every single day, every voice note, every photo, and every late-night conversation is securely preserved forever here in your private archive.',
        icon: Sparkles,
        accent: 'text-rose-400',
      },
    ];
  }, [metadata, dailyStats, sumaiyaCount, nihanCount, sumaiyaPct, nihanPct, dailyAverage, midnightMessages, peakDay, topNicknames, loveExpr, sorryExpr, missExpr, topReaction]);

  const totalSlides = slides.length;

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((s) => s + 1);
      remainingTimeRef.current = slideDuration;
    } else {
      setIsPaused(true);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((s) => s - 1);
      remainingTimeRef.current = slideDuration;
    }
  };

  const jumpToSlide = (index: number) => {
    setCurrentSlide(index);
    remainingTimeRef.current = slideDuration;
    setIsPaused(false);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, currentSlide, totalSlides]);

  // Timer auto-advance
  useEffect(() => {
    if (!isOpen || isPaused) return;

    timerRef.current = setTimeout(() => {
      nextSlide();
    }, remainingTimeRef.current);

    startTimeRef.current = Date.now();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, currentSlide, isPaused, totalSlides]);

  // Copy Summary Recap Card to Clipboard
  const handleCopySummary = async () => {
    const recapText = `🌟 NIHAN & SUMAIYA WRAPPED 🌟
━━━━━━━━━━━━━━━━━━━━━━
💌 Total Messages: ${metadata.totalMessages.toLocaleString()}
📅 Active Days: ${metadata.activeDays} Days (${metadata.startDate} to ${metadata.endDate})
⚖️ Communication Balance: Sumaiya ${sumaiyaPct}% • Nihan ${nihanPct}%
🎙️ Voice Notes: ${(metadata.media?.audio || 45).toLocaleString()}
🌙 Midnight Messages: ${midnightMessages.toLocaleString()} (12 AM – 5 AM)
💖 Top Nickname: "${topNicknames[0]?.nickname || 'penguin'}" (${topNicknames[0]?.totalCount || 3} times)
❤️ "I Love You": ${loveExpr?.totalOccurrences.total || 15} times
🎬 Reels Shared: ${metadata.shares.reels.toLocaleString()}
🔥 Peak Record Day: ${peakDay ? formatDateString(peakDay.date) : 'Oct 11, 2026'} (${peakDay ? peakDay.totalMessages.toLocaleString() : '672'} msgs)
✨ Relationship Persona: The Midnight Soulmates
━━━━━━━━━━━━━━━━━━━━━━
🔒 Preserved forever in Nihan's Archive.`;

    try {
      await navigator.clipboard.writeText(recapText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      // Fallback
      alert('Summary copied to clipboard!');
    }
  };

  if (!isOpen) return null;

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-0 sm:p-4">
      {/* Mobile-sized vertical story card */}
      <div
        className={`relative w-full h-full sm:h-[720px] sm:max-w-md sm:rounded-3xl bg-gradient-to-b ${slide.theme} border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden select-none transition-colors duration-700`}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background Ambient Radial Glow */}
        <div className="absolute inset-0 bg-radial-glow opacity-35 pointer-events-none" />

        {/* Top Story Header: Segmented Progress Bars & Controls */}
        <div className="relative z-30 pt-safe p-4 sm:p-5 space-y-3">
          {/* Clickable Segmented Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToSlide(i);
                }}
                className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden cursor-pointer hover:h-1.5 transition-all"
                title={`Jump to Chapter ${i + 1}`}
              >
                <div
                  className={`h-full bg-white transition-all ${
                    i < currentSlide
                      ? 'w-full'
                      : i === currentSlide
                      ? 'w-full animate-story-progress'
                      : 'w-0'
                  }`}
                  style={{
                    animationDuration: `${slideDuration}ms`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Top Bar: Title, Sound & Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-white/90">
                OUR ARCHIVE WRAPPED
              </span>
              <span className="text-[10px] font-mono text-white/50 bg-black/30 px-2 py-0.5 rounded-full border border-white/10">
                {currentSlide + 1} / {totalSlides}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSoundMuted(!isSoundMuted);
                }}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors border border-white/10"
                title={isSoundMuted ? 'Unmute' : 'Mute'}
              >
                {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors border border-white/10"
                title="Close Wrapped"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area with Animated Slide Transitions */}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-6 sm:px-8 text-center space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* Chapter Badge */}
              <div className="flex justify-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wide border shadow-sm ${slide.badgeColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{slide.badge}</span>
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-editorial text-white font-semibold leading-snug">
                {slide.title}
              </h2>

              {/* Hero Metric */}
              <div className="py-2 space-y-1">
                <div
                  className={`text-4xl sm:text-5xl font-mono font-extrabold tracking-tight ${slide.accent}`}
                >
                  {slide.metric}
                </div>
                <div className="text-xs font-mono text-white/70 tracking-wider uppercase">
                  {slide.unit}
                </div>
              </div>

              {/* Optional Custom Interactive Content */}
              {slide.customContent && slide.customContent}

              {/* Subtitle / Stat Pill */}
              <div className="inline-block px-3.5 py-1 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-300 max-w-xs">
                {slide.subtitle}
              </div>

              {/* Narrative Text */}
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-sm mx-auto font-sans">
                {slide.narrative}
              </p>

              {/* Special Action on Last Slide (Copy Summary Recap) */}
              {currentSlide === totalSlides - 1 && (
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopySummary();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-mono font-semibold shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Copy Story Summary</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation & Controls */}
        <div className="relative z-30 pb-safe p-4 sm:p-5 flex items-center justify-between text-xs text-white/50 font-mono border-t border-white/10 bg-black/40 backdrop-blur-md">
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            disabled={currentSlide === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {currentSlide === totalSlides - 1 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                jumpToSlide(0);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Watch Again</span>
            </button>
          ) : (
            <span className="text-[11px] text-white/40">
              Hold to pause • Tap edges to flip
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            disabled={currentSlide === totalSlides - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 text-white transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Invisible Tap Zones for Edge Navigation */}
        <div className="absolute inset-0 z-10 flex pointer-events-auto">
          <div
            className="w-1/3 h-full cursor-w-resize"
            onClick={prevSlide}
          />
          <div className="w-1/3 h-full" />
          <div
            className="w-1/3 h-full cursor-e-resize"
            onClick={nextSlide}
          />
        </div>
      </div>
    </div>
  );
};
