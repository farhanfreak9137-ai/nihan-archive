import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Film,
  Image as ImageIcon,
  Mic,
  FileText,
  ExternalLink,
  ArrowRight,
  Filter,
  Loader2,
  Play,
  Grid,
  Calendar,
  ArrowUpDown,
  ChevronsDown,
  ChevronsUp,
  Sparkles,
  Smartphone,
  User,
  Sun,
} from 'lucide-react';
import { MediaRecord } from '../../types/archive';
import { fetchMediaIndex, resolveDataUrl } from '../../lib/data';
import { VoiceNotePlayer } from '../ui/VoiceNotePlayer';
import { PhotoLightbox } from '../ui/PhotoLightbox';
import { ScrapbookCollageModal } from './ScrapbookCollageModal';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

interface MediaVaultViewProps {
  onSelectMedia: (date: string, messageId: string) => void;
}

export const MediaVaultView: React.FC<MediaVaultViewProps> = ({
  onSelectMedia,
}) => {
  const [mediaRecords, setMediaRecords] = useState<MediaRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'all' | 'reel' | 'post' | 'story' | 'photo' | 'video' | 'audio' | 'file'
  >('reel');
  const [senderFilter, setSenderFilter] = useState<'all' | 'SUMAIYA' | 'NIHAN'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [photoCategory, setPhotoCategory] = useState<'all' | 'screenshot' | 'portrait' | 'aesthetic' | 'memory'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [displayCount, setDisplayCount] = useState(60);
  const [selectedPhoto, setSelectedPhoto] = useState<MediaRecord | null>(null);
  const [photoLayout, setPhotoLayout] = useState<'grid' | 'polaroid'>('polaroid');
  const [isScrapbookOpen, setIsScrapbookOpen] = useState(false);
  const [onlyKeepsakes, setOnlyKeepsakes] = useState(false);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const { playTrack, bookmarkedUris, isBookmarked } = useAudioPlayer();

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchMediaIndex();
        if (!isCancelled) {
          setMediaRecords(data);
        }
      } catch (e) {
        console.error('Failed to load media index:', e);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Distinct dates for date dropdown
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    for (const m of mediaRecords) {
      if (m.date) dates.add(m.date);
    }
    return Array.from(dates).sort();
  }, [mediaRecords]);

  // Counts by media type
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: mediaRecords.length,
      reel: 0,
      post: 0,
      story: 0,
      photo: 0,
      video: 0,
      audio: 0,
      file: 0,
    };
    for (const m of mediaRecords) {
      if (c[m.type] !== undefined) {
        c[m.type]++;
      }
    }
    return c;
  }, [mediaRecords]);

  // Photo categories count
  const photoCategoryCounts = useMemo(() => {
    const pCounts = { all: 0, screenshot: 0, portrait: 0, aesthetic: 0, memory: 0 };
    for (const m of mediaRecords) {
      if (m.type === 'photo') {
        pCounts.all++;
        const cat = m.category || 'other';
        if (cat === 'screenshot') pCounts.screenshot++;
        else if (cat === 'portrait') pCounts.portrait++;
        else if (cat === 'aesthetic') pCounts.aesthetic++;
        else if (cat === 'memory') pCounts.memory++;
      }
    }
    return pCounts;
  }, [mediaRecords]);

  // Multi-tier filtering
  const filteredMedia = useMemo(() => {
    return mediaRecords
      .filter((m) => {
        if (activeTab !== 'all' && m.type !== activeTab) return false;
        if (senderFilter !== 'all' && m.sender !== senderFilter) return false;
        if (selectedMonth !== 'all' && !m.date.startsWith(selectedMonth)) return false;
        if (selectedDate !== 'all' && m.date !== selectedDate) return false;
        if (activeTab === 'audio' && onlyKeepsakes && (!m.uri || !isBookmarked(m.uri))) return false;
        if (activeTab === 'photo' && photoCategory !== 'all') {
          if (m.category !== photoCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.timestamp - a.timestamp;
        } else {
          return a.timestamp - b.timestamp;
        }
      });
  }, [mediaRecords, activeTab, senderFilter, selectedMonth, selectedDate, onlyKeepsakes, isBookmarked, photoCategory, sortOrder]);

  const validPhotos = useMemo(() => {
    return mediaRecords.filter((m) => m.type === 'photo' && m.uri);
  }, [mediaRecords]);

  const displayedList = useMemo(() => {
    return filteredMedia.slice(0, displayCount);
  }, [filteredMedia, displayCount]);

  const scrollToTop = () => {
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: main.scrollHeight, behavior: 'smooth' });
    else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handlePlayAllVoiceNotes = () => {
    const voiceNotes = filteredMedia
      .filter((m) => m.type === 'audio' && m.uri)
      .map((m) => ({
        uri: resolveDataUrl(m.uri!),
        senderDisplay: m.sender === 'SUMAIYA' ? ('SUMAIYA' as const) : ('NIHAN' as const),
        filename: m.filename,
        date: m.date,
        time: m.time,
        messageId: m.messageId,
      }));

    if (voiceNotes.length > 0) {
      playTrack(voiceNotes[0], voiceNotes);
    }
  };

  const polaroidRotations = [
    'sm:-rotate-1 rotate-0',
    'sm:rotate-1 rotate-0',
    'sm:-rotate-2 rotate-0',
    'sm:rotate-2 rotate-0',
    'rotate-0',
  ];

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'screenshot':
        return { label: 'Screenshot', icon: Smartphone, color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' };
      case 'portrait':
        return { label: 'Portrait / Selfie', icon: User, color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
      case 'aesthetic':
        return { label: 'Scenery / Aesthetic', icon: Sun, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
      case 'memory':
        return { label: 'Moment', icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
      default:
        return null;
    }
  };

  return (
    <div ref={contentContainerRef} className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 relative pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-editorial text-white tracking-tight flex items-center gap-2">
            <span>Shared Media & Reels Vault</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-mono border border-rose-500/20">
              {filteredMedia.length.toLocaleString()} items
            </span>
          </h2>
          <p className="text-xs text-[#8b949e]">
            Intelligent timeline browsing, photo category tags, voice note keepsakes, and fast scrubber.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'audio' && (
            <>
              <button
                onClick={() => setOnlyKeepsakes(!onlyKeepsakes)}
                className={`px-3 py-2 rounded-xl border text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                  onlyKeepsakes
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-[#12161c] border-[#21262d] text-[#8b949e] hover:text-white'
                }`}
              >
                <span>⭐</span>
                <span>Keepsakes ({bookmarkedUris.length})</span>
              </button>
              <button
                onClick={handlePlayAllVoiceNotes}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-mono font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Play All (Tape Mode)</span>
              </button>
            </>
          )}

          {activeTab === 'photo' && (
            <>
              <button
                onClick={() => setIsScrapbookOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition-all"
              >
                <span>📸</span>
                <span>Scrapbook Studio</span>
              </button>
              <div className="flex items-center gap-1 bg-[#12161c] p-1 rounded-xl border border-[#21262d] text-xs font-mono">
                <button
                  onClick={() => setPhotoLayout('polaroid')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    photoLayout === 'polaroid'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  <span>🎞️</span>
                  <span>Polaroid</span>
                </button>
                <button
                  onClick={() => setPhotoLayout('grid')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    photoLayout === 'grid'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
              </div>
            </>
          )}

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="px-3 py-2 rounded-xl bg-[#12161c] hover:bg-[#161b22] border border-[#21262d] text-xs font-mono text-[#8b949e] hover:text-white flex items-center gap-1.5 transition-colors"
            title={`Sort Order: ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-400" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Media Type Tabs */}
      <div className="flex items-center gap-2 border-b border-[#21262d] pb-2 overflow-x-auto text-xs font-mono">
        {[
          { id: 'reel', label: `Reels (${counts.reel || 0})`, icon: Film },
          { id: 'post', label: `Posts (${counts.post || 0})`, icon: Film },
          { id: 'story', label: `Stories (${counts.story || 0})`, icon: Film },
          { id: 'photo', label: `Photos (${counts.photo || 0})`, icon: ImageIcon },
          { id: 'video', label: `Videos (${counts.video || 0})`, icon: Film },
          { id: 'audio', label: `Voice Notes (${counts.audio || 0})`, icon: Mic },
          { id: 'file', label: `Files (${counts.file || 0})`, icon: FileText },
          { id: 'all', label: `All Media (${counts.all || 0})`, icon: Filter },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setDisplayCount(60);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium'
                  : 'text-[#8b949e] hover:text-white hover:bg-[#12161c]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* DATE CATEGORY & SMART FILTERS BAR */}
      <div className="space-y-3 bg-[#12161c] p-3.5 rounded-2xl border border-[#21262d]">
        {/* Tier 1: Month Categories & Date Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full">
            <span className="text-[#8b949e] font-mono flex items-center gap-1 mr-1 shrink-0 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>Timeline:</span>
            </span>
            {[
              { id: 'all', label: 'All Months' },
              { id: '2026-07', label: 'July 2026' },
              { id: '2026-08', label: 'August 2026' },
              { id: '2026-09', label: 'September 2026' },
              { id: '2026-10', label: 'October 2026' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMonth(m.id as any);
                  setSelectedDate('all');
                  setDisplayCount(60);
                }}
                className={`px-3 py-1 rounded-lg font-mono text-[11px] shrink-0 whitespace-nowrap transition-all ${
                  selectedMonth === m.id
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40 font-semibold'
                    : 'text-[#8b949e] hover:text-white bg-[#0b0d10] border border-[#21262d]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setDisplayCount(60);
              }}
              className="bg-[#0b0d10] border border-[#21262d] rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-rose-500/50 max-w-[200px] truncate"
            >
              <option value="all">Any Day ({availableDates.length} days)</option>
              {availableDates
                .filter((d) => selectedMonth === 'all' || d.startsWith(selectedMonth))
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>

            <div className="flex items-center gap-1 bg-[#0b0d10] p-0.5 rounded-lg border border-[#21262d]">
              {(['all', 'SUMAIYA', 'NIHAN'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSenderFilter(s);
                    setDisplayCount(60);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    senderFilter === s
                      ? 'bg-rose-500 text-white font-medium'
                      : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tier 2: INTELLIGENT PHOTO CATEGORIES */}
        {activeTab === 'photo' && (
          <div className="pt-2 border-t border-[#21262d] flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[#8b949e] font-mono flex items-center gap-1 mr-1 shrink-0 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Categories:</span>
            </span>
            {[
              { id: 'all', label: `All (${photoCategoryCounts.all})`, icon: ImageIcon },
              { id: 'screenshot', label: `Screenshots (${photoCategoryCounts.screenshot})`, icon: Smartphone },
              { id: 'portrait', label: `People & Selfies (${photoCategoryCounts.portrait})`, icon: User },
              { id: 'aesthetic', label: `Scenery (${photoCategoryCounts.aesthetic})`, icon: Sun },
              { id: 'memory', label: `Moments (${photoCategoryCounts.memory})`, icon: Sparkles },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setPhotoCategory(cat.id as any);
                    setDisplayCount(60);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-mono shrink-0 whitespace-nowrap transition-all ${
                    photoCategory === cat.id
                      ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-white border border-rose-500/40 font-semibold shadow-sm'
                      : 'text-[#8b949e] hover:text-white bg-[#0b0d10] border border-[#21262d]'
                  }`}
                >
                  <Icon className="w-3 h-3 text-rose-400" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tier 3: Clean Responsive Counter & Jump Controls */}
        <div className="pt-2 border-t border-[#21262d] flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#8b949e]">
            <span>
              Showing <strong className="text-white font-semibold">{displayedList.length}</strong> of{' '}
              <strong className="text-white font-semibold">{filteredMedia.length.toLocaleString()}</strong> items
            </span>
            {displayedList.length < filteredMedia.length && (
              <button
                onClick={() => setDisplayCount(filteredMedia.length)}
                className="text-rose-400 hover:text-rose-300 underline underline-offset-2 font-medium"
              >
                Show All
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollToTop}
              className="px-2.5 py-1 rounded-lg bg-[#0b0d10] hover:bg-[#161b22] border border-[#21262d] text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
              title="Scroll to Top"
            >
              <ChevronsUp className="w-3.5 h-3.5 text-rose-400" />
              <span>Top</span>
            </button>
            <button
              onClick={scrollToBottom}
              className="px-2.5 py-1 rounded-lg bg-[#0b0d10] hover:bg-[#161b22] border border-[#21262d] text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
              title="Scroll to Bottom"
            >
              <span>Bottom</span>
              <ChevronsDown className="w-3.5 h-3.5 text-rose-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Cards Display */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <p className="text-xs font-mono">Loading media records...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#8b949e] border border-dashed border-[#21262d] rounded-2xl">
          <p className="font-editorial text-lg text-white">No media found</p>
          <p className="text-xs mt-1">Try adjusting your timeline, date, or category filters.</p>
        </div>
      ) : activeTab === 'photo' && photoLayout === 'polaroid' ? (
        /* VINTAGE POLAROID PHOTO GALLERY */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 pt-3">
          {displayedList.map((item, idx) => {
            const rot = polaroidRotations[idx % polaroidRotations.length];
            const isSumaiya = item.sender === 'SUMAIYA';
            const badge = getCategoryBadge(item.category);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className={`polaroid-card p-3 pb-5 rounded-sm cursor-pointer ${rot} group transition-all relative`}
              >
                {/* Category Badge */}
                {badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-md flex items-center gap-1 ${badge.color}`}>
                      <badge.icon className="w-2.5 h-2.5" />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                )}

                {/* Polaroid Square Image Box */}
                <div className="relative aspect-square overflow-hidden bg-black/10 rounded-sm mb-3">
                  <img
                    src={resolveDataUrl(item.uri || '')}
                    alt={item.filename || 'Photo memory'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Handwritten Style Bottom Label */}
                <div className="px-1 text-center font-editorial">
                  <span className="text-xs font-semibold text-slate-900 block truncate">
                    {item.date}
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      isSumaiya ? 'text-rose-600' : 'text-sky-700'
                    }`}
                  >
                    by {isSumaiya ? 'SUMAIYA' : 'NIHAN'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STANDARD MEDIA GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedList.map((item) => {
            const isSumaiya = item.sender === 'SUMAIYA';
            const badge = item.type === 'photo' ? getCategoryBadge(item.category) : null;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#12161c] border border-[#21262d] hover:border-[#30363d] transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  {/* Top line: Sender, Badge & Time */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold font-mono ${
                          isSumaiya ? 'text-rose-400' : 'text-sky-400'
                        }`}
                      >
                        {isSumaiya ? 'SUMAIYA' : 'NIHAN'}
                      </span>
                      {badge && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${badge.color}`}>
                          <badge.icon className="w-2.5 h-2.5" />
                          <span>{badge.label}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[#8b949e]">
                      {item.date} • {item.time}
                    </span>
                  </div>

                  {/* Real Media Rendering based on type */}
                  {item.type === 'photo' && item.uri && (
                    <div
                      onClick={() => setSelectedPhoto(item)}
                      className="relative rounded-xl overflow-hidden border border-[#21262d] max-h-48 cursor-pointer group/img bg-[#0b0d10]"
                    >
                      <img
                        src={resolveDataUrl(item.uri)}
                        alt={item.filename || 'Photo'}
                        className="w-full h-44 object-cover rounded-xl group-hover/img:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-white">
                          View full size
                        </span>
                      </div>
                    </div>
                  )}

                  {item.type === 'audio' && item.uri && (
                    <div className="pt-1">
                      <VoiceNotePlayer
                        src={resolveDataUrl(item.uri)}
                        senderDisplay={isSumaiya ? 'SUMAIYA' : 'NIHAN'}
                        filename={item.filename}
                        date={item.date}
                        time={item.time}
                        messageId={item.messageId}
                      />
                    </div>
                  )}

                  {item.type === 'video' && item.uri && (
                    <div className="rounded-xl overflow-hidden border border-[#21262d] bg-[#0b0d10]">
                      <video
                        src={resolveDataUrl(item.uri)}
                        controls
                        preload="metadata"
                        className="w-full max-h-44 rounded-xl object-contain"
                      />
                    </div>
                  )}

                  {/* Caption / Title / Context */}
                  {item.caption ? (
                    <p className="text-xs text-[#f0f6fc] italic line-clamp-2 break-words">
                      "{item.caption}"
                    </p>
                  ) : item.filename ? (
                    <p className="text-xs font-mono text-slate-300 truncate">
                      {item.filename}
                    </p>
                  ) : (
                    <p className="text-xs text-[#8b949e] italic break-words">
                      {item.contextSnippet || 'Shared Instagram attachment'}
                    </p>
                  )}
                </div>

                {/* Card Actions: Open link & View in chat */}
                <div className="pt-2 border-t border-[#21262d] flex items-center justify-between text-xs">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8b949e] hover:text-white flex items-center gap-1 font-mono text-[11px] transition-colors"
                    >
                      <span>Open link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] font-mono text-[#8b949e] uppercase">
                      {item.type}
                    </span>
                  )}

                  <button
                    onClick={() => onSelectMedia(item.date, item.messageId)}
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-mono text-[11px] transition-colors"
                  >
                    <span>View in chat</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Bottom Actions */}
      {displayedList.length < filteredMedia.length && (
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setDisplayCount((prev) => Math.min(filteredMedia.length, prev + 60))}
            className="px-6 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-white transition-colors shadow-sm"
          >
            Load More (+60 items)
          </button>
          <button
            onClick={() => {
              setDisplayCount(filteredMedia.length);
              setTimeout(scrollToBottom, 50);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 border border-rose-500/40 text-xs font-mono text-rose-200 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
            <span>Show All ({filteredMedia.length.toLocaleString()})</span>
          </button>
        </div>
      )}

      {/* Fullscreen Photo Lightbox */}
      {selectedPhoto && selectedPhoto.uri && (
        <PhotoLightbox
          src={resolveDataUrl(selectedPhoto.uri)}
          filename={selectedPhoto.filename}
          senderDisplay={selectedPhoto.sender === 'SUMAIYA' ? 'SUMAIYA' : 'NIHAN'}
          date={selectedPhoto.date}
          time={selectedPhoto.time}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Polaroid Scrapbook Studio Modal */}
      <ScrapbookCollageModal
        isOpen={isScrapbookOpen}
        onClose={() => setIsScrapbookOpen(false)}
        photos={validPhotos}
        onSelectPhoto={onSelectMedia}
      />
    </div>
  );
};
