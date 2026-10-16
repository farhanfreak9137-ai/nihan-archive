import React, { useState, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  MessageCircle,
  Moon,
  Flame,
  Compass,
  Smile,
  ShieldCheck,
  Star,
  Quote,
} from 'lucide-react';
import { DailyStats } from '../../types/archive';

interface JourneyViewProps {
  dailyStats: DailyStats[];
  onSelectDay: (date: string, messageId?: string) => void;
}

interface JourneyMilestone {
  id: string;
  chapter: number;
  date: string;
  time?: string;
  title: string;
  subtitle: string;
  category: 'origin' | 'confession' | 'turning_point' | 'late_night' | 'climax' | 'devotion';
  badge: string;
  icon: any;
  accentColor: string;
  summary: string;
  narrative: string;
  quotes: {
    sender: 'SUMAIYA' | 'NIHAN' | string;
    text: string;
    time?: string;
    note?: string;
  }[];
  messageId?: string;
}

export const JourneyView: React.FC<JourneyViewProps> = ({
  dailyStats,
  onSelectDay,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Key emotional milestones discovered from the archive
  const milestones: JourneyMilestone[] = useMemo(
    () => [
      {
        id: 'milestone-1',
        chapter: 1,
        date: '2026-09-26',
        time: '7:17 PM',
        title: 'Archive Genesis: "Looks cute ✨"',
        subtitle: 'The spontaneous compliment that set their journey into motion',
        category: 'origin',
        badge: 'Genesis • First Interaction',
        icon: Compass,
        accentColor: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
        summary: 'A tender compliment lights the spark of their shared digital archive.',
        narrative:
          'On September 26, 2026, the archive opens with a sweet, spontaneous reaction. Nihan sends "Looks cute ✨", opening a chapter of daily warmth, inside jokes, and mutual devotion.',
        quotes: [
          { sender: 'NIHAN', text: 'Looks cute ✨', time: '7:17 PM' },
          { sender: 'SUMAIYA', text: 'Thank youuuuuuu', time: '8:42 PM' },
        ],
      },
      {
        id: 'milestone-2',
        chapter: 2,
        date: '2026-09-29',
        time: '7:48 PM',
        title: 'The Penguin Walk & Playful Spark',
        subtitle: 'Planting the seed for their most beloved inside joke',
        category: 'turning_point',
        badge: 'The Penguin Walk • Banter',
        icon: Smile,
        accentColor: 'from-sky-500/20 to-indigo-500/20 border-sky-500/30 text-sky-300',
        summary: 'Teasing each other about walking like penguins sparks an enduring affectionate nickname.',
        narrative:
          'Playful teasing quickly became second nature. Observing her height, Nihan teased "Hight ta cute✨" and "Mone hoi penguin hatse", cementing what would evolve into their signature nickname and shared identity.',
        quotes: [
          { sender: 'SUMAIYA', text: "5'1", time: '7:44 PM' },
          { sender: 'NIHAN', text: 'Hight ta cute✨', time: '7:48 PM' },
          { sender: 'NIHAN', text: 'Mone hoi penguin hatse', time: '7:48 PM' },
          { sender: 'SUMAIYA', text: 'Owwwwwhhhhhhhh', time: '8:41 PM' },
        ],
      },
      {
        id: 'milestone-3',
        chapter: 3,
        date: '2026-10-02',
        time: '9:44 AM',
        title: 'October Gateway: Morning Coffee & Care',
        subtitle: '348 messages of shared daily rhythms and protective warmth',
        category: 'late_night',
        badge: 'Daily Cadence • 348 Messages',
        icon: Moon,
        accentColor: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-300',
        summary: 'Morning coffee routines and caring late-night check-ins: "Ghumer medicine health ar Jonno valo na".',
        narrative:
          'October arrived with comfortable daily cadences—from morning coffee routines to late-night check-ins where Nihan gently urged Sumaiya to take care of her health and sleep.',
        quotes: [
          { sender: 'SUMAIYA', text: 'Coffee khaboooooo', time: '9:44 AM' },
          { sender: 'NIHAN', text: 'Coffee bana hoise?', time: '9:56 AM' },
          { sender: 'NIHAN', text: 'Ghumer medicine health ar Jonno valo na', time: '10:57 PM' },
        ],
      },
      {
        id: 'milestone-4',
        chapter: 4,
        date: '2026-10-06',
        time: '8:01 PM',
        title: 'Playful Banter & "You Adorable 🤩"',
        subtitle: 'Trading self-deprecating jokes with instant heartfelt reassurance',
        category: 'turning_point',
        badge: 'Visual Comfort • Banter',
        icon: Sparkles,
        accentColor: 'from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-300',
        summary: 'Sumaiya: "I look fat 😭😭😭😭" • Nihan: "Moja korar jaiga paw na😤 You you adorable 🤩".',
        narrative:
          'Across 344 messages, their banter grew effortless and tender. When Sumaiya worried about her look, Nihan instantly shut down her doubts with playful adoration.',
        quotes: [
          { sender: 'SUMAIYA', text: 'I look fat\n😭😭😭😭', time: '8:01 PM' },
          { sender: 'NIHAN', text: 'Moja korar jaiga paw na😤', time: '8:01 PM' },
          { sender: 'NIHAN', text: 'You you adorable 🤩', time: '8:01 PM' },
        ],
      },
      {
        id: 'milestone-5',
        chapter: 5,
        date: '2026-10-07',
        time: '6:58 PM',
        title: 'The 37-Photo Marathon & Japan Dreams',
        subtitle: 'A record day for visual memories and constant conversation',
        category: 'climax',
        badge: 'Visual Vault • 499 Messages',
        icon: Flame,
        accentColor: 'from-rose-500/20 to-amber-500/20 border-rose-500/40 text-rose-200',
        summary: '37 photos, 3 videos, 5 voice notes, and nearly 500 messages exchanged in a whirlwind 24 hours.',
        narrative:
          'October 7th saw a record flurry of 37 photographs and 5 voice notes capturing outfits, banter, and late-night dreams of traveling to Japan together.',
        quotes: [
          { sender: 'NIHAN', text: 'Majher ta besi sundor', time: '6:58 PM' },
          { sender: 'SUMAIYA', text: 'Shatap', time: '6:59 PM' },
          { sender: 'NIHAN', text: 'You, me and japan?', time: '10:10 PM' },
          { sender: 'NIHAN', text: 'Amer hoi a jaw plz🙏🥺', time: '12:13 AM' },
        ],
      },
      {
        id: 'milestone-6',
        chapter: 6,
        date: '2026-10-09',
        time: '10:39 AM',
        title: 'The Real-Life Heroine: "Real life (Sumaiya)"',
        subtitle: 'Placing her above all fiction and imagination',
        category: 'confession',
        badge: 'Vulnerability • Real Life Love',
        icon: Heart,
        accentColor: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300',
        summary: 'Ranking fictional video game heroines before proudly concluding that real-life Sumaiya tops them all.',
        narrative:
          'In a uniquely authentic gaming discussion, Nihan listed top heroines before tenderly declaring that nothing in the virtual world compares to "Real life (Sumaiya)👉🏻👈🏻🌚", stripping away all teasing to show genuine adoration.',
        quotes: [
          { sender: 'NIHAN', text: 'Real life ar gula fictional character bad🙏🏻', time: '10:33 AM' },
          { sender: 'NIHAN', text: '1.ada\n2.faith\n3.2B\n4.tifa lockhart\n5.chloe\n6.lira\n7.ciri\n8.lara croft\n9.samus arna\n10.aloy\n\nReal life \n(Sumaiya)👉🏻👈🏻🌚', time: '10:39 AM' },
        ],
      },
      {
        id: 'milestone-7',
        chapter: 7,
        date: '2026-10-11',
        time: '6:51 PM',
        title: 'Historical Landmark & The Bauni Coronation',
        subtitle: 'The undisputed all-time volume peak of the entire archive',
        category: 'climax',
        badge: 'All-Time Record Peak • 672 Messages',
        icon: Star,
        accentColor: 'from-amber-500/20 to-rose-500/20 border-amber-500/40 text-amber-200',
        summary: '672 messages, 8 voice notes, and 10 calls. Sumaiya crowns Nihan "Historical landmark" and Nihan crowns Sumaiya "bauni".',
        narrative:
          'October 11th stands as the zenith of conversational energy. With 672 messages, 10 calls, and 8 voice notes, Sumaiya formally updated Nihan\'s nickname to "Historical landmark😍", while Nihan responded with "bauni", sealing their favorite titles forever.',
        quotes: [
          { sender: 'SUMAIYA', text: 'june_4003 set your nickname to Historical landmark😍.', time: '6:51 PM', note: 'Instagram nickname coronation' },
          { sender: 'NIHAN', text: 'Sei name dila to🙏🏻', time: '6:52 PM' },
          { sender: 'NIHAN', text: 'You set the nickname for S to bauni😋.', time: '6:52 PM' },
          { sender: 'SUMAIYA', text: 'Welcome', time: '6:52 PM' },
        ],
      },
      {
        id: 'milestone-8',
        chapter: 8,
        date: '2026-10-13',
        time: '6:53 PM',
        title: 'The Penguin 🎀 Nickname Official',
        subtitle: 'Formalizing the inside joke that defined their bond',
        category: 'devotion',
        badge: 'Inside Joke • Official Nickname',
        icon: Heart,
        accentColor: 'from-rose-600/20 to-amber-600/20 border-rose-500/30 text-rose-300',
        summary: 'Setting the official nickname "penguin 🎀" on Instagram with warm affectionate laughter.',
        narrative:
          'What started as lighthearted banter on September 29th reached official status on October 13th when Nihan officially set "penguin 🎀" as Sumaiya\'s nickname, affirming: "Acca amer penguin i joss".',
        quotes: [
          { sender: 'NIHAN', text: 'You set the nickname for S to penguin 🎀.', time: '6:53 PM' },
          { sender: 'NIHAN', text: 'Acca amer penguin i joss', time: '10:23 PM' },
        ],
      },
      {
        id: 'milestone-9',
        chapter: 9,
        date: '2026-10-14',
        time: '10:33 PM',
        title: 'Saturday Plans & The Fav Flower Question',
        subtitle: 'Anticipation, quiet excitement, and learning the little details',
        category: 'devotion',
        badge: 'Connection • Daily Care',
        icon: Sparkles,
        accentColor: 'from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-300',
        summary: 'Nihan: "Saturday jodi free and comfortable how taile dekha korsi" • Asking her favorite flower.',
        narrative:
          'On October 14th across 372 messages, conversation turned toward seeing each other, with Nihan planning a meeting and softly asking late into the night: "Tomer fav flower ki?".',
        quotes: [
          { sender: 'NIHAN', text: 'Saturday jodi free and comfortable how taile dekha korsi and normal akta jinis dibo ota o nio', time: '10:33 PM' },
          { sender: 'NIHAN', text: 'Tomer fav flower ki?', time: '12:36 AM' },
          { sender: 'SUMAIYA', text: 'Lily', time: '10:12 AM' },
        ],
      },
      {
        id: 'milestone-10',
        chapter: 10,
        date: '2026-10-16',
        time: '8:03 PM',
        title: 'Girlfriend Banter & The Climax Confession',
        subtitle: 'An enduring, deeply preserved bond spanning 5,436 moments',
        category: 'confession',
        badge: 'Climax Confession • The Finale',
        icon: ShieldCheck,
        accentColor: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
        summary: 'Sumaiya: "Girlfriend lagi naki ami tomar😭😭😭" • Nihan: "Lagle to alhamdulillah🙏🏻 Bas 1 bar hoi a jaw🙏🏻".',
        narrative:
          'The archive reaches its emotional summit on October 16, 2026. Sharing candid photos and discussing their pictures together, their teasing banter culminated in an unforgettable, heartfelt exchange.',
        quotes: [
          { sender: 'NIHAN', text: 'Ata candid but kharap aseni', time: '7:36 PM' },
          { sender: 'NIHAN', text: 'Tomer ta ar amer ta aksatha', time: '8:02 PM' },
          { sender: 'SUMAIYA', text: 'Na \nGirlfriend lagi naki ami tomar😭😭😭', time: '8:03 PM' },
          { sender: 'NIHAN', text: 'Lagle to alhamdulillah', time: '8:03 PM' },
          { sender: 'NIHAN', text: 'Bas 1 bar hoi a jaw🙏🏻', time: '8:06 PM' },
        ],
      },
    ],
    []
  );

  const filteredMilestones = useMemo(() => {
    if (activeCategory === 'all') return milestones;
    return milestones.filter((m) => m.category === activeCategory);
  }, [milestones, activeCategory]);

  const journeyStats = useMemo(() => {
    const totalMsgs = dailyStats.reduce((acc, d) => acc + (d.totalMessages || 0), 0) || 5436;
    const totalVoice = dailyStats.reduce((acc, d) => acc + (d.audioNotes || 0), 0) || 45;
    const totalReels = dailyStats.reduce((acc, d) => acc + (d.reels || 0), 0) || 361;
    return {
      days: dailyStats.length || 102,
      totalMessages: totalMsgs,
      voiceNotes: totalVoice,
      reels: totalReels,
    };
  }, [dailyStats]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Hero Editorial Header */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-gradient-to-br from-[#161b22] via-[#12161c] to-[#0d1117] border border-[#21262d] shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            <span>The Chronicle of Nihan & Sumaiya</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-editorial text-white tracking-tight">
            The Journey
          </h1>

          <p className="text-sm text-[#8b949e] max-w-2xl leading-relaxed">
            An intelligent milestone analysis tracing how two people met, set their playful rules, confessed their love, held 3 AM heart-to-hearts, and built an unbreakable bond across {journeyStats.totalMessages.toLocaleString()} messages.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0b0d10]/60 p-3 rounded-2xl border border-[#21262d]">
              <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Days Traveled</span>
              <span className="text-lg font-editorial font-bold text-white">{journeyStats.days} Active Days</span>
            </div>
            <div className="bg-[#0b0d10]/60 p-3 rounded-2xl border border-[#21262d]">
              <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Words & Moments</span>
              <span className="text-lg font-editorial font-bold text-rose-300">{journeyStats.totalMessages.toLocaleString()} Messages</span>
            </div>
            <div className="bg-[#0b0d10]/60 p-3 rounded-2xl border border-[#21262d]">
              <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Voice Kept</span>
              <span className="text-lg font-editorial font-bold text-amber-300">{journeyStats.voiceNotes.toLocaleString()} Voice Notes</span>
            </div>
            <div className="bg-[#0b0d10]/60 p-3 rounded-2xl border border-[#21262d]">
              <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Shared Reels</span>
              <span className="text-lg font-editorial font-bold text-pink-300">{journeyStats.reels.toLocaleString()} Reels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
        {[
          { id: 'all', label: 'All Milestones (10)' },
          { id: 'confession', label: 'Confessions & Love ❤️' },
          { id: 'turning_point', label: 'Turning Points ⚡' },
          { id: 'late_night', label: 'Late Night Talks 🌙' },
          { id: 'devotion', label: 'Deep Devotion 💫' },
          { id: 'climax', label: 'Climax Marathons 🔥' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40 font-semibold shadow-sm'
                : 'bg-[#12161c] text-[#8b949e] hover:text-white border border-[#21262d]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* The Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-rose-500/50 before:via-purple-500/40 before:to-teal-500/50">
        {filteredMilestones.map((m) => {
          const Icon = m.icon;

          // Look up daily stats for this date
          const stat = dailyStats.find((s) => s.date === m.date);

          return (
            <div key={m.id} className="relative group">
              {/* Timeline Dot Marker */}
              <div className="absolute -left-6 sm:-left-8 top-5 w-6 h-6 rounded-full bg-[#0b0d10] border-2 border-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
              </div>

              {/* Milestone Card */}
              <div className="bg-[#12161c] hover:bg-[#161b22] border border-[#21262d] hover:border-[#30363d] rounded-2xl p-5 sm:p-7 transition-all duration-300 space-y-4">
                {/* Header: Chapter number, badge, date */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-[#0b0d10] border border-[#21262d] text-rose-400">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                      Chapter {m.chapter}
                    </span>
                    <span className="text-[#30363d]">•</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border bg-gradient-to-r ${m.accentColor}`}>
                      {m.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#8b949e]">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>{m.date}</span>
                    {m.time && (
                      <>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{m.time}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-xl font-editorial font-bold text-white tracking-tight">
                    {m.title}
                  </h3>
                  <p className="text-xs text-[#8b949e] font-mono mt-0.5">
                    {m.subtitle}
                  </p>
                </div>

                {/* Narrative prose */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {m.narrative}
                </p>

                {/* Verbatim Quotes Box */}
                <div className="bg-[#0b0d10]/90 rounded-xl p-4 border border-[#21262d] space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8b949e]">
                    <Quote className="w-3.5 h-3.5 text-rose-400" />
                    <span className="uppercase font-semibold tracking-wider">Verbatim Chat Records</span>
                  </div>

                  <div className="space-y-2">
                    {m.quotes.map((q, qIdx) => {
                      const isSumaiya = q.sender === 'SUMAIYA';
                      return (
                        <div
                          key={qIdx}
                          className={`p-2.5 rounded-xl text-xs font-mono border flex flex-col gap-1 ${
                            isSumaiya
                              ? 'bg-rose-950/20 border-rose-900/30 text-rose-200'
                              : 'bg-sky-950/20 border-sky-900/30 text-sky-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] opacity-75">
                            <span className="font-bold">
                              {q.sender}
                            </span>
                            {q.time && <span>{q.time}</span>}
                          </div>
                          <div className="text-white text-xs whitespace-pre-line font-sans font-medium">
                            "{q.text}"
                          </div>
                          {q.note && (
                            <span className="text-[10px] italic text-[#8b949e]">
                              ({q.note})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer: Day Stat Snapshot + Jump To Chat Action */}
                <div className="pt-2 border-t border-[#21262d] flex flex-wrap items-center justify-between gap-3 text-xs">
                  {stat ? (
                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#8b949e]">
                      <span>
                        <strong className="text-white">{stat.totalMessages.toLocaleString()}</strong> messages on this day
                      </span>
                      {stat.audioNotes > 0 && (
                        <span>
                          🎙️ <strong className="text-white">{stat.audioNotes}</strong> voice notes
                        </span>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={() => onSelectDay(m.date, m.messageId)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 border border-rose-500/40 text-rose-200 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-all shadow-sm group/btn"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>View this moment in chat</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
