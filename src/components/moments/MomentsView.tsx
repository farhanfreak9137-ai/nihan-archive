import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  ArrowRight,
  Flame,
  Heart,
  Moon,
  Trophy,
  Dices,
  Mic,
  Smile,
  Search,
  Star,
  Copy,
  Check,
  LayoutGrid,
  X,
  MessageCircle,
  PhoneCall,
  Film,
} from 'lucide-react';
import { Moment, MomentCategory } from '../../types/archive';
import { SurpriseMemoryModal } from './SurpriseMemoryModal';

interface MomentsViewProps {
  moments: Moment[];
  onSelectMoment: (date: string, messageId?: string) => void;
  onSaveMoment: (moment: Moment) => void;
  onDeleteMoment: (id: string) => void;
}

export const MomentsView: React.FC<MomentsViewProps> = ({
  moments,
  onSelectMoment,
  onSaveMoment,
  onDeleteMoment,
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-09-05');
  const [newCategory, setNewCategory] = useState<MomentCategory>('milestone');
  const [newIcon, setNewIcon] = useState('sparkles');
  const [newDesc, setNewDesc] = useState('');
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteSender, setNewQuoteSender] = useState<'NILU' | 'farhannn'>('farhannn');
  const [newTags, setNewTags] = useState('milestone, memory');

  // Featured capsule moment (defaults to a high-impact moment like Sept 5, Sept 24, or Aug 1)
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const categories: { id: string; label: string; icon: string; count: number }[] = useMemo(() => {
    const counts: Record<string, number> = {
      all: moments.length,
      favorite: moments.filter((m) => m.isFavorite).length,
      milestone: moments.filter((m) => m.category === 'milestone').length,
      'late-night': moments.filter((m) => m.category === 'late-night').length,
      audio: moments.filter((m) => m.category === 'audio').length,
      love: moments.filter((m) => m.category === 'love').length,
      banter: moments.filter((m) => m.category === 'banter').length,
      comfort: moments.filter((m) => m.category === 'comfort').length,
      custom: moments.filter((m) => m.isCustom).length,
    };

    return [
      { id: 'all', label: 'All Moments', icon: '✨', count: counts.all },
      { id: 'favorite', label: 'Starred Favorites', icon: '⭐', count: counts.favorite },
      { id: 'milestone', label: 'Milestones & Peaks', icon: '🏆', count: counts.milestone },
      { id: 'late-night', label: 'Late-Night & 3 AM', icon: '🌙', count: counts['late-night'] },
      { id: 'audio', label: 'Voice Note Sagas', icon: '🎙️', count: counts.audio },
      { id: 'love', label: 'Love & Promises', icon: '❤️', count: counts.love },
      { id: 'banter', label: 'Inside Jokes & Banter', icon: '🤭', count: counts.banter },
      { id: 'comfort', label: 'Comfort & Sukoon', icon: '🫂', count: counts.comfort },
      { id: 'custom', label: 'Custom Added', icon: '✏️', count: counts.custom },
    ];
  }, [moments]);

  // Filtered moments list
  const filteredMoments = useMemo(() => {
    return moments.filter((m) => {
      // Category filter
      if (selectedCategory === 'favorite' && !m.isFavorite) return false;
      if (selectedCategory === 'custom' && !m.isCustom) return false;
      if (
        selectedCategory !== 'all' &&
        selectedCategory !== 'favorite' &&
        selectedCategory !== 'custom' &&
        m.category !== selectedCategory
      ) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = m.title.toLowerCase().includes(q);
        const inDesc = (m.description || '').toLowerCase().includes(q);
        const inQuote = (m.quote?.text || '').toLowerCase().includes(q);
        const inTags = (m.tags || []).some((t) => t.toLowerCase().includes(q));
        const inDate = m.date.includes(q);
        if (!inTitle && !inDesc && !inQuote && !inTags && !inDate) return false;
      }

      return true;
    });
  }, [moments, selectedCategory, searchQuery]);

  // Current featured moment
  const featuredMoment = useMemo(() => {
    if (moments.length === 0) return null;
    return moments[featuredIndex % moments.length];
  }, [moments, featuredIndex]);

  const handleShuffleFeatured = () => {
    if (moments.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * moments.length);
    if (nextIdx === featuredIndex) {
      nextIdx = (nextIdx + 1) % moments.length;
    }
    setFeaturedIndex(nextIdx);
  };

  const handleToggleFavorite = (moment: Moment, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: Moment = {
      ...moment,
      isFavorite: !moment.isFavorite,
    };
    onSaveMoment(updated);
  };

  const handleCopyKeepsake = (moment: Moment, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = [
      `✨ Nila & Farhan Archive Keepsake ✨`,
      `📅 Date: ${moment.date}`,
      `🌟 Moment: ${moment.title}`,
      moment.quote ? `💬 ${moment.quote.sender === 'NILU' ? 'Nila' : 'Farhan'}: "${moment.quote.text}"` : '',
      moment.description ? `📖 Context: ${moment.description}` : '',
      moment.statsSnippet
        ? `📊 Activity: ${moment.statsSnippet.totalMessages?.toLocaleString() || 0} messages • ${
            moment.statsSnippet.audioNotes || 0
          } voice notes • ${moment.statsSnippet.calls || 0} calls`
        : '',
      `Archive Record: https://localhost:3001/`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopiedId(moment.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const newMoment: Moment = {
      id: `custom_${Date.now()}`,
      date: newDate,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      category: newCategory,
      icon: newIcon,
      tags: newTags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
      isCustom: true,
      quote: newQuoteText.trim()
        ? {
            text: newQuoteText.trim(),
            sender: newQuoteSender,
          }
        : undefined,
    };

    onSaveMoment(newMoment);
    setNewTitle('');
    setNewDesc('');
    setNewQuoteText('');
    setIsCreating(false);
  };

  const getMomentIcon = (iconName?: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'heart':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'moon':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'trophy':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'mic':
        return <Mic className="w-4 h-4 text-emerald-400" />;
      case 'smile':
        return <Smile className="w-4 h-4 text-sky-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const getCategoryBadge = (cat?: MomentCategory) => {
    switch (cat) {
      case 'milestone':
        return { label: 'Milestone', color: 'text-amber-300 bg-amber-500/10 border-amber-500/30' };
      case 'late-night':
        return { label: 'Late-Night', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30' };
      case 'audio':
        return { label: 'Voice Notes', color: 'text-teal-300 bg-teal-500/10 border-teal-500/30' };
      case 'love':
        return { label: 'Love & Devotion', color: 'text-rose-300 bg-rose-500/10 border-rose-500/30' };
      case 'banter':
        return { label: 'Playful Banter', color: 'text-sky-300 bg-sky-500/10 border-sky-500/30' };
      case 'comfort':
        return { label: 'Sukoon & Care', color: 'text-pink-300 bg-pink-500/10 border-pink-500/30' };
      default:
        return { label: 'Memory', color: 'text-purple-300 bg-purple-500/10 border-purple-500/30' };
    }
  };

  // Group moments by Month for the Timeline View
  const groupedByMonth = useMemo(() => {
    const groups: { monthKey: string; monthLabel: string; items: Moment[] }[] = [];
    const map = new Map<string, Moment[]>();

    filteredMoments.forEach((m) => {
      const ym = m.date.slice(0, 7); // e.g. "2026-09"
      if (!map.has(ym)) map.set(ym, []);
      map.get(ym)!.push(m);
    });

    const monthNames: Record<string, string> = {
      '2026-10': 'October 2026 • The Horizon',
      '2026-09': 'September 2026 • Climax & Uncensored Heat',
      '2026-08': 'August 2026 • Passion & 85 Voice Notes Peak',
      '2026-07': 'July 2026 • Genesis & First Marathons',
    };

    // Sort months descending
    Array.from(map.keys())
      .sort((a, b) => b.localeCompare(a))
      .forEach((ym) => {
        groups.push({
          monthKey: ym,
          monthLabel: monthNames[ym] || ym,
          items: map.get(ym)!.sort((a, b) => b.date.localeCompare(a.date)),
        });
      });

    return groups;
  }, [filteredMoments]);

  const totalFavorites = useMemo(() => moments.filter((m) => m.isFavorite).length, [moments]);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Top Banner / Hero Capsule */}
      {featuredMoment && (
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/80 via-rose-950/70 to-[#0b0d10] border border-rose-500/30 shadow-2xl">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>FEATURED MEMORY CAPSULE</span>
                </span>
                <span className="text-xs font-mono text-[#8b949e] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{featuredMoment.date}</span>
                </span>
                {featuredMoment.category && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      getCategoryBadge(featuredMoment.category).color
                    }`}
                  >
                    {getCategoryBadge(featuredMoment.category).label}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-editorial text-white font-bold tracking-tight">
                {featuredMoment.title}
              </h1>

              {featuredMoment.description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {featuredMoment.description}
                </p>
              )}

              {/* Quote Capsule */}
              {featuredMoment.quote && (
                <div className="p-3.5 rounded-2xl bg-[#0b0d10]/90 border border-rose-500/20 max-w-xl shadow-inner">
                  <div className="text-xs font-mono italic text-slate-200">
                    <strong
                      className={
                        featuredMoment.quote.sender === 'NILU'
                          ? 'text-rose-400 not-italic mr-1.5 font-bold'
                          : 'text-sky-400 not-italic mr-1.5 font-bold'
                      }
                    >
                      {featuredMoment.quote.sender === 'NILU' ? 'Nila:' : 'Farhan:'}
                    </strong>
                    "{featuredMoment.quote.text}"
                  </div>
                  {featuredMoment.quote.time && (
                    <span className="text-[10px] font-mono text-[#8b949e] block mt-1">
                      Recorded at {featuredMoment.quote.time}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 shrink-0">
              <button
                onClick={() => onSelectMoment(featuredMoment.date, featuredMoment.messageId)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-rose-950/40 active:scale-95"
              >
                <span>Jump to Dialogue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShuffleFeatured}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-amber-300 transition-colors"
                  title="Shuffle to another memorable moment"
                >
                  <Dices className="w-3.5 h-3.5 text-amber-400" />
                  <span>Shuffle 🎲</span>
                </button>

                <button
                  onClick={(e) => handleToggleFavorite(featuredMoment, e)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    featuredMoment.isFavorite
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
                      : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:text-white'
                  }`}
                  title={featuredMoment.isFavorite ? 'Remove Star' : 'Star this Memory'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      featuredMoment.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#12161c] border border-[#21262d] flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8b949e]">
              Curated Moments
            </div>
            <div className="text-xl font-mono font-bold text-white">{moments.length} Landmark Days</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12161c] border border-[#21262d] flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8b949e]">
              Peak Climax Day
            </div>
            <div className="text-xl font-mono font-bold text-amber-300">2,096 Msgs</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12161c] border border-[#21262d] flex items-center gap-3">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8b949e]">
              Audio Record
            </div>
            <div className="text-xl font-mono font-bold text-teal-300">85 Voice Notes</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12161c] border border-[#21262d] flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8b949e]">
              Starred Moments
            </div>
            <div className="text-xl font-mono font-bold text-rose-300">{totalFavorites} Pinned</div>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Search, Category Pills, View Mode, Add Moment */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories, quotes, hashtags, dates..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#12161c] border border-[#21262d] text-xs font-mono text-white placeholder-[#8b949e] focus:outline-none focus:border-rose-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: View Switcher, Surprise Me, Add Moment */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#12161c] border border-[#21262d]">
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-[#1e2530] text-rose-400 font-semibold shadow-sm'
                    : 'text-[#8b949e] hover:text-white'
                }`}
                title="Timeline View"
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#1e2530] text-rose-400 font-semibold shadow-sm'
                    : 'text-[#8b949e] hover:text-white'
                }`}
                title="Scrapbook Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Surprise Me Modal Trigger */}
            <button
              onClick={() => setIsSurpriseOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-amber-500/30 text-amber-300 text-xs font-mono transition-all shadow-sm active:scale-95"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Surprise Me</span>
              <span>🎲</span>
            </button>

            {/* Add Moment Trigger */}
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-mono font-semibold transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Moment</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 border ${
                selectedCategory === cat.id
                  ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-sm font-semibold'
                  : 'bg-[#12161c] text-[#8b949e] border-[#21262d] hover:border-[#38414d] hover:text-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-60">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-6 rounded-3xl bg-[#12161c] border border-rose-500/40 shadow-2xl space-y-4 animate-fade-in relative"
        >
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="absolute top-5 right-5 text-[#8b949e] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-rose-400">✨</span>
            <h2 className="font-editorial text-lg text-white font-medium">
              Create New Landmark Moment
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Moment Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 3 AM rainy confession, The first video call..."
                className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={newDate}
                min="2026-07-06"
                max="2026-10-02"
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MomentCategory)}
                className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="milestone">🌟 Milestone</option>
                <option value="late-night">🌙 Late-Night & 3 AM</option>
                <option value="audio">🎙️ Voice Note Saga</option>
                <option value="love">❤️ Love & Devotion</option>
                <option value="banter">🤭 Playful Banter</option>
                <option value="comfort">🫂 Comfort & Sukoon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Icon Style
              </label>
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="sparkles">✨ Sparkles</option>
                <option value="heart">❤️ Heart</option>
                <option value="flame">🔥 Flame</option>
                <option value="moon">🌙 Moon</option>
                <option value="trophy">🏆 Trophy</option>
                <option value="mic">🎙️ Microphone</option>
                <option value="smile">😊 Smile</option>
              </select>
            </div>
          </div>

          {/* Optional Quote */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Iconic Dialogue Quote (Optional)
              </label>
              <input
                type="text"
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                placeholder="e.g. Tumi aso dekhai shob kisu ato shundor lage..."
                className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Sender
              </label>
              <select
                value={newQuoteSender}
                onChange={(e) => setNewQuoteSender(e.target.value as 'NILU' | 'farhannn')}
                className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="farhannn">Farhan</option>
                <option value="NILU">Nila</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">
              Description & Context
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Why this day was special, what was said, what emotions you felt..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-rose-500 resize-none font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="milestone, late-night, memory"
              className="w-full px-3 py-2 rounded-xl bg-[#0b0d10] border border-[#21262d] text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-xs font-mono text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-mono font-semibold text-white shadow-md active:scale-95"
            >
              Save Moment
            </button>
          </div>
        </form>
      )}

      {/* No Results Fallback */}
      {filteredMoments.length === 0 && (
        <div className="p-12 rounded-3xl bg-[#12161c] border border-[#21262d] text-center space-y-3">
          <Sparkles className="w-10 h-10 text-[#8b949e] mx-auto opacity-50" />
          <h3 className="text-lg font-editorial text-white">No landmark moments found</h3>
          <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
            Try adjusting your search query or switching to "All Moments" to see the full timeline.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-[#161b22] border border-[#21262d] text-xs font-mono text-rose-300 hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* VIEW MODE 1: CHRONOLOGICAL TIMELINE VIEW */}
      {viewMode === 'timeline' && filteredMoments.length > 0 && (
        <div className="space-y-10">
          {groupedByMonth.map((group) => (
            <div key={group.monthKey} className="space-y-6">
              {/* Month Section Header */}
              <div className="sticky top-0 z-20 py-2 bg-[#0b0d10]/90 backdrop-blur-md flex items-center gap-3">
                <div className="h-px bg-gradient-to-r from-rose-500/50 via-[#30363d] to-transparent flex-1" />
                <span className="text-xs font-mono uppercase tracking-widest text-rose-300 font-semibold px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 shadow-sm">
                  {group.monthLabel}
                </span>
                <div className="h-px bg-gradient-to-l from-rose-500/50 via-[#30363d] to-transparent flex-1" />
              </div>

              {/* Connected Vertical Timeline */}
              <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-[19px] sm:before:left-[35px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-rose-500/40 before:via-purple-500/40 before:to-sky-500/40 before:rounded-full">
                {group.items.map((moment) => {
                  const badge = getCategoryBadge(moment.category);
                  const isCopied = copiedId === moment.id;

                  return (
                    <div key={moment.id} className="relative flex items-start gap-4 group">
                      {/* Timeline Node Icon */}
                      <div className="relative -ml-[25px] sm:-ml-[37px] w-9 h-9 rounded-xl bg-[#12161c] border-2 border-rose-500/60 shadow-lg shadow-rose-500/20 flex items-center justify-center shrink-0 z-10 group-hover:scale-110 group-hover:border-rose-400 transition-all">
                        {getMomentIcon(moment.icon)}
                      </div>

                      {/* Moment Card */}
                      <div
                        onClick={() => onSelectMoment(moment.date, moment.messageId)}
                        className={`flex-1 p-5 rounded-2xl cursor-pointer transition-all border relative overflow-hidden group/card ${
                          moment.isFavorite
                            ? 'bg-gradient-to-r from-[#17131a] to-[#12161c] border-amber-500/30 hover:border-amber-500/60 shadow-md'
                            : 'bg-[#12161c] hover:bg-[#161b22] border-[#21262d] hover:border-rose-500/40 shadow-sm'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Card Top Header: Title, Category Badge, Date, Star */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${badge.color}`}
                              >
                                {badge.label}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-[#0b0d10] border border-[#21262d] px-2.5 py-0.5 rounded-full">
                                <Calendar className="w-3 h-3 text-rose-400" />
                                {moment.date}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              {/* Star Button */}
                              <button
                                onClick={(e) => handleToggleFavorite(moment, e)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  moment.isFavorite
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                    : 'bg-[#0b0d10] border-[#21262d] text-[#8b949e] hover:text-white'
                                }`}
                                title={moment.isFavorite ? 'Unstar' : 'Star this moment'}
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    moment.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                                  }`}
                                />
                              </button>

                              {/* Copy Keepsake Button */}
                              <button
                                onClick={(e) => handleCopyKeepsake(moment, e)}
                                className="p-1.5 rounded-lg bg-[#0b0d10] border border-[#21262d] text-[#8b949e] hover:text-white transition-colors"
                                title="Copy Keepsake snippet"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Delete button (custom only) */}
                              {moment.isCustom && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteMoment(moment.id);
                                  }}
                                  className="p-1.5 rounded-lg text-[#8b949e] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Delete custom moment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="font-editorial text-lg text-white font-medium group-hover/card:text-rose-200 transition-colors">
                            {moment.title}
                          </h3>

                          {/* Description */}
                          {moment.description && (
                            <p className="text-xs text-[#8b949e] leading-relaxed max-w-2xl font-sans">
                              {moment.description}
                            </p>
                          )}

                          {/* Iconic Quote Snippet */}
                          {moment.quote && (
                            <div className="p-3 rounded-xl bg-[#0b0d10]/95 border border-[#21262d] text-xs font-mono text-slate-300 italic shadow-inner">
                              <strong
                                className={
                                  moment.quote.sender === 'NILU'
                                    ? 'text-rose-400 not-italic mr-1.5 font-bold'
                                    : 'text-sky-400 not-italic mr-1.5 font-bold'
                                }
                              >
                                {moment.quote.sender === 'NILU' ? 'Nila:' : 'Farhan:'}
                              </strong>
                              "{moment.quote.text}"
                              {moment.quote.time && (
                                <span className="text-[10px] text-[#8b949e] not-italic ml-2 font-mono">
                                  • {moment.quote.time}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Stats Snippet Pill Bar */}
                          {moment.statsSnippet && (
                            <div className="flex items-center gap-3 text-[11px] font-mono text-[#8b949e] pt-1 flex-wrap">
                              {moment.statsSnippet.totalMessages !== undefined && (
                                <span className="flex items-center gap-1 text-slate-300">
                                  <MessageCircle className="w-3 h-3 text-purple-400" />
                                  <span>{moment.statsSnippet.totalMessages.toLocaleString()} msgs</span>
                                </span>
                              )}
                              {moment.statsSnippet.audioNotes !== undefined && moment.statsSnippet.audioNotes > 0 && (
                                <span className="flex items-center gap-1 text-teal-300">
                                  <Mic className="w-3 h-3" />
                                  <span>{moment.statsSnippet.audioNotes} audio</span>
                                </span>
                              )}
                              {moment.statsSnippet.calls !== undefined && moment.statsSnippet.calls > 0 && (
                                <span className="flex items-center gap-1 text-sky-300">
                                  <PhoneCall className="w-3 h-3" />
                                  <span>{moment.statsSnippet.calls} calls</span>
                                </span>
                              )}
                              {moment.statsSnippet.reels !== undefined && moment.statsSnippet.reels > 0 && (
                                <span className="flex items-center gap-1 text-pink-300">
                                  <Film className="w-3 h-3" />
                                  <span>{moment.statsSnippet.reels} reels</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Tags & Action Button Footer */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#21262d]/60">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {moment.tags?.map((tag) => (
                                <button
                                  key={tag}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchQuery(tag);
                                  }}
                                  className="text-[10px] font-mono text-[#8b949e] hover:text-white bg-[#0b0d10] px-2 py-0.5 rounded border border-[#21262d] transition-colors"
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => onSelectMoment(moment.date, moment.messageId)}
                              className="flex items-center gap-1.5 self-end sm:self-auto text-xs font-mono text-rose-300 hover:text-white group/btn"
                            >
                              <span>Explore Day</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 2: BENTO SCRAPBOOK GRID VIEW */}
      {viewMode === 'grid' && filteredMoments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMoments.map((moment) => {
            const badge = getCategoryBadge(moment.category);
            const isCopied = copiedId === moment.id;

            return (
              <div
                key={moment.id}
                onClick={() => onSelectMoment(moment.date, moment.messageId)}
                className={`p-5 rounded-3xl cursor-pointer transition-all border flex flex-col justify-between group relative overflow-hidden ${
                  moment.isFavorite
                    ? 'bg-gradient-to-br from-[#17131a] to-[#12161c] border-amber-500/40 hover:border-amber-400 shadow-lg'
                    : 'bg-[#12161c] hover:bg-[#161b22] border-[#21262d] hover:border-rose-500/40 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon, Date, Favorite */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#0b0d10] border border-[#21262d] flex items-center justify-center shrink-0">
                        {getMomentIcon(moment.icon)}
                      </div>
                      <span className="text-[11px] font-mono text-[#8b949e] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-rose-400" />
                        <span>{moment.date}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleFavorite(moment, e)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          moment.isFavorite
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-[#0b0d10] border-[#21262d] text-[#8b949e] hover:text-white'
                        }`}
                        title={moment.isFavorite ? 'Unstar' : 'Star this moment'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            moment.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>

                      <button
                        onClick={(e) => handleCopyKeepsake(moment, e)}
                        className="p-1.5 rounded-lg bg-[#0b0d10] border border-[#21262d] text-[#8b949e] hover:text-white transition-colors"
                        title="Copy Keepsake snippet"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Category Pill */}
                  <span
                    className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${badge.color}`}
                  >
                    {badge.label}
                  </span>

                  {/* Title */}
                  <h3 className="font-editorial text-base sm:text-lg text-white font-medium group-hover:text-rose-200 transition-colors line-clamp-2">
                    {moment.title}
                  </h3>

                  {/* Description */}
                  {moment.description && (
                    <p className="text-xs text-[#8b949e] leading-relaxed line-clamp-3 font-sans">
                      {moment.description}
                    </p>
                  )}

                  {/* Quote Snippet */}
                  {moment.quote && (
                    <div className="p-3 rounded-xl bg-[#0b0d10]/95 border border-[#21262d] text-xs font-mono text-slate-300 italic shadow-inner line-clamp-2">
                      <strong
                        className={
                          moment.quote.sender === 'NILU'
                            ? 'text-rose-400 not-italic mr-1'
                            : 'text-sky-400 not-italic mr-1'
                        }
                      >
                        {moment.quote.sender === 'NILU' ? 'Nila:' : 'Farhan:'}
                      </strong>
                      "{moment.quote.text}"
                    </div>
                  )}
                </div>

                {/* Footer: Stats & Explore Arrow */}
                <div className="pt-4 mt-4 border-t border-[#21262d] flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                  {moment.statsSnippet ? (
                    <span className="flex items-center gap-1 text-slate-300">
                      <MessageCircle className="w-3 h-3 text-purple-400" />
                      <span>{moment.statsSnippet.totalMessages?.toLocaleString()} msgs</span>
                    </span>
                  ) : (
                    <span>Archive Landmark</span>
                  )}

                  <span className="flex items-center gap-1 text-rose-300 group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Surprise Memory Generator Modal */}
      <SurpriseMemoryModal
        isOpen={isSurpriseOpen}
        onClose={() => setIsSurpriseOpen(false)}
        onJumpToMessage={(date, msgId) => {
          setIsSurpriseOpen(false);
          onSelectMoment(date, msgId);
        }}
      />
    </div>
  );
};
