import React, { useState, useEffect, useMemo } from 'react';
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
  const [senderFilter, setSenderFilter] = useState<'all' | 'NILU' | 'farhannn'>('all');
  const [displayCount, setDisplayCount] = useState(40);
  const [selectedPhoto, setSelectedPhoto] = useState<MediaRecord | null>(null);
  const [photoLayout, setPhotoLayout] = useState<'grid' | 'polaroid'>('polaroid');
  const [isScrapbookOpen, setIsScrapbookOpen] = useState(false);
  const [onlyKeepsakes, setOnlyKeepsakes] = useState(false);

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

  const filteredMedia = useMemo(() => {
    return mediaRecords.filter((m) => {
      if (activeTab !== 'all' && m.type !== activeTab) return false;
      if (senderFilter !== 'all' && m.sender !== senderFilter) return false;
      if (activeTab === 'audio' && onlyKeepsakes && (!m.uri || !isBookmarked(m.uri))) return false;
      return true;
    });
  }, [mediaRecords, activeTab, senderFilter, onlyKeepsakes, isBookmarked]);

  const validPhotos = useMemo(() => {
    return mediaRecords.filter((m) => m.type === 'photo' && m.uri);
  }, [mediaRecords]);

  const displayedList = useMemo(() => {
    return filteredMedia.slice(0, displayCount);
  }, [filteredMedia, displayCount]);

  // Play all voice notes continuously in a playlist queue
  const handlePlayAllVoiceNotes = () => {
    const voiceNotes = filteredMedia
      .filter((m) => m.type === 'audio' && m.uri)
      .map((m) => ({
        uri: resolveDataUrl(m.uri!),
        senderDisplay: m.sender === 'NILU' ? ('NILA' as const) : ('FARHAN' as const),
        filename: m.filename,
        date: m.date,
        time: m.time,
        messageId: m.messageId,
      }));

    if (voiceNotes.length > 0) {
      playTrack(voiceNotes[0], voiceNotes);
    }
  };

  const polaroidRotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0'];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-editorial text-white tracking-tight">
            Shared Media & Reels Vault
          </h2>
          <p className="text-xs text-[#8b949e]">
            Explore shared Instagram reels, posts, voice notes, photos, and links exchanged across the archive.
          </p>
        </div>

        {/* Dynamic Context Action: Play All Voice Notes + Keepsakes Filter */}
        {activeTab === 'audio' && (
          <div className="flex items-center gap-2 shrink-0">
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
          </div>
        )}

        {/* Dynamic Context Action: Photo Layout Switcher + Scrapbook Studio */}
        {activeTab === 'photo' && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsScrapbookOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition-all"
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
          </div>
        )}
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
                setDisplayCount(40);
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

      {/* Filter Bar: Sender filter + Count */}
      <div className="flex items-center justify-between text-xs bg-[#12161c] p-3 rounded-xl border border-[#21262d]">
        <div className="flex items-center gap-2">
          <span className="text-[#8b949e] font-mono">Sender:</span>
          <div className="flex items-center gap-1 bg-[#0b0d10] p-0.5 rounded-lg border border-[#21262d]">
            {(['all', 'NILU', 'farhannn'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSenderFilter(s)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  senderFilter === s
                    ? 'bg-rose-500 text-white font-medium'
                    : 'text-[#8b949e] hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s === 'NILU' ? 'NILA' : 'FARHAN'}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#8b949e]">
          Showing {displayedList.length} of {filteredMedia.length.toLocaleString()} items
        </div>
      </div>

      {/* Media Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <p className="text-xs font-mono">Loading media records...</p>
        </div>
      ) : activeTab === 'photo' && photoLayout === 'polaroid' ? (
        /* VINTAGE POLAROID PHOTO GALLERY */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 pt-4">
          {displayedList.map((item, idx) => {
            const rot = polaroidRotations[idx % polaroidRotations.length];
            const isNila = item.sender === 'NILU';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className={`polaroid-card p-3 pb-5 rounded-sm cursor-pointer ${rot} group transition-all`}
              >
                {/* Polaroid Square Image Box */}
                <div className="relative aspect-square overflow-hidden bg-black/10 rounded-sm mb-3">
                  <img
                    src={item.uri}
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
                      isNila ? 'text-rose-600' : 'text-sky-700'
                    }`}
                  >
                    by {isNila ? 'NILA' : 'FARHAN'}
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
            const isNila = item.sender === 'NILU';

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#12161c] border border-[#21262d] hover:border-[#30363d] transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  {/* Top line: Sender & Time */}
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold font-mono ${
                        isNila ? 'text-rose-400' : 'text-sky-400'
                      }`}
                    >
                      {isNila ? 'NILA' : 'FARHAN'}
                    </span>
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
                        senderDisplay={isNila ? 'NILA' : 'FARHAN'}
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
                    <p className="text-xs text-[#f0f6fc] italic line-clamp-2">
                      "{item.caption}"
                    </p>
                  ) : item.filename ? (
                    <p className="text-xs font-mono text-slate-300 truncate">
                      {item.filename}
                    </p>
                  ) : (
                    <p className="text-xs text-[#8b949e] italic">
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

      {/* Load More Button */}
      {displayedList.length < filteredMedia.length && (
        <div className="pt-4 flex justify-center">
          <button
            onClick={() => setDisplayCount((prev) => prev + 40)}
            className="px-6 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-white transition-colors"
          >
            Load More (+40 items)
          </button>
        </div>
      )}

      {/* Fullscreen Photo Lightbox */}
      {selectedPhoto && selectedPhoto.uri && (
        <PhotoLightbox
          src={resolveDataUrl(selectedPhoto.uri)}
          filename={selectedPhoto.filename}
          senderDisplay={selectedPhoto.sender === 'NILU' ? 'NILA' : 'FARHAN'}
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
