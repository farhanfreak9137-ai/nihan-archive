export type VaultCategory = 'explicit' | 'sensual' | 'bedroom' | 'teasing';

export interface VaultMessage {
  id: string;
  sender: 'NILU' | 'farhannn';
  content: string;
  time: string;
  timestamp: number;
  type?: string;
  mediaUrl?: string;
  audioDuration?: number;
}

export interface IntimateSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  startTimestamp: number;
  category: VaultCategory;
  heatLevel: 1 | 2 | 3; // 1 = Flirty/Teasing, 2 = Sensual/Physical, 3 = Explicit 18+
  title: string;
  subtitle: string;
  previewQuote: {
    sender: 'NILU' | 'farhannn';
    text: string;
  };
  messageCount: number;
  voiceNoteCount: number;
  messages: VaultMessage[];
}

export interface VaultMetadata {
  totalSessions: number;
  totalMessages: number;
  totalVoiceNotes: number;
  byCategory: {
    explicit: number;
    sensual: number;
    bedroom: number;
    teasing: number;
  };
  byHeat: {
    1: number;
    2: number;
    3: number;
  };
}

export interface VaultData {
  metadata: VaultMetadata;
  sessions: IntimateSession[];
}
