import React, { useState, useEffect, useMemo } from 'react';
import {
  Search as SearchIcon,
  Filter,
  User,
  ArrowRight,
  Film,
  Image as ImageIcon,
  Mic,
  PhoneCall,
  Loader2,
} from 'lucide-react';
import { SearchItem, SenderId, MessageType } from '../../types/archive';
import { fetchSearchIndex } from '../../lib/data';

interface SearchViewProps {
  onSelectResult: (date: string, messageId: string) => void;
  initialQuery?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onSelectResult,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [senderFilter, setSenderFilter] = useState<'ALL' | SenderId>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | MessageType | 'reel' | 'post' | 'story'>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  const [searchIndex, setSearchIndex] = useState<SearchItem[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(50);

  // Load search index on demand
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      try {
        setIsLoadingIndex(true);
        const index = await fetchSearchIndex();
        if (!isCancelled) {
          setSearchIndex(index);
        }
      } catch (err) {
        console.error('Failed to load search index:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingIndex(false);
        }
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Filtered results
  const results = useMemo(() => {
    if (!query.trim() && senderFilter === 'ALL' && typeFilter === 'ALL' && dateFilter === 'ALL') {
      return [];
    }

    const q = query.trim().toLowerCase();

    return searchIndex.filter((item) => {
      // Sender filter
      if (senderFilter !== 'ALL' && item.sender !== senderFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'ALL' && item.date !== dateFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'ALL') {
        if (typeFilter === 'reel' || typeFilter === 'post' || typeFilter === 'story') {
          if (item.shareType !== typeFilter) return false;
        } else if (item.type !== typeFilter) {
          return false;
        }
      }

      // Text query match
      if (q) {
        const inContent = item.content && item.content.toLowerCase().includes(q);
        const inShareText = item.shareText && item.shareText.toLowerCase().includes(q);
        if (!inContent && !inShareText) {
          return false;
        }
      }

      return true;
    });
  }, [searchIndex, query, senderFilter, typeFilter, dateFilter]);

  const displayedResults = useMemo(() => {
    return results.slice(0, displayLimit);
  }, [results, displayLimit]);

  // Highlight query snippet helper
  const renderHighlightedSnippet = (text: string, q: string) => {
    if (!q) return <span>{text}</span>;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;

    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + q.length + 60);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < text.length ? '...' : '';

    const matchPart = text.slice(idx, idx + q.length);
    const beforePart = text.slice(start, idx);
    const afterPart = text.slice(idx + q.length, end);

    return (
      <span>
        {prefix}
        {beforePart}
        <mark className="bg-rose-500/30 text-rose-200 px-0.5 rounded font-medium">
          {matchPart}
        </mark>
        {afterPart}
        {suffix}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-editorial text-white tracking-tight">
          Global Archive Search
        </h2>
        <p className="text-xs text-[#8b949e]">
          Search through {searchIndex.length > 0 ? `all ${searchIndex.length.toLocaleString()}` : 'all'} messages with real-time sender, date, and media filters.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <SearchIcon className="w-4 h-4 text-[#8b949e]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setDisplayLimit(50);
          }}
          placeholder="Search for words, phrases (e.g. sorry, I love you, baby, pagli, jaan)..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#12161c] border border-[#21262d] focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none text-sm text-white placeholder:text-[#484f58] transition-all shadow-sm"
          autoFocus
        />
        {isLoadingIndex && (
          <div className="absolute inset-y-0 right-3 flex items-center gap-2 text-xs text-[#8b949e]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
            <span>Indexing...</span>
          </div>
        )}
      </div>

      {/* Filter Chips Toolbar */}
      <div className="flex flex-wrap items-center gap-4 text-xs bg-[#12161c] p-3 rounded-xl border border-[#21262d]">
        {/* Sender Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#8b949e] flex items-center gap-1 font-mono">
            <User className="w-3 h-3 text-slate-400" />
            Sender:
          </span>
          <div className="flex items-center gap-1 bg-[#0b0d10] p-0.5 rounded-lg border border-[#21262d]">
            {(['ALL', 'NILU', 'farhannn'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSenderFilter(s)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  senderFilter === s
                    ? 'bg-rose-500 text-white font-medium'
                    : 'text-[#8b949e] hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'All' : s === 'NILU' ? 'NILA' : 'FARHAN'}
              </button>
            ))}
          </div>
        </div>

        {/* Message Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#8b949e] flex items-center gap-1 font-mono">
            <Filter className="w-3 h-3 text-slate-400" />
            Type:
          </span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-[#0b0d10] border border-[#21262d] rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="text">Text only</option>
            <option value="reel">Instagram Reels</option>
            <option value="post">Instagram Posts</option>
            <option value="story">Instagram Stories</option>
            <option value="photo">Photos</option>
            <option value="audio">Voice Notes</option>
            <option value="call">Calls</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#8b949e] font-mono">Date:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#0b0d10] border border-[#21262d] rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none font-mono"
          >
            <option value="ALL">All Dates (60 days)</option>
            {Array.from(new Set(searchIndex.map((s) => s.date)))
              .sort()
              .map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
          </select>
        </div>

        {/* Total Results Counter */}
        <div className="ml-auto text-[11px] font-mono text-[#8b949e]">
          {results.length.toLocaleString()} matching message(s)
        </div>
      </div>

      {/* Search Results List */}
      <div className="space-y-2">
        {displayedResults.map((item) => {
          const isNila = item.sender === 'NILU';

          return (
            <div
              key={item.id}
              onClick={() => onSelectResult(item.date, item.id)}
              className="p-3.5 rounded-xl bg-[#12161c] border border-[#21262d] hover:border-[#30363d] hover:bg-[#161b22] cursor-pointer transition-all flex items-start justify-between gap-4 group"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                {/* Result Metadata Header */}
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`font-semibold font-mono ${
                      isNila ? 'text-rose-400' : 'text-sky-400'
                    }`}
                  >
                    {isNila ? 'NILA' : 'FARHAN'}
                  </span>
                  <span className="text-[#30363d]">•</span>
                  <span className="text-[#8b949e] font-mono">{item.date}</span>
                  <span className="text-[#8b949e] font-mono text-[11px]">{item.time}</span>

                  {/* Type badge */}
                  {item.shareType ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <Film className="w-2.5 h-2.5" />
                      {item.shareType}
                    </span>
                  ) : item.type === 'photo' ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      <ImageIcon className="w-2.5 h-2.5" />
                      photo
                    </span>
                  ) : item.type === 'audio' ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      <Mic className="w-2.5 h-2.5" />
                      audio
                    </span>
                  ) : item.type === 'call' ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      <PhoneCall className="w-2.5 h-2.5" />
                      call
                    </span>
                  ) : null}
                </div>

                {/* Message Snippet */}
                <p className="text-xs text-[#f0f6fc] leading-relaxed break-words line-clamp-2">
                  {renderHighlightedSnippet(item.content || item.shareText || '', query)}
                </p>
              </div>

              {/* Jump Button */}
              <div className="shrink-0 pt-1 text-[#8b949e] group-hover:text-rose-400 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}

        {results.length > displayLimit && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayLimit((prev) => prev + 50)}
              className="px-4 py-2 rounded-xl bg-[#161b22] border border-[#21262d] hover:border-[#30363d] text-xs text-white font-mono transition-colors"
            >
              Load more results ({displayedResults.length} of {results.length.toLocaleString()})
            </button>
          </div>
        )}

        {results.length === 0 && !isLoadingIndex && query && (
          <div className="text-center py-12 text-[#8b949e] space-y-1">
            <p className="text-base text-white font-editorial">No results found</p>
            <p className="text-xs">
              No messages matched your query and active filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
