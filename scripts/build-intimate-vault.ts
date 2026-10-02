import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IntimateSession, VaultCategory, VaultData } from '../src/types/vault';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const daysDir = path.join(__dirname, '../public/data/days');
const outputFile = path.join(__dirname, '../public/data/intimate_vault.json');

const files = fs.readdirSync(daysDir).filter((f) => f.endsWith('.json')).sort();

interface RawMessage {
  id: string;
  sender: 'NILU' | 'farhannn';
  content: string;
  time: string;
  timestamp: number;
  type?: string;
  mediaUrl?: string;
  audioDuration?: number;
}

const explicitTerms = [
  'fuck', 'sex', 'horny', 'nude', 'strip', 'bra', 'boob', 'breast',
  'dhukai', 'betha lagtese', 'penetrate', 'tippa', 'hard fuck', 'pant er upor'
];

const sensualTerms = [
  'french kiss', 'kiss', 'chumu', 'chuma', 'lips', 'thot', 'thoth',
  'kamor', 'kamur', 'bite', 'chete', 'lick', 'golate', 'shirtless',
  'chul khamchaya', 'aggressive kiss', 'shob jaigai ador', 'joraia dhorbo',
  'chaippa dhoira', 'mukhe amr boobs', 'kole uthe'
];

const bedroomTerms = [
  'bed e jawar', 'loose t-shirt', 'kole ghumais', 'bed ei to', 'kapor khulta',
  'nighty', 'shuye'
];

const teasingTerms = [
  'sexy daddy', 'hott mommy', 'beshi sexy', 'beshi hot', 'gorom lage',
  'dushtu', 'horny hoye', 'tore horny', 'hotness'
];

// False positive blacklist
const blacklist = [
  'bilai bite',
  'unwanted feel',
  'bedi',
  'bedar',
  'kadhal vhenge khabo',
  'academic boi'
];

function isIntimate(text: string): { isHit: boolean; category: VaultCategory; heat: 1 | 2 | 3 } {
  const lower = (text || '').toLowerCase();
  if (blacklist.some((b) => lower.includes(b))) {
    return { isHit: false, category: 'teasing', heat: 1 };
  }

  // Check explicit first
  if (explicitTerms.some((kw) => lower.includes(kw))) {
    return { isHit: true, category: 'explicit', heat: 3 };
  }
  // Check sensual
  if (sensualTerms.some((kw) => lower.includes(kw))) {
    return { isHit: true, category: 'sensual', heat: 2 };
  }
  // Check bedroom
  if (bedroomTerms.some((kw) => lower.includes(kw))) {
    return { isHit: true, category: 'bedroom', heat: 2 };
  }
  // Check teasing
  if (teasingTerms.some((kw) => lower.includes(kw))) {
    return { isHit: true, category: 'teasing', heat: 1 };
  }

  return { isHit: false, category: 'teasing', heat: 1 };
}

function deriveSessionTitle(messages: RawMessage[], category: VaultCategory): { title: string; subtitle: string } {
  const fullText = messages.map((m) => m.content || '').join(' ').toLowerCase();

  if (fullText.includes('dhukai') || fullText.includes('aste daddy')) {
    return {
      title: 'The Daddy & Mommy Roleplay',
      subtitle: 'Uncensored late-night fantasy & roleplay dialogue',
    };
  }
  if (fullText.includes('fuck')) {
    return {
      title: 'Uncensored Midnight Confession',
      subtitle: 'Raw, unfiltered mutual desires past midnight',
    };
  }
  if (fullText.includes('boobs khabo') || fullText.includes('tippa marbo') || fullText.includes('pant er upor')) {
    return {
      title: 'Body Contact & Provocative Teasing',
      subtitle: 'Playful dirty talk, lap sitting, and body banter',
    };
  }
  if (fullText.includes('french kiss') || fullText.includes('aggressive kiss') || fullText.includes('chul khamchaya')) {
    return {
      title: 'Aggressive Kisses & Hair Grips',
      subtitle: 'Morning wake-up fantasy & deep kiss desire',
    };
  }
  if (fullText.includes('golate kiss') || fullText.includes('chete') || fullText.includes('bite') || fullText.includes('kamor')) {
    return {
      title: 'Neck Kisses & Biting Desires',
      subtitle: 'Whispering close and leaving marks of affection',
    };
  }
  if (fullText.includes('shirtless') || fullText.includes('buuk er sathe')) {
    return {
      title: 'Shirtless Embraces & Warmth',
      subtitle: 'Holding tight against chest and gentle murmurs',
    };
  }
  if (fullText.includes('bed e jawar') || fullText.includes('loose t-shirt')) {
    return {
      title: 'Late-Night Bed Outfits',
      subtitle: 'Planning what to wear and sleeping in each other’s arms',
    };
  }
  if (fullText.includes('horny')) {
    return {
      title: 'Midnight Heat & Desire',
      subtitle: 'Conversations when the heat takes over',
    };
  }
  if (fullText.includes('daddy') && fullText.includes('sexy')) {
    return {
      title: 'Sexy Daddy & Hot Mommy',
      subtitle: 'Playful alter-egos and escalating sexual tension',
    };
  }
  if (fullText.includes('lips slide') || fullText.includes('shob jaigai ador')) {
    return {
      title: 'Total Body Ador & Lips Sliding',
      subtitle: 'Slow, sensual promises of head-to-toe affection',
    };
  }
  if (category === 'explicit') {
    return {
      title: 'Raw 18+ Intimacy',
      subtitle: 'Uncensored mutual passion and late-night desires',
    };
  }
  if (category === 'sensual') {
    return {
      title: 'Sensual Kisses & Close Touch',
      subtitle: 'Deep physical yearning and intimate affection',
    };
  }
  if (category === 'bedroom') {
    return {
      title: 'Bedside Pillow Talk',
      subtitle: 'Intimate conversations dreaming of sharing one bed',
    };
  }
  return {
    title: 'After-Hours Flirting & Heat',
    subtitle: 'High-chemistry banter and suggestive teasing',
  };
}

const rawSessions: IntimateSession[] = [];

for (const file of files) {
  const date = file.replace('.json', '');
  const messages: RawMessage[] = JSON.parse(fs.readFileSync(path.join(daysDir, file), 'utf8'));

  // Mark all hits
  const hits: { idx: number; category: VaultCategory; heat: 1 | 2 | 3 }[] = [];
  for (let i = 0; i < messages.length; i++) {
    const res = isIntimate(messages[i].content);
    if (res.isHit) {
      hits.push({ idx: i, category: res.category, heat: res.heat });
    }
  }

  if (hits.length === 0) continue;

  // Cluster hits within 8 messages of each other
  const clusters: { start: number; end: number; hits: typeof hits }[] = [];
  let currentGroup: typeof hits = [];

  for (const h of hits) {
    if (currentGroup.length === 0) {
      currentGroup.push(h);
    } else {
      const prev = currentGroup[currentGroup.length - 1];
      if (h.idx - prev.idx <= 8) {
        currentGroup.push(h);
      } else {
        if (currentGroup.length >= 2) {
          clusters.push({
            start: Math.max(0, currentGroup[0].idx - 1),
            end: Math.min(messages.length - 1, currentGroup[currentGroup.length - 1].idx + 1),
            hits: [...currentGroup],
          });
        }
        currentGroup = [h];
      }
    }
  }

  if (currentGroup.length >= 2) {
    clusters.push({
      start: Math.max(0, currentGroup[0].idx - 1),
      end: Math.min(messages.length - 1, currentGroup[currentGroup.length - 1].idx + 1),
      hits: [...currentGroup],
    });
  }

  // Convert clusters to sessions
  for (let cIdx = 0; cIdx < clusters.length; cIdx++) {
    const c = clusters[cIdx];
    const sessionMsgs = messages.slice(c.start, c.end + 1);

    // Determine category and heat
    let maxHeat: 1 | 2 | 3 = 1;
    let category: VaultCategory = 'teasing';

    for (const h of c.hits) {
      if (h.heat > maxHeat) {
        maxHeat = h.heat;
        category = h.category;
      }
    }

    // Best preview quote
    const hitMsg = messages[c.hits[0].idx];
    const previewQuote = {
      sender: hitMsg.sender,
      text: hitMsg.content,
    };

    const { title, subtitle } = deriveSessionTitle(sessionMsgs, category);

    const voiceNoteCount = sessionMsgs.filter((m) => m.type === 'audio' || m.audioDuration).length;

    rawSessions.push({
      id: `vault-${date}-${c.start}`,
      date,
      startTime: sessionMsgs[0].time,
      endTime: sessionMsgs[sessionMsgs.length - 1].time,
      startTimestamp: sessionMsgs[0].timestamp,
      category,
      heatLevel: maxHeat,
      title,
      subtitle,
      previewQuote,
      messageCount: sessionMsgs.length,
      voiceNoteCount,
      messages: sessionMsgs.map((m) => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        time: m.time,
        timestamp: m.timestamp,
        type: m.type,
        mediaUrl: m.mediaUrl,
        audioDuration: m.audioDuration,
      })),
    });
  }
}

// Sort sessions chronologically (oldest to newest, or newest to oldest)
// Let's sort newest first (most recent at top)
rawSessions.sort((a, b) => b.startTimestamp - a.startTimestamp);

const metadata = {
  totalSessions: rawSessions.length,
  totalMessages: rawSessions.reduce((acc, s) => acc + s.messageCount, 0),
  totalVoiceNotes: rawSessions.reduce((acc, s) => acc + s.voiceNoteCount, 0),
  byCategory: {
    explicit: rawSessions.filter((s) => s.category === 'explicit').length,
    sensual: rawSessions.filter((s) => s.category === 'sensual').length,
    bedroom: rawSessions.filter((s) => s.category === 'bedroom').length,
    teasing: rawSessions.filter((s) => s.category === 'teasing').length,
  },
  byHeat: {
    1: rawSessions.filter((s) => s.heatLevel === 1).length,
    2: rawSessions.filter((s) => s.heatLevel === 2).length,
    3: rawSessions.filter((s) => s.heatLevel === 3).length,
  },
};

const vaultData: VaultData = {
  metadata,
  sessions: rawSessions,
};

fs.writeFileSync(outputFile, JSON.stringify(vaultData, null, 2), 'utf8');

console.log('=== INTIMATE VAULT COMPILED SUCCESSFULLY ===');
console.log(`Saved to: ${outputFile}`);
console.log(`Total Sessions: ${metadata.totalSessions}`);
console.log(`Total Messages: ${metadata.totalMessages}`);
console.log(`Total Voice Notes: ${metadata.totalVoiceNotes}`);
console.log('By Category:', metadata.byCategory);
console.log('By Heat Level:', metadata.byHeat);
