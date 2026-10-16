export type SenderId =
  | 'NIHAN'
  | 'SUMAIYA'
  | 'HASAN'
  | 'SAJID'
  | 'META_AI'
  | string;

export type SenderDisplayName =
  | 'NIHAN'
  | 'SUMAIYA'
  | 'HASAN'
  | 'SAJID'
  | 'Meta AI'
  | string;

export type MessageType =
  | 'text'
  | 'share'
  | 'photo'
  | 'video'
  | 'audio'
  | 'call'
  | 'file'
  | 'system';

export type ShareType = 'reel' | 'post' | 'story' | 'other';

export interface Reaction {
  reaction: string;
  actor: string;
  actorDisplay: SenderDisplayName;
}

export interface MediaItem {
  type: 'photo' | 'video' | 'audio' | 'file';
  uri: string;
  filename: string;
  creationTimestamp?: number;
}

export interface Message {
  id: string;
  sender: SenderId;
  senderDisplay: SenderDisplayName;
  threadId?: string;
  threadTitle?: string;
  timestamp: number; // milliseconds
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:42 AM"
  iso: string; // ISO 8601 string
  content: string;
  type: MessageType;
  shareType?: ShareType;
  shareLink?: string;
  shareText?: string;
  reactions: Reaction[];
  media?: MediaItem[];
  callDuration?: number; // seconds
  isEdited?: boolean;
  sourceFile: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalMessages: number;
  nihanMessages: number;
  sumaiyaMessages: number;
  otherMessages?: number;
  nihanPercentage: number;
  sumaiyaPercentage: number;
  shares: number;
  reels: number;
  posts: number;
  stories: number;
  otherShares: number;
  reactions: number;
  nihanReactions: number;
  sumaiyaReactions: number;
  photos: number;
  videos: number;
  audioNotes: number;
  calls: number;
  firstMessage: string; // time string
  lastMessage: string; // time string
  firstTimestamp: number;
  lastTimestamp: number;
  activeDurationMinutes: number;
  peakHour: number; // 0-23
  peakHourCount: number;
  hourlyActivity: number[]; // 24 numbers
  activityScore: number; // 0-100 deterministic
  notableExpressions?: Record<string, number>;
}

export interface ArchiveMetadata {
  archiveTitle?: string;
  totalMessages: number;
  primaryCouple?: {
    partner1: string;
    partner2: string;
  };
  participants: {
    NIHAN: number;
    SUMAIYA: number;
    [key: string]: number;
  };
  participantsDisplay: {
    NIHAN: number;
    SUMAIYA: number;
    [key: string]: number;
  };
  startDate: string;
  endDate: string;
  startTimestamp: number;
  endTimestamp: number;
  activeDays: number;
  shares: {
    total: number;
    reels: number;
    posts: number;
    stories: number;
    other: number;
  };
  sharesBySender: Record<string, { total: number; reels: number; posts: number; stories: number; other: number }>;
  reactions: {
    total: number;
    byActor: Record<string, number>;
    byEmoji: Record<string, { total: number; [actor: string]: number }>;
  };
  media: {
    photos: number;
    videos: number;
    audio: number;
    files: number;
    calls: number;
  };
  hourlyTotals: number[];
  dayOfWeekTotals: number[]; // 0 = Sunday, 1 = Monday ... 6 = Saturday
}

export interface SearchItem {
  id: string;
  date: string;
  time: string;
  timestamp: number;
  sender: SenderId;
  senderDisplay?: SenderDisplayName;
  threadTitle?: string;
  type: MessageType;
  content: string;
  shareType?: ShareType;
  shareLink?: string;
  shareText?: string;
}

export interface MediaRecord {
  id: string;
  messageId: string;
  date: string;
  time: string;
  timestamp: number;
  sender: SenderId;
  threadTitle?: string;
  type: 'reel' | 'post' | 'story' | 'photo' | 'video' | 'audio' | 'file';
  link?: string;
  uri?: string;
  filename?: string;
  title?: string;
  caption?: string;
  contextSnippet?: string;
  category?: 'screenshot' | 'portrait' | 'aesthetic' | 'memory' | 'other';
  dimensions?: { width: number; height: number };
}

export interface ExpressionEntry {
  id: string;
  label: string;
  category:
    | 'love'
    | 'apology'
    | 'gratitude'
    | 'affection'
    | 'missing'
    | 'greetings'
    | 'promises'
    | 'comfort'
    | 'forgiveness';
  pattern: string;
  totalOccurrences: {
    total: number;
    NIHAN?: number;
    SUMAIYA?: number;
    [key: string]: number | undefined;
  };
  messagesCount: {
    total: number;
    NIHAN?: number;
    SUMAIYA?: number;
    [key: string]: number | undefined;
  };
}

export interface NicknameEntry {
  nickname: string;
  totalCount: number;
  bySender: {
    NIHAN?: number;
    SUMAIYA?: number;
    [key: string]: number | undefined;
  };
  sampleMessageIds: string[];
}

export type MomentCategory =
  | 'milestone'
  | 'late-night'
  | 'audio'
  | 'banter'
  | 'comfort'
  | 'love'
  | 'custom';

export interface Moment {
  id: string;
  date: string;
  title: string;
  description?: string;
  messageId?: string;
  icon?: string;
  tags?: string[];
  isCustom?: boolean;
  category?: MomentCategory;
  quote?: {
    text: string;
    sender: string;
    time?: string;
  };
  statsSnippet?: {
    totalMessages?: number;
    audioNotes?: number;
    calls?: number;
    reels?: number;
  };
  isFavorite?: boolean;
}
