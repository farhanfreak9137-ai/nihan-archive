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
  'dhukai', 'dhukailam', 'dhukais', 'dhukaites', 'betha lagtese', 'penetrate',
  'tippa', 'tippa marbo', 'hard fuck', 'pant er upor', '7inch', 'angul dhukai',
  'pichon diye', 'pichone dhukai', 'mukhe jib dhukai', 'pani ber korbo', 'pani khabo',
  'chete khabo', 'dudh tipbo', 'dudhu khabo', 'dudhu khabu', 'dudhu', 'dudhuu', 'dudhe haat',
  'tomake khabo', 'tore khamu', 'tore khabo', 'khaia felbo', 'chushbo', 'jib chusho',
  'panty', 'underwear', 'kapor khul', 'kapor khulta', 'kapor khule', 'shob kapor'
];

const sensualTerms = [
  'french kiss', 'kiss', 'chumu', 'chuma', 'lips', 'thot', 'thoth',
  'kamor', 'kamur', 'bite', 'chete', 'lick', 'golate kiss', 'golate', 'shirtless',
  'chul khamchaya', 'aggressive kiss', 'shob jaigai ador', 'joraia dhorbo',
  'chaippa dhoira', 'mukhe amr boobs', 'kole uthe', 'kole bosh', 'kole niye',
  'buuk e mukh', 'kaas e asho', 'buuke niye chuma', 'kole ghumais'
];

const bedroomTerms = [
  'bed e jawar', 'loose t-shirt', 'bed ei to',
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
  'academic boi',
  'bhat khabo',
  'cha khabo',
  'ice cream khabo',
  'lunch khabo',
  'dinner khabo',
  'fuska khabo',
  'kichu khabo',
  'kheye disi'
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

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const isPM = match[3].toUpperCase() === 'PM';
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function timeDiffMinutes(t1: string, t2: string): number {
  let diff = Math.abs(parseTimeToMinutes(t1) - parseTimeToMinutes(t2));
  if (diff > 720) diff = 1440 - diff;
  return diff;
}

function deriveSessionTitle(messages: RawMessage[], category: VaultCategory): { title: string; subtitle: string } {
  const fullText = messages.map((m) => m.content || '').join(' ').toLowerCase();

  if (fullText.includes('dudhu') || fullText.includes('dudhu khabo')) {
    return {
      title: 'Mommy Dudhu & Midnight Cuddles',
      subtitle: 'Soft teasing, craving cuddles, and breastplay banter',
    };
  }
  if (fullText.includes('dhukai') || fullText.includes('aste daddy') || fullText.includes('pichon diye')) {
    return {
      title: 'The Daddy & Mommy Uncensored Roleplay',
      subtitle: 'Uncensored late-night fantasy, position talk, and mutual surrender',
    };
  }
  if (fullText.includes('tomake khabo') || fullText.includes('chete khabo') || fullText.includes('tore khamu')) {
    return {
      title: 'Eating You Up & Sensual Hunger',
      subtitle: 'Passionate whispers of tasting every inch and craving physical intimacy',
    };
  }
  if (fullText.includes('fuck')) {
    return {
      title: 'Uncensored Midnight Confession',
      subtitle: 'Raw, unfiltered mutual desires and deep midnight cravings',
    };
  }
  if (fullText.includes('boobs') || fullText.includes('tippa marbo') || fullText.includes('pant er upor')) {
    return {
      title: 'Body Contact & Provocative Teasing',
      subtitle: 'Playful dirty talk, lap sitting, and body banter',
    };
  }
  if (fullText.includes('french kiss') || fullText.includes('aggressive kiss') || fullText.includes('chul khamchaya')) {
    return {
      title: 'Aggressive Kisses & Hair Grips',
      subtitle: 'Deep French kissing fantasies and intense lip locks',
    };
  }
  if (fullText.includes('golate kiss') || fullText.includes('chete') || fullText.includes('bite') || fullText.includes('kamor')) {
    return {
      title: 'Neck Kisses & Biting Desires',
      subtitle: 'Whispering close and leaving marks of passion',
    };
  }
  if (fullText.includes('shirtless') || fullText.includes('buuk er sathe')) {
    return {
      title: 'Shirtless Embraces & Warmth',
      subtitle: 'Skin-to-skin warmth, holding tight against chest, and sweet murmurs',
    };
  }
  if (fullText.includes('bed e jawar') || fullText.includes('loose t-shirt') || fullText.includes('nighty')) {
    return {
      title: 'Late-Night Bed Outfits & Nightwear',
      subtitle: 'Planning nightwear and dreaming of sharing one bed',
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

  // Mark all intimate hits
  const hits: { idx: number; category: VaultCategory; heat: 1 | 2 | 3 }[] = [];
  for (let i = 0; i < messages.length; i++) {
    const res = isIntimate(messages[i].content);
    if (res.isHit) {
      hits.push({ idx: i, category: res.category, heat: res.heat });
    }
  }

  if (hits.length === 0) continue;

  // Group hits into continuous conversation episodes:
  // Hits belong together if time diff <= 20 minutes OR message gap <= 25 with active dialogue
  const rawClusters: { hits: typeof hits }[] = [];
  let currentGroup = [hits[0]];

  for (let i = 1; i < hits.length; i++) {
    const prevIdx = currentGroup[currentGroup.length - 1].idx;
    const curIdx = hits[i].idx;
    const msgDiff = curIdx - prevIdx;
    const timeDiff = timeDiffMinutes(messages[prevIdx].time, messages[curIdx].time);

    if (msgDiff <= 25 || timeDiff <= 20) {
      currentGroup.push(hits[i]);
    } else {
      rawClusters.push({ hits: currentGroup });
      currentGroup = [hits[i]];
    }
  }
  rawClusters.push({ hits: currentGroup });

  // For each cluster, expand backwards to conversation start, and forwards to conversation end
  const daySessions: { startIdx: number; endIdx: number; hits: typeof hits }[] = [];

  for (const cluster of rawClusters) {
    let startIdx = cluster.hits[0].idx;
    let endIdx = cluster.hits[cluster.hits.length - 1].idx;

    // Expand backwards to the start of the conversation (setup messages)
    while (startIdx > 0) {
      const prevMsg = messages[startIdx - 1];
      const curMsg = messages[startIdx];
      const gap = timeDiffMinutes(prevMsg.time, curMsg.time);
      if (gap > 8) break; // Silence / break in conversation
      startIdx--;
      if (cluster.hits[0].idx - startIdx >= 10) break; // Keep lead-in focused
    }

    // Expand forwards to find natural end: voice note, call, topic change, or silence
    while (endIdx < messages.length - 1) {
      const curMsg = messages[endIdx];
      const nextMsg = messages[endIdx + 1];
      const gap = timeDiffMinutes(curMsg.time, nextMsg.time);
      if (gap > 12) break; // 12+ min pause = conversation break

      endIdx++;

      // Check voice notes & calls
      const isVoice = nextMsg.type === 'audio' || (nextMsg.content && nextMsg.content.includes('audio'));
      const isCall = nextMsg.content && (
        nextMsg.content.toLowerCase().includes('call') ||
        nextMsg.content.toLowerCase().includes('missed video')
      );

      // If voice note or call reached, include consecutive voice notes and closing resolution
      if (isVoice || isCall) {
        let lookAhead = 0;
        while (lookAhead < 4 && endIdx + 1 < messages.length && timeDiffMinutes(messages[endIdx].time, messages[endIdx + 1].time) <= 3) {
          endIdx++;
          lookAhead++;
        }
        break;
      }

      // Check topic change phrases
      const lower = (nextMsg.content || '').toLowerCase();
      if (
        lower.includes('ghumao') ||
        lower.includes('shorir kharap farhan') ||
        lower.includes('pora sesh') ||
        lower.includes('bhat kha') ||
        lower.includes('uni jabo') ||
        lower.includes('class ase') ||
        lower.includes('mommy sesh') ||
        lower.includes('good night')
      ) {
        let lookAhead = 0;
        while (lookAhead < 3 && endIdx + 1 < messages.length && timeDiffMinutes(messages[endIdx].time, messages[endIdx + 1].time) <= 2) {
          endIdx++;
          lookAhead++;
        }
        break;
      }

      // Don't wander endlessly if no more intimate hits
      if (endIdx - cluster.hits[cluster.hits.length - 1].idx > 25) {
        break;
      }
    }

    daySessions.push({ startIdx, endIdx, hits: cluster.hits });
  }

  // Merge any overlapping or adjacent sessions on the same day
  const mergedDaySessions: { startIdx: number; endIdx: number; hits: typeof hits }[] = [];
  for (const s of daySessions) {
    if (mergedDaySessions.length === 0) {
      mergedDaySessions.push(s);
    } else {
      const last = mergedDaySessions[mergedDaySessions.length - 1];
      if (s.startIdx <= last.endIdx + 4) {
        last.endIdx = Math.max(last.endIdx, s.endIdx);
        last.hits.push(...s.hits);
      } else {
        mergedDaySessions.push(s);
      }
    }
  }

  // Convert to IntimateSession objects
  for (let cIdx = 0; cIdx < mergedDaySessions.length; cIdx++) {
    const s = mergedDaySessions[cIdx];
    const sessionMsgs = messages.slice(s.startIdx, s.endIdx + 1);

    // Filter out trivial 1-2 message blips if no heat >= 2
    let maxHeat: 1 | 2 | 3 = 1;
    let category: VaultCategory = 'teasing';

    for (const h of s.hits) {
      if (h.heat > maxHeat) {
        maxHeat = h.heat;
        category = h.category;
      }
    }

    // Best preview quote from an intimate hit
    const hitMsg = messages[s.hits[0].idx] || sessionMsgs[0];
    const previewQuote = {
      sender: hitMsg.sender,
      text: hitMsg.content ? hitMsg.content.slice(0, 140) : '',
    };

    const { title, subtitle } = deriveSessionTitle(sessionMsgs, category);

    // Audio note count
    const voiceCount = sessionMsgs.filter(
      (m) => m.type === 'audio' || (m.mediaUrl && m.mediaUrl.endsWith('.aac'))
    ).length;

    rawSessions.push({
      id: `${date}-full-session-${cIdx + 1}`,
      date,
      startTime: sessionMsgs[0].time,
      endTime: sessionMsgs[sessionMsgs.length - 1].time,
      startTimestamp: sessionMsgs[0].timestamp || 0,
      category,
      heatLevel: maxHeat,
      title,
      subtitle,
      previewQuote,
      messageCount: sessionMsgs.length,
      voiceNoteCount: voiceCount,
      messages: sessionMsgs.map((m) => ({
        id: m.id,
        sender: m.sender,
        content: m.content || '',
        time: m.time,
        timestamp: m.timestamp,
        type: (m.type as any) || 'text',
        mediaUrl: m.mediaUrl,
        audioDuration: m.audioDuration,
      })),
    });
  }
}

// Sort sessions reverse-chronologically (newest dates first)
rawSessions.sort((a, b) => b.date.localeCompare(a.date));

// Build Metadata
const totalSessions = rawSessions.length;
const totalMessages = rawSessions.reduce((acc, s) => acc + s.messageCount, 0);
const totalVoiceNotes = rawSessions.reduce((acc, s) => acc + s.voiceNoteCount, 0);

const byCategory: Record<VaultCategory, number> = {
  explicit: 0,
  sensual: 0,
  bedroom: 0,
  teasing: 0,
};

const byHeat: Record<1 | 2 | 3, number> = {
  1: 0,
  2: 0,
  3: 0,
};

for (const s of rawSessions) {
  byCategory[s.category] = (byCategory[s.category] || 0) + 1;
  byHeat[s.heatLevel] = (byHeat[s.heatLevel] || 0) + 1;
}

const vaultData: VaultData = {
  metadata: {
    totalSessions,
    totalMessages,
    totalVoiceNotes,
    byCategory,
    byHeat,
    lastGenerated: new Date().toISOString(),
  },
  sessions: rawSessions,
};

fs.writeFileSync(outputFile, JSON.stringify(vaultData, null, 2), 'utf8');

console.log('✅ Full Intimate Vault dataset successfully generated:');
console.log(`   - Sessions: ${totalSessions}`);
console.log(`   - Total Messages: ${totalMessages.toLocaleString()}`);
console.log(`   - Voice Notes: ${totalVoiceNotes}`);
console.log(`   - Explicit (18+): ${byCategory.explicit}`);
console.log(`   - Sensual: ${byCategory.sensual}`);
console.log(`   - Bedroom: ${byCategory.bedroom}`);
console.log(`   - Teasing: ${byCategory.teasing}`);
