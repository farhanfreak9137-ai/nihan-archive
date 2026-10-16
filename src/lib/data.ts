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
import { VaultData } from '../types/vault';

const dayCache = new Map<string, Message[]>();
let metadataCache: ArchiveMetadata | null = null;
let dailyStatsCache: DailyStats[] | null = null;
let searchIndexCache: SearchItem[] | null = null;
let mediaIndexCache: MediaRecord[] | null = null;
let expressionsCache: ExpressionEntry[] | null = null;
let nicknamesCache: NicknameEntry[] | null = null;
let vaultCache: VaultData | null = null;

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

export async function fetchIntimateVaultData(): Promise<VaultData> {
  if (vaultCache) return vaultCache;
  const res = await fetch(resolveDataUrl('data/intimate_vault.json'));
  if (!res.ok) throw new Error('Failed to load intimate vault data');
  vaultCache = await res.json();
  return vaultCache!;
}

// Curated Landmark Moments & Memory Lane for Nihan & Sumaiya
export const DEFAULT_MOMENTS: Moment[] = [
  {
    id: 'm1',
    date: '2026-09-26',
    title: 'Archive Genesis & First Words',
    description: 'The very first recorded interaction between Nihan and Sumaiya in the digital archive. Starting tentatively with sweet compliments.',
    icon: 'sparkles',
    category: 'milestone',
    tags: ['genesis', 'beginning', 'first-words'],
    quote: {
      text: 'Looks cute ✨',
      sender: 'NIHAN',
      time: '7:17 PM',
    },
    statsSnippet: {
      totalMessages: 4,
      audioNotes: 0,
      calls: 0,
      reels: 0,
    },
    isFavorite: true,
  },
  {
    id: 'm2',
    date: '2026-09-29',
    title: 'Penguin Walk & Playful Banter',
    description: 'Playful teasing that planted the seed for their most famous inside joke: the penguin walk.',
    icon: 'smile',
    category: 'banter',
    tags: ['penguin', 'banter', 'playful'],
    quote: {
      text: 'Mone hoi penguin hatse',
      sender: 'NIHAN',
      time: '7:48 PM',
    },
    statsSnippet: {
      totalMessages: 271,
      audioNotes: 0,
      calls: 0,
      reels: 4,
    },
  },
  {
    id: 'm3',
    date: '2026-10-02',
    title: 'October Gateway & 348 Messages',
    description: 'Entering early October with deep conversations, sharing pictures, and exchanging voice notes late into the night.',
    icon: 'moon',
    category: 'late-night',
    tags: ['october', 'late-night', 'connection'],
    quote: {
      text: 'Tomer ta ar amer ta aksatha',
      sender: 'NIHAN',
      time: '10:14 PM',
    },
    statsSnippet: {
      totalMessages: 348,
      audioNotes: 4,
      calls: 0,
      reels: 12,
    },
    isFavorite: true,
  },
  {
    id: 'm4',
    date: '2026-10-06',
    title: 'Aesthetic Snaps & Visual Diary',
    description: 'A lively autumn afternoon exchanging candid snapshots, laughter, and outfit opinions.',
    icon: 'sparkles',
    category: 'comfort',
    tags: ['snaps', 'candid', 'aesthetic'],
    quote: {
      text: 'Ata candid but kharap aseni',
      sender: 'NIHAN',
      time: '5:20 PM',
    },
    statsSnippet: {
      totalMessages: 344,
      audioNotes: 4,
      calls: 0,
      reels: 15,
    },
  },
  {
    id: 'm5',
    date: '2026-10-07',
    title: 'The 37-Photo Marathon Climax',
    description: 'A record-breaking day for visual memories: 37 photos, 5 voice notes, and nearly 500 messages exchanged in one day.',
    icon: 'flame',
    category: 'milestone',
    tags: ['photos-record', 'marathon', 'visual-vault'],
    quote: {
      text: 'Are thakben becha amer dwa ase',
      sender: 'NIHAN',
      time: '6:45 PM',
    },
    statsSnippet: {
      totalMessages: 499,
      audioNotes: 5,
      calls: 0,
      reels: 28,
    },
    isFavorite: true,
  },
  {
    id: 'm6',
    date: '2026-10-11',
    title: 'The Landmark & Bauni Nickname Coronation',
    description: 'The undisputed all-time volume peak of the archive! 672 messages, 8 voice notes, and 10 calls where Sumaiya crowned Nihan "Historical landmark" and Nihan crowned Sumaiya "bauni".',
    icon: 'trophy',
    category: 'milestone',
    tags: ['all-time-peak', 'historical-landmark', 'bauni', '672-messages'],
    quote: {
      text: 'june_4003 set your nickname to Historical landmark😍.',
      sender: 'SUMAIYA',
      time: '6:51 PM',
    },
    statsSnippet: {
      totalMessages: 672,
      audioNotes: 8,
      calls: 10,
      reels: 42,
    },
    isFavorite: true,
  },
  {
    id: 'm7',
    date: '2026-10-13',
    title: 'The Penguin 🎀 Inside Joke Forever',
    description: 'Formalizing the iconic nickname: "penguin 🎀" officially set on Instagram, followed by warm laughter and banter.',
    icon: 'heart',
    category: 'love',
    tags: ['penguin', 'inside-joke', 'affection'],
    quote: {
      text: 'Acca amer penguin i joss',
      sender: 'NIHAN',
      time: '10:23 PM',
    },
    statsSnippet: {
      totalMessages: 217,
      audioNotes: 2,
      calls: 0,
      reels: 18,
    },
    isFavorite: true,
  },
  {
    id: 'm8',
    date: '2026-10-14',
    title: 'Girlfriend Banter & Black Coffee',
    description: 'A high-chemistry exchange with playful mock protests and coffee talks. "Lagle to alhamdulillah🙏🏻".',
    icon: 'smile',
    category: 'banter',
    tags: ['coffee', 'girlfriend-banter', 'sweet'],
    quote: {
      text: 'Girlfriend lagi naki ami tomar😭😭😭',
      sender: 'SUMAIYA',
      time: '7:02 PM',
    },
    statsSnippet: {
      totalMessages: 372,
      audioNotes: 1,
      calls: 0,
      reels: 21,
    },
    isFavorite: true,
  },
  {
    id: 'm9',
    date: '2026-10-15',
    title: 'The Real-Life Confession (Sumaiya)',
    description: 'Playfully listing top fictional video game heroines before proudly concluding that real-life Sumaiya tops them all.',
    icon: 'heart',
    category: 'love',
    tags: ['real-life', 'confession', 'devotion'],
    quote: {
      text: 'Real life (Sumaiya)👉🏻👈🏻🌚',
      sender: 'NIHAN',
      time: '8:10 PM',
    },
    statsSnippet: {
      totalMessages: 185,
      audioNotes: 0,
      calls: 0,
      reels: 9,
    },
    isFavorite: true,
  },
];
