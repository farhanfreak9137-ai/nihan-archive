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
} from 'lucide-react';
import { MediaRecord } from '../../types/archive';
import { fetchMediaIndex } from '../../lib/data';
import { VoiceNotePlayer } from '../ui/VoiceNotePlayer';
import { PhotoLightbox } from '../ui/PhotoLightbox';

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
      return true;
    });
  }, [mediaRecords, activeTab, senderFilter]);

  const displayedList = useMemo(() => {
    return filteredMedia.slice(0, displayCount);
  }, [filteredMedia, displayCount]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-editorial text-white tracking-tight">
          Shared Media & Reels Vault
        </h2>
        <p className="text-xs text-[#8b949e]">
          Explore shared Instagram reels, posts, voice notes, photos, and links exchanged across the archive.
        </p>
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
      ) : (
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
                        src={item.uri}
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
                        src={item.uri}
                        senderDisplay={isNila ? 'NILA' : 'FARHAN'}
                        filename={item.filename}
                      />
                    </div>
                  )}

                  {item.type === 'video' && item.uri && (
                    <div className="rounded-xl overflow-hidden border border-[#21262d] bg-[#0b0d10]">
                      <video
                        src={item.uri}
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
                      className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-[11px]"
                    >
                      <span>Open Instagram</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-[#8b949e] font-mono">
                      {item.type}
                    </span>
                  )}

                  <button
                    onClick={() => onSelectMedia(item.date, item.messageId)}
                    className="flex items-center gap-1 text-[11px] font-mono text-[#8b949e] group-hover:text-rose-400 transition-colors"
                  >
                    <span>View in chat</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <PhotoLightbox
          src={selectedPhoto.uri || ''}
          filename={selectedPhoto.filename}
          senderDisplay={selectedPhoto.sender === 'NILU' ? 'NILA' : 'FARHAN'}
          date={selectedPhoto.date}
          time={selectedPhoto.time}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Pagination Load More */}
      {filteredMedia.length > displayCount && (
        <div className="text-center pt-6">
          <button
            onClick={() => setDisplayCount((prev) => prev + 40)}
            className="px-4 py-2 rounded-xl bg-[#161b22] border border-[#21262d] hover:border-[#30363d] text-xs text-white font-mono transition-colors"
          >
            Load more items ({displayedList.length} of {filteredMedia.length.toLocaleString()})
          </button>
        </div>
      )}
    </div>
  );
};
