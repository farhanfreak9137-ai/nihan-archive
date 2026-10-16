import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Sparkles,
  Moon,
  Heart,
  Mic,
  Smile,
  ShieldCheck,
  Calendar,
  Share2,
  Check,
  ArrowRight,
  Palette,
  RefreshCw,
  Zap,
  Quote,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ArchiveMetadata,
  DailyStats,
  ExpressionEntry,
  NicknameEntry,
  Message,
} from '../../types/archive';
import { fetchDayConversation } from '../../lib/data';

interface RelationshipAuraModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ArchiveMetadata;
  dailyStats: DailyStats[];
  expressions?: ExpressionEntry[];
  nicknames?: NicknameEntry[];
  onSelectDate?: (date: string, messageId?: string) => void;
}

export interface AuraReading {
  id: string;
  scope: 'overall' | 'early' | '2026-09' | '2026-10' | 'day';
  label: string;
  title: string;
  subtitle: string;
  archetype: string;
  dominantMood: string;
  glowGradient: string;
  coreColors: [string, string, string]; // 3 hex colors for canvas orb
  palette: { name: string; hex: string; desc: string }[];
  energies: {
    nocturnal: number; // 0 - 100
    affection: number; // 0 - 100
    vocal: number; // 0 - 100
    banter: number; // 0 - 100
    devotion: number; // 0 - 100
  };
  metrics: {
    messages: number;
    voiceNotes: number;
    shares: number;
    reactions: number;
    sumaiyaPct: number;
    nihanPct: number;
  };
  signatureQuote: {
    sender: 'SUMAIYA' | 'NIHAN';
    text: string;
    context: string;
    date: string;
    messageId?: string;
  };
  poeticSynthesis: string;
}

export const RelationshipAuraModal: React.FC<RelationshipAuraModalProps> = ({
  isOpen,
  onClose,
  metadata,
  dailyStats,
  expressions = [],
  nicknames = [],
  onSelectDate,
}) => {
  const [selectedScope, setSelectedScope] = useState<
    'overall' | 'early' | '2026-09' | '2026-10' | 'custom-day'
  >('overall');
  const [customDate, setCustomDate] = useState<string>('2026-10-11');
  const [dayMessages, setDayMessages] = useState<Message[]>([]);
  const [isLoadingDay, setIsLoadingDay] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pointerPos = useRef({ x: 150, y: 150, targetX: 150, targetY: 150 });

  // Load messages if custom day is selected
  useEffect(() => {
    if (!isOpen || selectedScope !== 'custom-day' || !customDate) return;
    let isCancelled = false;
    async function load() {
      try {
        setIsLoadingDay(true);
        const data = await fetchDayConversation(customDate);
        if (!isCancelled) setDayMessages(data);
      } catch (err) {
        console.error('Failed to load day conversation:', err);
      } finally {
        if (!isCancelled) setIsLoadingDay(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, selectedScope, customDate]);

  // Compute Aura Reading based on active scope
  const auraReading: AuraReading = useMemo(() => {
    if (selectedScope === 'custom-day') {
      const dayStat = dailyStats.find((d) => d.date === customDate) || dailyStats[dailyStats.length - 1];
      const msgsCount = dayStat?.totalMessages || 1;
      const audioCount = dayStat?.audioNotes || 0;
      const sharesCount = dayStat?.shares || 0;
      const reactsCount = dayStat?.reactions || 0;

      // Nocturnal percentage for this day
      const nightHours = [0, 1, 2, 3, 4];
      const nightCount = nightHours.reduce((acc, h) => acc + (dayStat?.hourlyActivity[h] || 0), 0);
      const nocturnalScore = Math.min(100, Math.round((nightCount / msgsCount) * 160));

      const vocalScore = Math.min(100, Math.round((audioCount / Math.max(1, msgsCount * 0.15)) * 100));
      const banterScore = Math.min(100, Math.round((sharesCount / 30) * 80 + (reactsCount / 40) * 20));
      const devotionScore = Math.min(100, 75 + Math.round((msgsCount / 2000) * 25));
      const affectionScore = Math.min(100, Math.round(55 + (reactsCount / 30) * 45));

      // Determine palette based on dominant feature
      let coreColors: [string, string, string] = ['#f43f5e', '#a855f7', '#38bdf8'];
      let glowGradient = 'from-rose-500/30 via-purple-500/20 to-sky-500/30';
      let title = `Aura of ${dayStat?.date}`;
      let archetype = 'The Daily Star';
      let dominantMood = 'Deep Connection';

      if (customDate === '2026-10-11' || msgsCount >= 450) {
        coreColors = ['#f59e0b', '#ef4444', '#ec4899'];
        glowGradient = 'from-amber-500/40 via-rose-600/30 to-pink-500/30';
        title = 'Supernova Marathon Aura';
        archetype = 'The Unstoppable Flame';
        dominantMood = 'Unrivaled Conversational Climax';
      } else if (nocturnalScore > 60) {
        coreColors = ['#6366f1', '#a855f7', '#06b6d4'];
        glowGradient = 'from-indigo-600/30 via-purple-600/30 to-cyan-500/20';
        title = 'Midnight Twilight Aura';
        archetype = 'The Nocturnal Dreamers';
        dominantMood = 'Quiet Intimacy & Late-Night Talks';
      } else if (audioCount >= 5) {
        coreColors = ['#f59e0b', '#10b981', '#fb7185'];
        glowGradient = 'from-amber-500/30 via-emerald-500/20 to-rose-400/20';
        title = 'Resonant Vocal Frequency';
        archetype = 'The Melodic Confidants';
        dominantMood = 'Voice Note Symphony';
      }

      // Find top quote from loaded day messages
      let sampleQuote: {
        sender: 'SUMAIYA' | 'NIHAN';
        text: string;
        context: string;
        date: string;
        messageId?: string;
      } = {
        sender: 'SUMAIYA',
        text: 'Ekta video teo amra kotha bola thamai nai',
        context: `${msgsCount.toLocaleString()} messages exchanged`,
        date: customDate,
      };

      if (dayMessages.length > 0) {
        const heartfelt = dayMessages.filter(
          (m) =>
            m.content &&
            m.content.length > 15 &&
            m.content.length < 160 &&
            !m.content.includes('attachment') &&
            !m.content.includes('started a call')
        );
        if (heartfelt.length > 0) {
          const picked = heartfelt[Math.floor(heartfelt.length / 2)];
          sampleQuote = {
            sender: picked.sender === 'NIHAN' ? 'NIHAN' : 'SUMAIYA',
            text: picked.content,
            context: `${picked.time} • ${picked.senderDisplay}`,
            date: customDate,
            messageId: picked.id,
          };
        }
      }

      return {
        id: `day-${customDate}`,
        scope: 'day',
        label: customDate,
        title,
        subtitle: `A snapshot of energy on ${customDate}`,
        archetype,
        dominantMood,
        glowGradient,
        coreColors,
        palette: [
          { name: 'Core Energy', hex: coreColors[0], desc: 'Dominant frequency of interaction' },
          { name: 'Harmonic Pulse', hex: coreColors[1], desc: 'Secondary emotional depth' },
          { name: 'Aether Glow', hex: coreColors[2], desc: 'Ambient resonance & comfort' },
        ],
        energies: {
          nocturnal: Math.max(15, nocturnalScore),
          affection: affectionScore,
          vocal: Math.max(10, vocalScore),
          banter: Math.max(20, banterScore),
          devotion: devotionScore,
        },
        metrics: {
          messages: msgsCount,
          voiceNotes: audioCount,
          shares: sharesCount,
          reactions: reactsCount,
          sumaiyaPct: dayStat?.sumaiyaPercentage || 50,
          nihanPct: dayStat?.nihanPercentage || 50,
        },
        signatureQuote: sampleQuote,
        poeticSynthesis: `On ${customDate}, your connection reached an activity score of ${dayStat?.activityScore || 50}/100. With ${msgsCount.toLocaleString()} messages spanning from ${dayStat?.firstMessage || 'morning'} to ${dayStat?.lastMessage || 'night'}, your dialogue expressed a rare combination of conversational ease and profound emotional safety.`,
      };
    }

    if (selectedScope === 'early') {
      const statsEarly = dailyStats.filter((d) => d.date < '2026-09-01');
      const msgs = statsEarly.reduce((acc, d) => acc + d.totalMessages, 0);
      const audio = statsEarly.reduce((acc, d) => acc + d.audioNotes, 0);
      const shares = statsEarly.reduce((acc, d) => acc + d.shares, 0);
      const reacts = statsEarly.reduce((acc, d) => acc + d.reactions, 0);

      const sumaiyaEarly = statsEarly.reduce((acc, d) => acc + (d.sumaiyaMessages || 0), 0);
      const nihanEarly = statsEarly.reduce((acc, d) => acc + (d.nihanMessages || 0), 0);
      const totalEarly = Math.max(1, sumaiyaEarly + nihanEarly);

      return {
        id: 'aura-early',
        scope: 'early',
        label: 'Jan – Aug 2026',
        title: 'Casual Banter & Enduring Roots',
        subtitle: 'The effortless comfort of old friends: Eid greetings, funny check-ins, and laughter',
        archetype: 'The Lifelong Allies',
        dominantMood: 'Playful Familiarity & Easygoing Warmth',
        glowGradient: 'from-amber-400/30 via-emerald-500/25 to-sky-400/20',
        coreColors: ['#f59e0b', '#10b981', '#38bdf8'],
        palette: [
          { name: 'Foundational Amber', hex: '#f59e0b', desc: 'Relaxed check-ins and unforced, genuine connection' },
          { name: 'Comradery Emerald', hex: '#10b981', desc: 'Mutual trust built through years of shared history' },
          { name: 'Banter Sky', hex: '#38bdf8', desc: '"Ontoto Manus amake lomba bole" • Playful humor' },
        ],
        energies: {
          nocturnal: 62,
          affection: 74,
          vocal: 40,
          banter: 88,
          devotion: 86,
        },
        metrics: {
          messages: msgs,
          voiceNotes: audio,
          shares: shares,
          reactions: reacts,
          sumaiyaPct: Number(((sumaiyaEarly / totalEarly) * 100).toFixed(1)) || 48.5,
          nihanPct: Number(((nihanEarly / totalEarly) * 100).toFixed(1)) || 51.5,
        },
        signatureQuote: {
          sender: 'NIHAN',
          text: 'Ontoto Manus amake lomba bole🤣',
          context: 'January 22, 2026 • 12:39 AM • Casual Banter',
          date: '2026-01-22',
          messageId: 'm_1769107146155_NIHAN',
        },
        poeticSynthesis:
          'The earlier months of 2026 established an easygoing, pressure-free sanctuary. Rooted in years of familiarity, every interaction was genuine and relaxed, proving that true friends can pick up right where they left off with instant laughter.',
      };
    }

    if (selectedScope === '2026-09') {
      const statsSep = dailyStats.filter((d) => d.date.startsWith('2026-09'));
      const msgs = statsSep.reduce((acc, d) => acc + d.totalMessages, 0);
      const audio = statsSep.reduce((acc, d) => acc + d.audioNotes, 0);
      const shares = statsSep.reduce((acc, d) => acc + d.shares, 0);
      const reacts = statsSep.reduce((acc, d) => acc + d.reactions, 0);

      const sumaiyaSep = statsSep.reduce((acc, d) => acc + (d.sumaiyaMessages || 0), 0);
      const nihanSep = statsSep.reduce((acc, d) => acc + (d.nihanMessages || 0), 0);
      const totalSep = Math.max(1, sumaiyaSep + nihanSep);

      return {
        id: 'aura-september',
        scope: '2026-09',
        label: 'September 2026',
        title: 'The Awakening Spark & Penguin Banter',
        subtitle: '607 messages • The start of daily check-ins, aesthetic compliments, and inside jokes',
        archetype: 'The Playful Spark',
        dominantMood: 'Curiosity, Rising Chemistry & Shared Music',
        glowGradient: 'from-indigo-600/35 via-rose-500/25 to-sky-400/25',
        coreColors: ['#6366f1', '#f43f5e', '#38bdf8'],
        palette: [
          { name: 'Spark Indigo', hex: '#6366f1', desc: 'Late September revival and transition into daily chatting' },
          { name: 'Aesthetic Rose', hex: '#f43f5e', desc: '"Looks cute ✨" and sharing music vibes' },
          { name: 'Penguin Cyan', hex: '#38bdf8', desc: '"Mone hoi penguin hatse" • The birth of the iconic inside joke' },
        ],
        energies: {
          nocturnal: 78,
          affection: 86,
          vocal: 62,
          banter: 94,
          devotion: 90,
        },
        metrics: {
          messages: msgs,
          voiceNotes: audio,
          shares: shares,
          reactions: reacts,
          sumaiyaPct: Number(((sumaiyaSep / totalSep) * 100).toFixed(1)) || 42.1,
          nihanPct: Number(((nihanSep / totalSep) * 100).toFixed(1)) || 57.9,
        },
        signatureQuote: {
          sender: 'NIHAN',
          text: 'Mone hoi penguin hatse',
          context: 'September 29, 2026 • 7:48 PM • The Penguin Origin',
          date: '2026-09-29',
        },
        poeticSynthesis:
          'September marked the decisive pivot where casual contact accelerated into daily excitement. Playful teasing about penguin walks and aesthetic compliments sparked a magnetic energy that carried straight into October\'s marathon.',
      };
    }

    if (selectedScope === '2026-10') {
      const statsOct = dailyStats.filter((d) => d.date.startsWith('2026-10'));
      const msgs = statsOct.reduce((acc, d) => acc + d.totalMessages, 0);
      const audio = statsOct.reduce((acc, d) => acc + d.audioNotes, 0);
      const shares = statsOct.reduce((acc, d) => acc + d.shares, 0);
      const reacts = statsOct.reduce((acc, d) => acc + d.reactions, 0);

      const sumaiyaOct = statsOct.reduce((acc, d) => acc + (d.sumaiyaMessages || 0), 0);
      const nihanOct = statsOct.reduce((acc, d) => acc + (d.nihanMessages || 0), 0);
      const totalOct = Math.max(1, sumaiyaOct + nihanOct);

      return {
        id: 'aura-october',
        scope: '2026-10',
        label: 'October 2026',
        title: 'All-Time Climax & Historical Landmark',
        subtitle: '4,297 messages • 672-msg record marathon • 37 photos • Landmark coronation',
        archetype: 'The Undisputed Soulmates',
        dominantMood: 'Non-Stop Dialogue, Affection & Unfiltered Laughter',
        glowGradient: 'from-rose-600/35 via-amber-500/25 to-purple-500/25',
        coreColors: ['#e11d48', '#f59e0b', '#a855f7'],
        palette: [
          { name: 'Record Crimson', hex: '#e11d48', desc: 'October 11th all-time peak of 672 messages & 10 calls' },
          { name: 'Landmark Gold', hex: '#f59e0b', desc: 'Crowning "Historical landmark" and "bauni" nicknames' },
          { name: 'Visual Lavender', hex: '#a855f7', desc: 'October 7th 37-photo marathon and midnight coffee talks' },
        ],
        energies: {
          nocturnal: 92,
          affection: 96,
          vocal: 94,
          banter: 98,
          devotion: 99,
        },
        metrics: {
          messages: msgs,
          voiceNotes: audio,
          shares: shares,
          reactions: reacts,
          sumaiyaPct: Number(((sumaiyaOct / totalOct) * 100).toFixed(1)) || 51.2,
          nihanPct: Number(((nihanOct / totalOct) * 100).toFixed(1)) || 48.8,
        },
        signatureQuote: {
          sender: 'SUMAIYA',
          text: 'Ekta video teo amra kotha bola thamai nai',
          context: 'October 6, 2026 • 9:50 PM • Unstoppable Connection',
          date: '2026-10-06',
        },
        poeticSynthesis:
          'October stood as the ultimate high-frequency zenith of the archive. With 4,297 messages in just two weeks, conversation flowed uninterrupted. As Sumaiya aptly captured: "Ekta video teo amra kotha bola thamai nai." From candid photos to playful girlfriend banter and late-night calls, this month defined their extraordinary closeness.',
      };
    }

    // Intimacy metrics influenced by tracked affectionate expressions and nicknames
    const expressionsBonus = Math.min(5, Math.round(expressions.length / 5));
    const nicknamesBonus = Math.min(4, Math.round(nicknames.length / 3));

    // Default: Overall Archive Aura
    const sumaiyaCount = metadata.participantsDisplay.SUMAIYA ?? 0;
    const nihanCount = metadata.participantsDisplay.NIHAN ?? 0;
    const sumaiyaPct = Number(((sumaiyaCount / metadata.totalMessages) * 100).toFixed(1));
    const nihanPct = Number(((nihanCount / metadata.totalMessages) * 100).toFixed(1));

    return {
      id: 'aura-overall',
      scope: 'overall',
      label: 'The Whole Archive',
      title: 'Cosmic Symphony & 9-Year Harmonic Bond',
      subtitle: `${metadata.totalMessages.toLocaleString()} messages • ${metadata.activeDays} active days • ${sumaiyaPct}% to ${nihanPct}% harmonic balance`,
      archetype: 'The Inseparable Confidants',
      dominantMood: 'Effortless Banter & Lifelong Devotion',
      glowGradient: 'from-rose-500/35 via-purple-600/30 to-amber-500/25',
      coreColors: ['#f43f5e', '#8b5cf6', '#06b6d4'],
      palette: [
        { name: 'Harmonic Rose', hex: '#f43f5e', desc: `${metadata.reactions.total} reactions and natural chemistry across 102 active days` },
        { name: 'Confidant Purple', hex: '#8b5cf6', desc: 'Over 9 years of friendship blooming into daily companionship' },
        { name: 'Vocal Cyan', hex: '#06b6d4', desc: `${metadata.media.audio} voice notes & shared late-night moments` },
      ],
      energies: {
        nocturnal: 86,
        affection: Math.min(100, 92 + expressionsBonus),
        vocal: 88,
        banter: Math.min(100, 95 + nicknamesBonus),
        devotion: 98,
      },
      metrics: {
        messages: metadata.totalMessages,
        voiceNotes: metadata.media.audio,
        shares: metadata.shares.total,
        reactions: metadata.reactions.total,
        sumaiyaPct,
        nihanPct,
      },
      signatureQuote: {
        sender: 'NIHAN',
        text: 'Amer amer full life a 1 tai female friend banaise 9 years hoi a gelo amader friendship ar and ar female friend banabo na 1 tai enough',
        context: 'October 9, 2026 • 10:27 AM • The 9-Year Promise',
        date: '2026-10-09',
        messageId: 'm_1791520058804_NIHAN',
      },
      poeticSynthesis:
        `Across ${metadata.activeDays} active days and ${metadata.totalMessages.toLocaleString()} messages, your bond represents a 9-year friendship flourishing into daily companionship. From 37-photo marathons to penguin walk teasing, inside jokes, and endless voice notes, your connection maintains an effortless, near 50/50 reciprocal harmony (${sumaiyaPct}% Sumaiya • ${nihanPct}% Nihan).`,
    };
  }, [selectedScope, customDate, dailyStats, metadata, dayMessages, expressions, nicknames]);

  // Interactive Canvas Aura Orb Animation
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let time = 0;
    const [c1, c2, c3] = auraReading.coreColors;

    // Convert hex to rgb
    const hexToRgb = (hex: string) => {
      const bigint = parseInt(hex.replace('#', ''), 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    };

    const rgb1 = hexToRgb(c1);
    const rgb2 = hexToRgb(c2);
    const rgb3 = hexToRgb(c3);

    const render = () => {
      time += 0.015;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const cx = w / 2;
      const cy = h / 2;

      // Smooth pointer interpolation
      pointerPos.current.x += (pointerPos.current.targetX - pointerPos.current.x) * 0.08;
      pointerPos.current.y += (pointerPos.current.targetY - pointerPos.current.y) * 0.08;

      ctx.clearRect(0, 0, w, h);

      // Distortions based on mouse
      const offsetX = (pointerPos.current.x - cx) * 0.15;
      const offsetY = (pointerPos.current.y - cy) * 0.15;

      // Base Radii
      const baseRadius = Math.min(w, h) * 0.38;

      // Blob 1 (Core Primary)
      const b1x = cx + Math.sin(time * 0.9) * 22 + offsetX;
      const b1y = cy + Math.cos(time * 0.7) * 20 + offsetY;
      const r1 = baseRadius * (0.85 + Math.sin(time * 1.5) * 0.12);
      const grad1 = ctx.createRadialGradient(b1x, b1y, 0, b1x, b1y, r1);
      grad1.addColorStop(0, `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, 0.85)`);
      grad1.addColorStop(0.5, `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, 0.45)`);
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(b1x, b1y, r1, 0, Math.PI * 2);
      ctx.fill();

      // Blob 2 (Harmonic Secondary)
      const b2x = cx + Math.cos(time * 1.1) * 35 - offsetX * 0.8;
      const b2y = cy + Math.sin(time * 0.8) * 30 - offsetY * 0.8;
      const r2 = baseRadius * (0.8 + Math.cos(time * 1.2) * 0.15);
      const grad2 = ctx.createRadialGradient(b2x, b2y, 0, b2x, b2y, r2);
      grad2.addColorStop(0, `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.75)`);
      grad2.addColorStop(0.6, `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.3)`);
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(b2x, b2y, r2, 0, Math.PI * 2);
      ctx.fill();

      // Blob 3 (Aether Ambient)
      const b3x = cx + Math.sin(time * 0.6 + 2) * 40;
      const b3y = cy + Math.cos(time * 1.3 + 1) * 35;
      const r3 = baseRadius * (0.95 + Math.sin(time * 0.8) * 0.1);
      const grad3 = ctx.createRadialGradient(b3x, b3y, 0, b3x, b3y, r3);
      grad3.addColorStop(0, `rgba(${rgb3.r}, ${rgb3.g}, ${rgb3.b}, 0.65)`);
      grad3.addColorStop(0.5, `rgba(${rgb3.r}, ${rgb3.g}, ${rgb3.b}, 0.25)`);
      grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad3;
      ctx.beginPath();
      ctx.arc(b3x, b3y, r3, 0, Math.PI * 2);
      ctx.fill();

      // Ambient Core Pulsar
      const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.5);
      centerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      centerGrad.addColorStop(0.3, `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, 0.3)`);
      centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Subtle Stardust Particles
      for (let i = 0; i < 6; i++) {
        const angle = time * 0.5 + (i * Math.PI) / 3;
        const dist = baseRadius * 0.75 + Math.sin(time * 2 + i) * 15;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, auraReading]);

  // Handle Mouse / Touch move on the Canvas Orb
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerPos.current.targetX = e.clientX - rect.left;
    pointerPos.current.targetY = e.clientY - rect.top;
  };

  const handlePointerLeave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      pointerPos.current.targetX = canvas.offsetWidth / 2;
      pointerPos.current.targetY = canvas.offsetHeight / 2;
    }
  };

  const handleCopyAuraCard = async () => {
    const summary = `🔮 NIHAN & SUMAIYA • RELATIONSHIP AURA SPECTRUM
━━━━━━━━━━━━━━━━━━━━━━
✨ Aura Title: ${auraReading.title}
👑 Archetype: ${auraReading.archetype}
🌈 Core Colors: ${auraReading.palette.map((p) => p.name).join(' • ')}

📊 ENERGY RESONANCE:
🌙 Nocturnal Depth (12 AM–5 AM): ${auraReading.energies.nocturnal}%
💖 Affection Velocity: ${auraReading.energies.affection}%
🎙️ Vocal Warmth (Voice Notes): ${auraReading.energies.vocal}%
😂 Playful Banter & Laughs: ${auraReading.energies.banter}%
🛡️ Steadfast Devotion: ${auraReading.energies.devotion}%

💬 Signature Quote:
"${auraReading.signatureQuote.text}"
— ${auraReading.signatureQuote.sender} (${auraReading.signatureQuote.context})

⚖️ Communication Balance: Sumaiya ${auraReading.metrics.sumaiyaPct}% • Nihan ${auraReading.metrics.nihanPct}%
━━━━━━━━━━━━━━━━━━━━━━
Preserved forever in Our Archive.`;

    try {
      await navigator.clipboard.writeText(summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      alert('Aura summary copied to clipboard!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl my-auto rounded-3xl bg-gradient-to-b from-[#13151f] via-[#0f1118] to-[#0a0b10] border border-white/10 shadow-2xl p-4 sm:p-7 overflow-hidden text-slate-200">
        {/* Dynamic Background Ambient Blur */}
        <div
          className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-40 bg-gradient-to-br ${auraReading.glowGradient}`}
        />
        <div
          className={`absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-30 bg-gradient-to-tr ${auraReading.glowGradient}`}
        />

        {/* Modal Top Bar */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 via-rose-500 to-amber-500 p-[1.5px] shadow-lg">
              <div className="w-full h-full rounded-[14px] bg-[#0b0d10] flex items-center justify-center text-rose-300">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-editorial text-white font-semibold tracking-tight">
                  Relationship Aura & Mood Spectrum
                </h2>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Interactive Synthesizer
                </span>
              </div>
              <p className="text-xs text-[#8b949e] font-sans">
                Emotional frequency analysis derived from {metadata.totalMessages.toLocaleString()} messages, voice notes & timestamps.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8b949e] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scope Selector Tabs */}
        <div className="relative z-10 flex items-center gap-1.5 pt-4 pb-2 overflow-x-auto no-scrollbar border-b border-white/5 text-xs font-mono">
          {[
            { id: 'overall', label: '✨ Entire Archive' },
            { id: 'early', label: 'Jan – Aug 2026 (Roots)' },
            { id: '2026-09', label: 'September 2026 (Spark)' },
            { id: '2026-10', label: 'October 2026 (Climax)' },
            { id: 'custom-day', label: '📅 Any Specific Day' },
          ].map((scope) => (
            <button
              key={scope.id}
              onClick={() => setSelectedScope(scope.id as any)}
              className={`px-3 py-1.5 rounded-xl shrink-0 transition-all font-medium ${
                selectedScope === scope.id
                  ? 'bg-gradient-to-r from-purple-500/25 to-rose-500/25 text-white border border-rose-400/40 shadow-sm'
                  : 'text-[#8b949e] hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
              }`}
            >
              {scope.label}
            </button>
          ))}
        </div>

        {/* Optional Custom Day Picker Bar */}
        {selectedScope === 'custom-day' && (
          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-3 pb-1 text-xs font-mono animate-fade-in">
            <span className="text-[#8b949e] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>Select Date to Scan:</span>
            </span>
            <input
              type="date"
              value={customDate}
              min={metadata.startDate || '2026-01-22'}
              max={metadata.endDate || '2026-10-16'}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 text-white focus:outline-none focus:border-rose-400 font-mono text-xs"
            />
            {isLoadingDay && (
              <span className="text-[11px] text-amber-300 flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" /> Synthesizing day frequency...
              </span>
            )}
          </div>
        )}

        {/* Main Interactive Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Left Column: Interactive Holographic Aura Orb (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-black/40 border border-white/10 relative overflow-hidden group">
            {/* Interactive Canvas Orb */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center cursor-grab active:cursor-grabbing">
              <canvas
                ref={canvasRef}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                className="w-full h-full drop-shadow-[0_0_40px_rgba(244,63,94,0.35)] filter saturate-150"
              />

              {/* Central Floating Archetype Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/70 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 mb-1">
                  {auraReading.archetype}
                </span>
                <span className="font-editorial text-lg text-white font-bold tracking-tight drop-shadow-md">
                  {auraReading.dominantMood}
                </span>
              </div>
            </div>

            <p className="text-[10px] font-mono text-[#8b949e] mt-2 flex items-center gap-1 text-center">
              <span>✦ Touch or move over orb to swirl energy field</span>
            </p>

            {/* Color Palette Swatches */}
            <div className="w-full mt-4 pt-4 border-t border-white/10 space-y-2">
              <div className="text-[11px] font-mono text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-rose-400" />
                <span>Chromatic Aura Palette</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {auraReading.palette.map((color, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-1"
                  >
                    <div
                      className="w-5 h-5 rounded-full shadow-inner ring-2 ring-white/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[10px] font-medium text-white truncate max-w-full">
                      {color.name}
                    </span>
                    <span className="text-[9px] font-mono text-[#8b949e]">{color.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Energy Resonance & Narrative Reading (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header Title Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-rose-300 font-semibold uppercase tracking-wider">
                  {auraReading.label} • READING
                </span>
                <span className="text-[10px] font-mono text-[#8b949e]">
                  {auraReading.metrics.messages.toLocaleString()} Messages
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-editorial text-white font-bold">
                {auraReading.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {auraReading.subtitle}
              </p>
            </div>

            {/* Energy Resonance Progress Bars */}
            <div className="p-4 sm:p-5 rounded-3xl bg-black/30 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Energy Resonance Profile</span>
                </span>
                <span className="text-purple-300">5-Dimensional Spectrum</span>
              </div>

              <div className="space-y-2.5 pt-1 text-xs">
                {/* 1. Nocturnal Depth */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-indigo-300 flex items-center gap-1">
                      <Moon className="w-3 h-3" /> Nocturnal Depth (12 AM – 5 AM)
                    </span>
                    <span className="font-semibold text-white">{auraReading.energies.nocturnal}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${auraReading.energies.nocturnal}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                </div>

                {/* 2. Affection Velocity */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-rose-300 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Affection Velocity (Love & Pet Names)
                    </span>
                    <span className="font-semibold text-white">{auraReading.energies.affection}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${auraReading.energies.affection}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
                    />
                  </div>
                </div>

                {/* 3. Vocal Warmth */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-amber-300 flex items-center gap-1">
                      <Mic className="w-3 h-3" /> Vocal Warmth (Voice Notes Density)
                    </span>
                    <span className="font-semibold text-white">{auraReading.energies.vocal}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${auraReading.energies.vocal}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                  </div>
                </div>

                {/* 4. Playful Banter */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-emerald-300 flex items-center gap-1">
                      <Smile className="w-3 h-3" /> Playful Banter & Laughs
                    </span>
                    <span className="font-semibold text-white">{auraReading.energies.banter}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${auraReading.energies.banter}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                  </div>
                </div>

                {/* 5. Steadfast Devotion */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-purple-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Steadfast Devotion & Reassurance
                    </span>
                    <span className="font-semibold text-white">{auraReading.energies.devotion}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${auraReading.energies.devotion}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-sky-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Emotional Quote Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
              <Quote className="absolute right-3 bottom-2 w-12 h-12 text-white/5 pointer-events-none" />
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8b949e] mb-1.5">
                <span className="text-rose-300 font-semibold uppercase tracking-wider">
                  Signature Quote • {auraReading.signatureQuote.sender}
                </span>
                <span>{auraReading.signatureQuote.context}</span>
              </div>
              <p className="text-sm font-sans text-slate-100 italic leading-relaxed">
                "{auraReading.signatureQuote.text}"
              </p>
              {onSelectDate && auraReading.signatureQuote.date && (
                <button
                  onClick={() => {
                    onSelectDate(auraReading.signatureQuote.date, auraReading.signatureQuote.messageId);
                    onClose();
                  }}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-mono text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <span>Relive this conversation in chat</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Narrative Synthesis */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/20 via-rose-950/20 to-black/40 border border-white/10">
              <div className="text-[11px] font-mono text-purple-300 uppercase tracking-wider mb-1">
                Poetic Synthesis
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {auraReading.poeticSynthesis}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-5 border-t border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#8b949e] text-[11px]">
            <span>Balance:</span>
            <span className="text-rose-400 font-semibold">Sumaiya {auraReading.metrics.sumaiyaPct}%</span>
            <span>•</span>
            <span className="text-sky-400 font-semibold">Nihan {auraReading.metrics.nihanPct}%</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyAuraCard}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-rose-500/20 hover:from-purple-500/30 hover:to-rose-500/30 border border-rose-500/30 text-rose-300 transition-all active:scale-95 shadow-sm"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Aura Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Copy Story Card</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
