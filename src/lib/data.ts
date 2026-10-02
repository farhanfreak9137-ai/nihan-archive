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

// Curated Landmark Moments & Memory Lane
export const DEFAULT_MOMENTS: Moment[] = [
  {
    id: 'm1',
    date: '2026-07-06',
    title: 'Archive Genesis & First Spark',
    description: 'The very first recorded interaction in the digital archive. Starting tentatively with gentle teasing before blossoming into deep affection.',
    icon: 'sparkles',
    category: 'milestone',
    tags: ['genesis', 'beginning', 'first-words'],
    quote: {
      text: 'Onk bhoy paisi 😧',
      sender: 'NILU',
      time: '6:37 PM',
    },
    statsSnippet: {
      totalMessages: 17,
      audioNotes: 0,
      calls: 0,
      reels: 0,
    },
    isFavorite: true,
  },
  {
    id: 'm2',
    date: '2026-07-13',
    title: 'First 1,700+ Message Marathon',
    description: 'The first true endurance conversation in the archive. 1,745 messages exchanged across 16 uninterrupted hours without running out of words.',
    icon: 'flame',
    category: 'milestone',
    tags: ['marathon', 'active', 'unbreakable'],
    quote: {
      text: 'valobashi tooooo... tumi chara kisu bujhi na',
      sender: 'farhannn',
      time: '6:21 PM',
    },
    statsSnippet: {
      totalMessages: 1745,
      audioNotes: 9,
      calls: 5,
      reels: 29,
    },
    isFavorite: true,
  },
  {
    id: 'm3',
    date: '2026-07-16',
    title: 'Midnight Vulnerability & Shared Secrets',
    description: 'An emotional evening of sharing private fears and dreams, concluding with gentle promises of protection and mutual trust.',
    icon: 'moon',
    category: 'comfort',
    tags: ['trust', 'vulnerability', 'comfort'],
    quote: {
      text: 'Tumi aso dekhai shob kisu ato shundor lage',
      sender: 'NILU',
      time: '11:42 PM',
    },
    statsSnippet: {
      totalMessages: 483,
      audioNotes: 0,
      calls: 0,
      reels: 27,
    },
  },
  {
    id: 'm4',
    date: '2026-07-28',
    title: 'The Voice Note Tapestry',
    description: 'A deeply musical and expressive day with 47 recorded voice notes. Whispering tender audio messages when text wasn’t enough.',
    icon: 'mic',
    category: 'audio',
    tags: ['voice-notes', 'whispers', 'audio'],
    quote: {
      text: 'Tomar gola shune mon ta shanto hoye gelo',
      sender: 'farhannn',
      time: '2:15 PM',
    },
    statsSnippet: {
      totalMessages: 929,
      audioNotes: 47,
      calls: 1,
      reels: 4,
    },
  },
  {
    id: 'm5',
    date: '2026-08-01',
    title: 'August Awakening & 85 Voice Notes Peak',
    description: 'The all-time audio record of the archive! An extraordinary 85 voice notes exchanged alongside 1,827 texts of pure warmth and laughter.',
    icon: 'mic',
    category: 'audio',
    tags: ['audio-record', '85-voice-notes', 'peak'],
    quote: {
      text: 'Aro audio pathao, tomar kotha shunte iccha kore',
      sender: 'NILU',
      time: '5:19 PM',
    },
    statsSnippet: {
      totalMessages: 1827,
      audioNotes: 85,
      calls: 3,
      reels: 15,
    },
    isFavorite: true,
  },
  {
    id: 'm6',
    date: '2026-08-09',
    title: 'Late-Night Bedroom & Outfit Banter',
    description: 'Playful discussions about sleeping in loose T-shirts, nightwear, and daydreaming of sharing the same cozy bed and blankets.',
    icon: 'moon',
    category: 'late-night',
    tags: ['bedroom', 'nightwear', 'cuddle'],
    quote: {
      text: 'Bed e gele tomar loose t-shirt ta pore thakbo',
      sender: 'farhannn',
      time: '1:12 AM',
    },
    statsSnippet: {
      totalMessages: 1387,
      audioNotes: 47,
      calls: 9,
      reels: 42,
    },
  },
  {
    id: 'm7',
    date: '2026-08-16',
    title: 'Becoming One & Midnight Soulmate Talks',
    description: 'A deeply poetic 3 AM dialogue feeling as though two distinct souls had fused into one synchronized heartbeat.',
    icon: 'heart',
    category: 'love',
    tags: ['soulmate', 'becoming-one', 'devotion'],
    quote: {
      text: 'Ami tomake onek valobashi... ar kauke emn vabe valobashi nai',
      sender: 'farhannn',
      time: '8:01 AM',
    },
    statsSnippet: {
      totalMessages: 1104,
      audioNotes: 7,
      calls: 11,
      reels: 8,
    },
  },
  {
    id: 'm8',
    date: '2026-08-18',
    title: 'The 3-Hour Dawn Intimacy',
    description: 'An unbroken 413-message late-night session starting at 2:22 AM and continuing past dawn, exploring raw mutual desire and tenderness.',
    icon: 'flame',
    category: 'late-night',
    tags: ['dawn', 'passion', 'unbroken'],
    quote: {
      text: 'Ghumaite vallagena ar ghumaile utthe vallagena, tomar sathe kotha bolbo',
      sender: 'NILU',
      time: '5:34 AM',
    },
    statsSnippet: {
      totalMessages: 1274,
      audioNotes: 30,
      calls: 8,
      reels: 40,
    },
  },
  {
    id: 'm9',
    date: '2026-08-20',
    title: 'French Kisses & Physical Yearning',
    description: 'Teasing fantasies of holding each other close, deep French kisses, neck biting, and laughing at their own playful stubbornness.',
    icon: 'heart',
    category: 'love',
    tags: ['kisses', 'physical', 'teasing'],
    quote: {
      text: 'Ador kore dibo... kintu bhalo hoye thakba',
      sender: 'farhannn',
      time: '7:12 PM',
    },
    statsSnippet: {
      totalMessages: 778,
      audioNotes: 4,
      calls: 0,
      reels: 26,
    },
  },
  {
    id: 'm10',
    date: '2026-09-05',
    title: 'The All-Time Record Climax: 2,096 Messages',
    description: 'The undisputed summit of the archive. The single most voluminous day in history with 2,096 messages, 68 reels, and 55 voice notes in 24 hours.',
    icon: 'trophy',
    category: 'milestone',
    tags: ['world-record', '2096-messages', 'historic-peak'],
    quote: {
      text: '2000 messages cross korlam ajke!! We are unstoppable',
      sender: 'farhannn',
      time: '11:58 PM',
    },
    statsSnippet: {
      totalMessages: 2096,
      audioNotes: 55,
      calls: 4,
      reels: 68,
    },
    isFavorite: true,
  },
  {
    id: 'm11',
    date: '2026-09-07',
    title: 'Daddy & Mommy Alter-Ego Inception',
    description: 'The legendary evening where playful banter escalated into the famous Daddy and Mommy alter-egos, sparking endless late-night teasing.',
    icon: 'flame',
    category: 'banter',
    tags: ['daddy-mommy', 'roleplay', 'legendary-banter'],
    quote: {
      text: 'Jokhon mon chaibe bolbo "mommy dudhu khabo🥺"',
      sender: 'farhannn',
      time: '8:37 PM',
    },
    statsSnippet: {
      totalMessages: 1466,
      audioNotes: 61,
      calls: 7,
      reels: 49,
    },
    isFavorite: true,
  },
  {
    id: 'm12',
    date: '2026-09-12',
    title: 'Lap-Sitting & Sweet Teasing Marathon',
    description: 'Over 1,100 messages of playful demands for cuddles, lap sitting, face kissing, and gentle mock bickering.',
    icon: 'smile',
    category: 'banter',
    tags: ['cuddles', 'lap-sitting', 'teasing'],
    quote: {
      text: 'Tomar pura face e kiss korbo erpor golata chetei ador korbo',
      sender: 'farhannn',
      time: '6:57 PM',
    },
    statsSnippet: {
      totalMessages: 1126,
      audioNotes: 43,
      calls: 2,
      reels: 10,
    },
  },
  {
    id: 'm13',
    date: '2026-09-14',
    title: 'Midnight Surrender & Position Fantasies',
    description: 'A 548-message unbroken midnight session of raw passion, uncensored desires, and mutual surrender late into 3 AM.',
    icon: 'moon',
    category: 'late-night',
    tags: ['uncensored', 'midnight', 'surrender'],
    quote: {
      text: 'Koole boshe buuk e mukh dhukaia ador korbo amr daddy je',
      sender: 'NILU',
      time: '12:34 AM',
    },
    statsSnippet: {
      totalMessages: 1554,
      audioNotes: 20,
      calls: 4,
      reels: 19,
    },
  },
  {
    id: 'm14',
    date: '2026-09-22',
    title: 'Shirtless Embraces & Fierce Affection',
    description: 'Uncensored daytime passion dreaming of shirt-off embraces, intense French kisses, and whispering secrets against bare chest.',
    icon: 'flame',
    category: 'love',
    tags: ['shirtless', 'french-kiss', 'passion'],
    quote: {
      text: 'Shirt khule french kiss kore... buuk er sathe chaippa dhorbo',
      sender: 'NILU',
      time: '5:48 PM',
    },
    statsSnippet: {
      totalMessages: 1091,
      audioNotes: 16,
      calls: 2,
      reels: 37,
    },
  },
  {
    id: 'm15',
    date: '2026-09-24',
    title: 'The Iconic Roleplay Climax (297 Messages)',
    description: 'The famous uninterrupted 297-message masterpiece starting with "Kaas e asho... Ettu dudhu khabo" and concluding with voice notes.',
    icon: 'flame',
    category: 'late-night',
    tags: ['roleplay-masterpiece', '297-msgs', 'iconic'],
    quote: {
      text: 'Tomake chuma dei... Amar mommy ke onekk disi. Ektu valobashao dewa uchit',
      sender: 'farhannn',
      time: '10:20 PM',
    },
    statsSnippet: {
      totalMessages: 1037,
      audioNotes: 34,
      calls: 2,
      reels: 36,
    },
    isFavorite: true,
  },
  {
    id: 'm16',
    date: '2026-09-29',
    title: 'Autumn Sukoon & 7 Calls Connection',
    description: 'A serene late September evening marked by deep contentment, 7 phone calls, and tender confessions of belonging.',
    icon: 'heart',
    category: 'comfort',
    tags: ['sukoon', '7-calls', 'autumn'],
    quote: {
      text: 'Sudhu gola te thakte parbo... tui amr shob sukoon',
      sender: 'farhannn',
      time: '11:39 PM',
    },
    statsSnippet: {
      totalMessages: 1114,
      audioNotes: 6,
      calls: 7,
      reels: 18,
    },
  },
  {
    id: 'm17',
    date: '2026-10-01',
    title: 'October Gateway & 87-Day Horizon',
    description: 'Entering the month of October after 87 days of daily dialogue, looking back on a complete archive of love, laughter, and unbreakable devotion.',
    icon: 'sparkles',
    category: 'milestone',
    tags: ['october', 'finale', 'eternal'],
    quote: {
      text: 'October ashlo... aro onek onek din eksathe thakbo amra',
      sender: 'NILU',
      time: '12:05 AM',
    },
    statsSnippet: {
      totalMessages: 74,
      audioNotes: 0,
      calls: 0,
      reels: 3,
    },
    isFavorite: true,
  },
];
