import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  MessageCircle,
  Clock,
  Mic,
  Heart,
  Film,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArchiveMetadata } from '../../types/archive';

interface ArchiveWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ArchiveMetadata;
}

export const ArchiveWrappedModal: React.FC<ArchiveWrappedModalProps> = ({
  isOpen,
  onClose,
  metadata,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = 7;
  const slideDuration = 6500; // 6.5s per slide

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(slideDuration);

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight, Space
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
  }, [isOpen, currentSlide]);

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
  }, [isOpen, currentSlide, isPaused]);

  if (!isOpen) return null;

  const nilaCount = metadata.participants.NILU;
  const farhanCount = metadata.participants.farhannn;
  const nilaPct = Math.round((nilaCount / metadata.totalMessages) * 1000) / 10;
  const farhanPct = Math.round((farhanCount / metadata.totalMessages) * 1000) / 10;

  const slides = [
    // Slide 0: Intro & Grand Total
    {
      theme: 'from-purple-950 via-slate-950 to-[#0b0d10]',
      badge: 'CHAPTER 1 • THE ODYSSEY',
      badgeColor: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      title: 'Across 60 Unbroken Days',
      metric: metadata.totalMessages.toLocaleString(),
      unit: 'Messages Exchanged',
      subtitle: 'From July 6 to September 4, 2026',
      narrative:
        'You two never missed a single day. An unbroken 60-day rhythm that averaged over 880 thoughts, laughs, and moments shared every 24 hours.',
      icon: MessageCircle,
      accent: 'text-purple-400',
    },
    // Slide 1: Balance
    {
      theme: 'from-rose-950 via-slate-950 to-[#0b0d10]',
      badge: 'CHAPTER 2 • HARMONY',
      badgeColor: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
      title: 'A Perfectly Balanced Dialogue',
      metric: `${nilaPct}% • ${farhanPct}%`,
      unit: 'NILA vs FARHAN',
      subtitle: `${nilaCount.toLocaleString()} vs ${farhanCount.toLocaleString()} messages`,
      narrative:
        'Conversation was never one-sided. An extraordinarily equal connection where both of you poured in your thoughts with near 50/50 balance.',
      icon: Heart,
      accent: 'text-rose-400',
    },
    // Slide 2: Night Owls
    {
      theme: 'from-indigo-950 via-slate-950 to-[#0b0d10]',
      badge: 'CHAPTER 3 • THE MIDNIGHT CLUB',
      badgeColor: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
      title: 'When The World Slept',
      metric: '3:00 AM – 4:00 AM',
      unit: 'Late Night Talks',
      subtitle: 'Over 6,800 messages sent past midnight',
      narrative:
        'Some of the most intimate, vulnerable conversations happened in the quiet hours of 2 AM and 3 AM, keeping each other company until morning.',
      icon: Clock,
      accent: 'text-indigo-400',
    },
    // Slide 3: Voice Notes
    {
      theme: 'from-emerald-950 via-slate-950 to-[#0b0d10]',
      badge: 'CHAPTER 4 • AUDIO DIARY',
      badgeColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      title: 'The Sound of Your Voices',
      metric: (metadata.media?.audio || 1385).toLocaleString(),
      unit: 'Voice Notes Recorded',
      subtitle: 'Hours of laughter, voice notes & calls',
      narrative:
        'Words were not just typed; they were spoken. 1,385 voice notes captured in real time, full of laughter, sleepy murmurs, and inside stories.',
      icon: Mic,
      accent: 'text-emerald-400',
    },
    // Slide 4: Peak Day
    {
      theme: 'from-amber-950 via-slate-950 to-[#0b0d10]',
      badge: 'CHAPTER 5 • THE CLIMAX',
      badgeColor: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
      title: 'The Record Peak Day',
      metric: '1,885 msgs',
      unit: 'Friday, August 14, 2026',
      subtitle: '17.5 hours of continuous chat',
      narrative:
        'August 14th was your most talkative day ever recorded. An intense, joyful marathon that didn’t stop from sunrise to the late night hours.',
      icon: Flame,
      accent: 'text-amber-400',
    },
    // Slide 5: Shared World
    {
      theme: 'from-pink-950 via-slate-950 to-[#0b0d10]',
      badge: 'CHAPTER 6 • SHARED CULTURE',
      badgeColor: 'text-pink-400 bg-pink-500/20 border-pink-500/30',
      title: 'Reels, Posts & Inside Jokes',
      metric: `${metadata.shares.total.toLocaleString()} Shares`,
      unit: `${metadata.shares.reels} Reels • ${metadata.reactions.total} Reactions`,
      subtitle: '190 shared photos & memories',
      narrative:
        'You traded 1,014 Instagram reels, reacting over 1,400 times with hearts and laughter. A private universe filled with shared humor.',
      icon: Film,
      accent: 'text-pink-400',
    },
    // Slide 6: Outro
    {
      theme: 'from-rose-950 via-purple-950 to-[#0b0d10]',
      badge: 'EPILOGUE • THE ARCHIVE',
      badgeColor: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
      title: 'Our Story in Numbers',
      metric: '52,784 Memories',
      unit: 'And Still Counting',
      subtitle: 'Preserved with 100% precision',
      narrative:
        'Every single day, every voice note, every photo, and every late night conversation is preserved forever here in your private archive.',
      icon: Sparkles,
      accent: 'text-rose-400',
    },
  ];

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-0 sm:p-4">
      {/* Mobile-sized vertical story card */}
      <div
        className={`relative w-full h-full sm:h-[680px] sm:max-w-md sm:rounded-3xl bg-gradient-to-b ${slide.theme} border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden select-none transition-colors duration-700`}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />

        {/* Top Story Header: Segmented Progress Bars & Close Button */}
        <div className="relative z-30 pt-safe p-4 sm:p-5 space-y-3">
          {/* Segmented Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {slides.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden"
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
              </div>
            ))}
          </div>

          {/* Top Bar: Title and Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-white/90">
                OUR ARCHIVE WRAPPED
              </span>
              <span className="text-[10px] font-mono text-white/50">
                ({currentSlide + 1}/{totalSlides})
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area with Animated Slide Transitions */}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-6 sm:px-8 text-center space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* Chapter Badge */}
              <div className="flex justify-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wide border ${slide.badgeColor}`}
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

              {/* Subtitle / Stat Pill */}
              <div className="inline-block px-3 py-1 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-300">
                {slide.subtitle}
              </div>

              {/* Narrative Text */}
              <p className="text-sm text-slate-300/90 leading-relaxed max-w-sm mx-auto font-sans">
                {slide.narrative}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Interactive Touch Zones (Tap Left for Prev, Tap Right for Next) */}
        <div className="relative z-30 pb-safe p-4 sm:p-5 flex items-center justify-between text-xs text-white/50 font-mono border-t border-white/10 bg-black/30">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {currentSlide === totalSlides - 1 ? (
            <button
              onClick={() => {
                setCurrentSlide(0);
                setIsPaused(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Watch Again</span>
            </button>
          ) : (
            <span className="text-[11px] text-white/40">
              Tap screen to advance • Hold to pause
            </span>
          )}

          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 text-white transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Invisible Left and Right Touch Navigation overlay */}
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
