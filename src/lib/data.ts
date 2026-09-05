import {
  ArchiveMetadata,
  DailyStats,
  Message,
  SearchItem,
  MediaRecord,
  ExpressionEntry,
  NicknameEntry,
  Moment,
} from '../types/archive';

const dayCache = new Map<string, Message[]>();
let metadataCache: ArchiveMetadata | null = null;
let dailyStatsCache: DailyStats[] | null = null;
let searchIndexCache: SearchItem[] | null = null;
let mediaIndexCache: MediaRecord[] | null = null;
let expressionsCache: ExpressionEntry[] | null = null;
let nicknamesCache: NicknameEntry[] | null = null;

export async function fetchMetadata(): Promise<ArchiveMetadata> {
  if (metadataCache) return metadataCache;
  const res = await fetch('/data/archive_metadata.json');
  if (!res.ok) throw new Error('Failed to load archive metadata');
  metadataCache = await res.json();
  return metadataCache!;
}

export async function fetchDailyStats(): Promise<DailyStats[]> {
  if (dailyStatsCache) return dailyStatsCache;
  const res = await fetch('/data/daily_stats.json');
  if (!res.ok) throw new Error('Failed to load daily stats');
  dailyStatsCache = await res.json();
  return dailyStatsCache!;
}

export async function fetchDayConversation(date: string): Promise<Message[]> {
  if (dayCache.has(date)) {
    return dayCache.get(date)!;
  }
  const res = await fetch(`/data/days/${date}.json`);
  if (!res.ok) {
    throw new Error(`Conversation data for ${date} not found`);
  }
  const data: Message[] = await res.json();
  dayCache.set(date, data);
  return data;
}

export async function fetchSearchIndex(): Promise<SearchItem[]> {
  if (searchIndexCache) return searchIndexCache;
  const res = await fetch('/data/search_index.json');
  if (!res.ok) throw new Error('Failed to load search index');
  searchIndexCache = await res.json();
  return searchIndexCache!;
}

export async function fetchMediaIndex(): Promise<MediaRecord[]> {
  if (mediaIndexCache) return mediaIndexCache;
  const res = await fetch('/data/media_index.json');
  if (!res.ok) throw new Error('Failed to load media index');
  mediaIndexCache = await res.json();
  return mediaIndexCache!;
}

export async function fetchExpressions(): Promise<ExpressionEntry[]> {
  if (expressionsCache) return expressionsCache;
  const res = await fetch('/data/expressions.json');
  if (!res.ok) throw new Error('Failed to load expressions');
  expressionsCache = await res.json();
  return expressionsCache!;
}

export async function fetchNicknames(): Promise<NicknameEntry[]> {
  if (nicknamesCache) return nicknamesCache;
  const res = await fetch('/data/nicknames.json');
  if (!res.ok) throw new Error('Failed to load nicknames');
  nicknamesCache = await res.json();
  return nicknamesCache!;
}

// Initial Curated Moments
export const DEFAULT_MOMENTS: Moment[] = [
  {
    id: 'm1',
    date: '2026-07-06',
    title: 'Archive Genesis',
    description: 'First recorded message in the archive at 6:37 PM.',
    icon: 'sparkles',
    tags: ['milestone', 'beginning'],
  },
  {
    id: 'm2',
    date: '2026-07-13',
    title: 'First 1,400+ Message Marathon',
    description: '1,431 messages exchanged with intense activity late into the night.',
    icon: 'flame',
    tags: ['marathon', 'active'],
  },
  {
    id: 'm3',
    date: '2026-08-02',
    title: 'August Peak Activity',
    description: '1,529 messages with 54 shared reels and 82 reactions.',
    icon: 'heart',
    tags: ['peak', 'shares'],
  },
  {
    id: 'm4',
    date: '2026-08-10',
    title: 'Late Night Discussions',
    description: '1,403 messages spanning morning till 2:40 AM.',
    icon: 'moon',
    tags: ['night-talks'],
  },
  {
    id: 'm5',
    date: '2026-09-04',
    title: 'Archive Climax',
    description: '1,885 messages in a single day — the highest activity recorded.',
    icon: 'trophy',
    tags: ['record', 'finale'],
  },
];
