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

export function resolveDataUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || './';
  if (base.endsWith('/')) {
    return `${base}${cleanPath}`;
  }
  return `${base}/${cleanPath}`;
}

export async function fetchMetadata(): Promise<ArchiveMetadata> {
  if (metadataCache) return metadataCache;
  const res = await fetch(resolveDataUrl('data/archive_metadata.json'));
  if (!res.ok) throw new Error('Failed to load archive metadata');
  metadataCache = await res.json();
  return metadataCache!;
}

export async function fetchDailyStats(): Promise<DailyStats[]> {
  if (dailyStatsCache) return dailyStatsCache;
  const res = await fetch(resolveDataUrl('data/daily_stats.json'));
  if (!res.ok) throw new Error('Failed to load daily stats');
  dailyStatsCache = await res.json();
  return dailyStatsCache!;
}

export async function fetchDayConversation(date: string): Promise<Message[]> {
  if (dayCache.has(date)) {
    return dayCache.get(date)!;
  }
  const res = await fetch(resolveDataUrl(`data/days/${date}.json`));
  if (!res.ok) {
    throw new Error(`Conversation data for ${date} not found`);
  }
  const data: Message[] = await res.json();
  dayCache.set(date, data);
  return data;
}

export async function fetchSearchIndex(): Promise<SearchItem[]> {
  if (searchIndexCache) return searchIndexCache;
  const res = await fetch(resolveDataUrl('data/search_index.json'));
  if (!res.ok) throw new Error('Failed to load search index');
  searchIndexCache = await res.json();
  return searchIndexCache!;
}

export async function fetchMediaIndex(): Promise<MediaRecord[]> {
  if (mediaIndexCache) return mediaIndexCache;
  const res = await fetch(resolveDataUrl('data/media_index.json'));
  if (!res.ok) throw new Error('Failed to load media index');
  mediaIndexCache = await res.json();
  return mediaIndexCache!;
}

export async function fetchExpressions(): Promise<ExpressionEntry[]> {
  if (expressionsCache) return expressionsCache;
  const res = await fetch(resolveDataUrl('data/expressions.json'));
  if (!res.ok) throw new Error('Failed to load expressions');
  expressionsCache = await res.json();
  return expressionsCache!;
}

export async function fetchNicknames(): Promise<NicknameEntry[]> {
  if (nicknamesCache) return nicknamesCache;
  const res = await fetch(resolveDataUrl('data/nicknames.json'));
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
    title: 'First 1,700+ Message Marathon',
    description: '1,745 messages exchanged with intense activity late into the night.',
    icon: 'flame',
    tags: ['marathon', 'active'],
  },
  {
    id: 'm3',
    date: '2026-08-01',
    title: 'August 1,800+ Peak Opening',
    description: '1,827 messages with 85 voice notes and profound intimacy.',
    icon: 'heart',
    tags: ['peak', 'shares'],
  },
  {
    id: 'm4',
    date: '2026-08-16',
    title: 'Becoming One & Midnight Talks',
    description: 'Poetic midnight talks dreaming of holding each other close.',
    icon: 'moon',
    tags: ['night-talks'],
  },
  {
    id: 'm5',
    date: '2026-09-05',
    title: 'All-Time Record Climax',
    description: '2,096 messages in a single day — the single highest activity day recorded.',
    icon: 'trophy',
    tags: ['record', 'finale'],
  },
  {
    id: 'm6',
    date: '2026-09-29',
    title: 'Autumn Sukoon & Deep Bond',
    description: '1,114 messages, 7 calls, and tender confessions heading into October.',
    icon: 'sparkles',
    tags: ['autumn', 'recent'],
  },
];
