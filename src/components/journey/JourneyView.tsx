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
    sender: 'NILA' | 'FARHAN';
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
        date: '2026-07-06',
        time: '6:37 PM',
        title: 'The First Spark: Where It All Began',
        subtitle: 'The very first exchange that started an extraordinary journey',
        category: 'origin',
        badge: 'Day 1 • First Interaction',
        icon: Compass,
        accentColor: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
        summary: 'A simple, startled message about something scary turns into the opening words of our story.',
        narrative:
          'On July 6th, 2026 at 6:37 PM, the archive opens with Nila reaching out. What started with playful teasing—"Seriously naki sarcasm?"—laid the subtle foundation of two souls finding mutual comfort in banter.',
        quotes: [
          { sender: 'NILA', text: 'Onk bhoy paisi 😧', time: '6:37 PM' },
          { sender: 'FARHAN', text: 'Seriously naki sarcasm?', time: '6:39 PM' },
          { sender: 'NILA', text: 'Sarcasm kn hobe... first e to bhabsi more gese', time: '6:49 PM' },
        ],
        messageId: 'm_1783341453041_NILU',
      },
      {
        id: 'milestone-2',
        chapter: 2,
        date: '2026-07-11',
        time: '7:34 PM',
        title: 'The 10 Unwritten Rules',
        subtitle: 'Nila sets the terms of engagement — and Farhan happily complies',
        category: 'turning_point',
        badge: 'The Covenant • Foundation',
        icon: ShieldCheck,
        accentColor: 'from-sky-500/20 to-indigo-500/20 border-sky-500/30 text-sky-300',
        summary: 'Nila lays down her iconic 10 rules: from always replying first to needing permission before entering any relationship.',
        narrative:
          'Five days in, the dynamic solidified. Nila drafted a legendary 10-point manifesto of how she expected to be treated. It was witty, authoritative, and deeply endearing. It made one thing crystal clear: they weren’t just casual acquaintances anymore.',
        quotes: [
          {
            sender: 'NILA',
            text: '1. Always reply to me first.\n2. Always treat me in the best way possible.\n3. Give me good advice, but if I do something silly, you still have to appreciate me. 🙃\n4. Whatever I say is always right.\n5. You have to tell me all your secrets.\n6. You have to share any problem or anything that\'s on your mind with me.\n7. If I get angry, you have to calm me down no matter what...\n8. If I start an argument, you can\'t stay quiet—you have to argue back, but in the end, you have to be the one to apologize.\n9. Whenever I\'m in a bad mood, you have to cheer me up...\n10. If you ever want to be in a relationship, you need my permission first.',
            time: '7:34 PM',
            note: 'The foundational relationship contract',
          },
        ],
        messageId: 'm_1783776859424_NILU',
      },
      {
        id: 'milestone-3',
        chapter: 3,
        date: '2026-07-12',
        time: '12:25 AM',
        title: 'The Midnight Confession: The First "I Love You"',
        subtitle: 'Under the quiet cover of midnight, the words slip through',
        category: 'confession',
        badge: 'First Confession • Midnight',
        icon: Heart,
        accentColor: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-300',
        summary: 'At 12:25 AM past midnight, Nila says the words: "I love you & i am so sorry plz forgive meeee".',
        narrative:
          'Just past midnight on July 12, following an emotional exchange, Nila let down all guards and typed the four words that changed the trajectory of the archive forever. The barrier was broken, and true vulnerability took root.',
        quotes: [
          { sender: 'NILA', text: 'I love you & i am so sorry plz forgive meeee', time: '12:25 AM' },
          { sender: 'NILA', text: 'Accha i love you sorry', time: '12:49 AM' },
        ],
        messageId: 'm_1783794344583_NILU',
      },
      {
        id: 'milestone-4',
        chapter: 4,
        date: '2026-07-13',
        time: '6:21 PM',
        title: 'Farhan\'s Reciprocation: "Valobashi Toooo"',
        subtitle: 'The feeling is undeniable and completely mutual',
        category: 'confession',
        badge: 'Reciprocation • Mutual Love',
        icon: Sparkles,
        accentColor: 'from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-300',
        summary: 'Farhan confirms what was already in both of their hearts: "valobashi tooooo".',
        narrative:
          'Within 24 hours of Nila\'s admission, Farhan made his own feelings unequivocal. From this moment onward, love wasn\'t a taboo subject; it became their everyday reality.',
        quotes: [
          { sender: 'FARHAN', text: 'valobashi tooooo', time: '6:21 PM' },
          { sender: 'FARHAN', text: 'Valobashi deikha khaite hoitese ekhon tor jonno', time: '7:46 PM (July 15)' },
        ],
        messageId: 'm_1783945281489_farhannn',
      },
      {
        id: 'milestone-5',
        chapter: 5,
        date: '2026-07-19',
        time: '11:32 PM',
        title: '"Koto Valobashi Tore": Unbreakable Devotion',
        subtitle: 'No longer holding back, saying how much they mean to each other',
        category: 'devotion',
        badge: 'Deepening Devotion',
        icon: Flame,
        accentColor: 'from-rose-600/20 to-amber-600/20 border-rose-500/30 text-rose-300',
        summary: 'Both openly professing depth: Nila\'s "Je tore bhalobashi" and Farhan\'s "Koto valobashi tore".',
        narrative:
          'Midway through July, their exchanges took on an effortless warmth. The hesitation was completely gone. Saying "bhalobashi" was as natural as breathing.',
        quotes: [
          { sender: 'NILA', text: 'Je tore bhalobashi', time: '2:59 PM' },
          { sender: 'FARHAN', text: 'Koto valobashi tore', time: '11:32 PM' },
        ],
      },
      {
        id: 'milestone-6',
        chapter: 6,
        date: '2026-08-01',
        time: '6:27 PM',
        title: 'The Hug Wish: Longing for Physical Presence',
        subtitle: 'When text messages aren\'t enough to soothe a heavy heart',
        category: 'turning_point',
        badge: 'Emotional Intimacy',
        icon: Smile,
        accentColor: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-300',
        summary: 'Nila wishing she could be there in person: "Samne thakle hoyto tore ekta hug ditam jaate iktu halka hoite paros".',
        narrative:
          'As August arrived, emotional intimacy deepened into a profound yearning for comforting physical proximity. Wanting to wrap each other in safety during vulnerable moments became their unspoken bond.',
        quotes: [
          {
            sender: 'NILA',
            text: 'Samne thakle hoyto tore ekta hug ditam jaate iktu halka hoite paros but sei way to nai',
            time: '6:27 PM',
            note: 'Desiring to comfort Farhan through presence',
          },
        ],
      },
      {
        id: 'milestone-7',
        chapter: 7,
        date: '2026-08-04',
        time: '3:10 AM',
        title: 'The 3 AM Definition: "What Is Our Relationship?"',
        subtitle: 'The late-night conversation confronting what they mean to each other',
        category: 'late_night',
        badge: '3 AM Heart-to-Heart',
        icon: Moon,
        accentColor: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-300',
        summary: 'In the silence of 3:10 AM, Farhan asks: "tomar ar amar relationship ta ki?"',
        narrative:
          'Late night talks always stripped away pretense. At 3:10 in the morning, Farhan posed the defining question. Even when couched in playful deflection ("Amra relationship e naki"), both knew they had built something far deeper than conventional labels.',
        quotes: [
          { sender: 'FARHAN', text: 'tomar ar amar relationship ta ki?', time: '3:10 AM' },
          { sender: 'NILA', text: 'Amra relationship e naki', time: '3:10 AM' },
        ],
      },
      {
        id: 'milestone-8',
        chapter: 8,
        date: '2026-08-16',
        time: '2:38 AM',
        title: 'Becoming One: "Our Smell Will Become One"',
        subtitle: 'The dream of an embrace so close that even scents merge',
        category: 'devotion',
        badge: 'Poetic Intimacy',
        icon: Star,
        accentColor: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300',
        summary: 'Nila: "Amra hug korlei amdr smell ek hoye jabe" • Farhan: "onnneeeekkhooonn hug kore thakboo okk".',
        narrative:
          'Another late-night conversation gave birth to one of the most tender poetic thoughts in the entire archive: the idea that holding each other close would fuse their scent into a single shared essence.',
        quotes: [
          { sender: 'NILA', text: 'Amra hug korlei amdr smell ek hoye jabe', time: '2:38 AM' },
          { sender: 'FARHAN', text: 'onnneeeekkhooonn hug kore thakboo okk', time: '2:39 AM' },
        ],
      },
      {
        id: 'milestone-9',
        chapter: 9,
        date: '2026-09-05',
        time: 'All Day',
        title: 'The Great Marathon: 2,096 Messages in 24 Hours',
        subtitle: 'The all-time peak climax of the entire archive',
        category: 'climax',
        badge: 'All-Time Record Peak',
        icon: Flame,
        accentColor: 'from-rose-500/20 to-amber-500/20 border-rose-500/40 text-rose-200',
        summary: 'A non-stop texting marathon generating 2,096 messages, 55 voice notes, 78 shares, and 24 hours of unbroken connection.',
        narrative:
          'September 5th was the pinnacle of conversational intensity. Generating 2,096 messages across day and night, it stands as the single most active day in their history.',
        quotes: [
          { sender: 'NILA', text: 'Tore chara amr bhalo lage na', note: 'Exchanged during the peak record marathon' },
          { sender: 'FARHAN', text: 'Ami shob somoy tomar sathei asi', note: 'Constant presence throughout the day' },
        ],
      },
      {
        id: 'milestone-10',
        chapter: 10,
        date: '2026-09-15',
        time: '8:24 PM',
        title: '"I\'m Right Here": Weathering Every Storm Together',
        subtitle: 'Maturity, reassurance, and an unbreakable bond that stands firm',
        category: 'devotion',
        badge: 'Resilience & Steadfastness',
        icon: ShieldCheck,
        accentColor: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
        summary: 'Farhan reassuring Nila during tough moments: "accha somossa nai ami eikhanei asi" & "I\'m sorry".',
        narrative:
          'By mid-September, through ups and downs, the relationship proved its durability. It wasn\'t just fun and laughter—it was the quiet, unwavering commitment to stay right there when things got heavy.',
        quotes: [
          { sender: 'FARHAN', text: 'accha somossa nai ami eikhanei asi', time: '8:24 PM' },
          { sender: 'FARHAN', text: 'I\'m sorry', time: '8:24 PM' },
          { sender: 'NILA', text: 'Ammu dui din por emnei normal hoye jabe... Kisukkokhon er jonnoi', time: '8:21 PM' },
        ],
      },
      {
        id: 'milestone-11',
        chapter: 11,
        date: '2026-09-29',
        time: '5:36 PM',
        title: '"Mera Sukoon Aur Mera Aane Wala Kal"',
        subtitle: 'Stepping into Autumn with deep, unwavering conviction',
        category: 'devotion',
        badge: 'Latest Closeness • The Present',
        icon: Sparkles,
        accentColor: 'from-purple-500/20 to-rose-500/20 border-purple-500/30 text-purple-300',
        summary: 'Farhan\'s heartfelt confession: "meri khushi, mera sukoon aur mera aane wala kal... sab sirf tumse hai" • Nila: "I love you too jantush".',
        narrative:
          'Heading into October, the archive reaches a profound, mature beauty. On September 29th, in an exchange that echoed throughout the day, Farhan put into words the peaceful certainty they both feel: that their peace, happiness, and future belong completely together.',
        quotes: [
          { sender: 'FARHAN', text: 'Aise likhoge toh tum par aur zyada pyaar aayega. Main bas itna jaanta hu ki meri khushi, mera sukoon aur mera aane wala kal... sab sirf tumse hai.', time: '5:36 PM' },
          { sender: 'FARHAN', text: 'i love you baby', time: '5:59 PM' },
          { sender: 'NILA', text: 'I love you too jantush', time: '5:59 PM' },
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
    const totalMsgs = dailyStats.reduce((acc, d) => acc + (d.totalMessages || 0), 0) || 92573;
    const totalVoice = dailyStats.reduce((acc, d) => acc + (d.audioNotes || 0), 0) || 2335;
    const totalReels = dailyStats.reduce((acc, d) => acc + (d.reels || 0), 0) || 1761;
    return {
      days: dailyStats.length || 97,
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
            <span>The Chronicle of Nila & Farhan</span>
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
                      const isNila = q.sender === 'NILA';
                      return (
                        <div
                          key={qIdx}
                          className={`p-2.5 rounded-xl text-xs font-mono border flex flex-col gap-1 ${
                            isNila
                              ? 'bg-rose-950/20 border-rose-900/30 text-rose-200'
                              : 'bg-sky-950/20 border-sky-900/30 text-sky-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] opacity-75">
                            <span className="font-bold">{q.sender}</span>
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
