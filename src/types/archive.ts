export type SenderId = 'NILU' | 'farhannn';
export type SenderDisplayName = 'NILA' | 'FARHAN';

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
  nilaMessages: number;
  farhanMessages: number;
  nilaPercentage: number;
  farhanPercentage: number;
  shares: number;
  reels: number;
  posts: number;
  stories: number;
  otherShares: number;
  reactions: number;
  nilaReactions: number;
  farhanReactions: number;
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
  notableExpressions: Record<string, number>;
}

export interface ArchiveMetadata {
  totalMessages: number;
  participants: {
    NILU: number;
    farhannn: number;
  };
  participantsDisplay: {
    NILA: number;
    FARHAN: number;
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
  sharesBySender: {
    NILU: { total: number; reels: number; posts: number; stories: number; other: number };
    farhannn: { total: number; reels: number; posts: number; stories: number; other: number };
  };
  reactions: {
    total: number;
    byActor: {
      NILU: number;
      farhannn: number;
    };
    byEmoji: Record<string, { total: number; NILU: number; farhannn: number }>;
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
    | 'forgiveness';
  pattern: string;
  totalOccurrences: {
    total: number;
    NILU: number;
    farhannn: number;
  };
  messagesCount: {
    total: number;
    NILU: number;
    farhannn: number;
  };
}

export interface NicknameEntry {
  nickname: string;
  totalCount: number;
  bySender: {
    NILU: number;
    farhannn: number;
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
    sender: 'NILU' | 'farhannn';
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
