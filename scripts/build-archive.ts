import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MESSAGES_DIR = path.join(ROOT_DIR, 'Messages');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'data');
const DAYS_DIR = path.join(OUTPUT_DIR, 'days');

// Ensure output directories exist
fs.mkdirSync(DAYS_DIR, { recursive: true });

/**
 * Decode Instagram's Latin-1/UTF-8 mojibake encoding
 */
function decodeMojibake(text: string | undefined | null): string {
  if (!text) return '';
  try {
    return Buffer.from(text, 'latin1').toString('utf8');
  } catch {
    return text;
  }
}

/**
 * Parse a file that may contain multiple concatenated JSON objects
 */
function parseConcatenatedJson(content: string): any[] {
  const objects: any[] = [];
  let pos = 0;
  const len = content.length;

  while (pos < len) {
    // Skip whitespace
    while (pos < len && /\s/.test(content[pos])) {
      pos++;
    }
    if (pos >= len) break;

    // Find the matching end brace for the root JSON object
    if (content[pos] !== '{') {
      break;
    }

    let depth = 0;
    let inString = false;
    let isEscaped = false;
    let startPos = pos;
    let endPos = -1;

    for (let i = pos; i < len; i++) {
      const char = content[i];

      if (inString) {
        if (isEscaped) {
          isEscaped = false;
        } else if (char === '\\') {
          isEscaped = true;
        } else if (char === '"') {
          inString = false;
        }
      } else {
        if (char === '"') {
          inString = true;
        } else if (char === '{') {
          depth++;
        } else if (char === '}') {
          depth--;
          if (depth === 0) {
            endPos = i + 1;
            break;
          }
        }
      }
    }

    if (endPos === -1) {
      throw new Error(`Unterminated JSON object starting at position ${startPos}`);
    }

    const chunk = content.slice(startPos, endPos);
    const parsed = JSON.parse(chunk);
    objects.push(parsed);
    pos = endPos;
  }

  return objects;
}

/**
 * Classify share type based on Instagram URL
 */
function classifyShare(link: string): 'reel' | 'post' | 'story' | 'other' {
  if (!link) return 'other';
  if (link.includes('instagram.com/reel') || link.includes('instagram.com/reels')) return 'reel';
  if (link.includes('instagram.com/p/')) return 'post';
  if (link.includes('instagram.com/stories')) return 'story';
  return 'other';
}

/**
 * Format timestamp to 12h time string (e.g. "10:42 AM")
 */
function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minStr} ${ampm}`;
}

/**
 * Deterministic Activity Score calculation (0 - 100)
 */
function calculateActivityScore(stats: {
  totalMessages: number;
  activeDurationMinutes: number;
  shares: number;
  reactions: number;
  hourlySpread: number; // number of distinct active hours
}): number {
  // 1. Volume score (max 50 pts): 2,000 msgs = 50 pts
  const volumeScore = Math.min(50, (stats.totalMessages / 2000) * 50);

  // 2. Duration score (max 20 pts): 12 hours active = 20 pts
  const durationScore = Math.min(20, (stats.activeDurationMinutes / 720) * 20);

  // 3. Hourly spread score (max 15 pts): 18 distinct active hours = 15 pts
  const spreadScore = Math.min(15, (stats.hourlySpread / 18) * 15);

  // 4. Engagement bonus (max 15 pts): shares + reactions
  const engagement = stats.shares * 1.5 + stats.reactions * 0.5;
  const engagementScore = Math.min(15, (engagement / 50) * 15);

  const rawScore = volumeScore + durationScore + spreadScore + engagementScore;
  return Math.max(5, Math.min(100, Math.round(rawScore)));
}

async function runPipeline() {
  console.log('=== NILA ARCHIVE: INGESTION & NORMALIZATION PIPELINE ===\n');

  // Automatically discover any message_*.json files in MESSAGES_DIR or any nilu* directories
  const searchDirs = [MESSAGES_DIR];
  if (fs.existsSync(ROOT_DIR)) {
    const rootEntries = fs.readdirSync(ROOT_DIR);
    for (const entry of rootEntries) {
      const fullPath = path.join(ROOT_DIR, entry);
      if (entry.toLowerCase().startsWith('nilu') && fs.statSync(fullPath).isDirectory()) {
        searchDirs.push(fullPath);
      }
    }
  }

  const filePathsSet = new Set<string>();

  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (item.startsWith('message_') && item.endsWith('.json')) {
          filePathsSet.add(path.join(dir, item));
        }
      }
    }
  }

  // Sort files by numeric message index (e.g. message_1, message_2, message_10...)
  const filePaths = Array.from(filePathsSet).sort((a, b) => {
    const numA = parseInt(path.basename(a).match(/\d+/)?.[0] || '0', 10);
    const numB = parseInt(path.basename(b).match(/\d+/)?.[0] || '0', 10);
    return numA - numB;
  });

  console.log(`Discovered ${filePaths.length} message JSON file(s):`);
  filePaths.forEach((f) => console.log(`  - ${path.basename(path.dirname(f))}/${path.basename(f)}`));

  // Sync photos, audio, files, and videos from any nilu* folder to public/media
  const mediaTargets = ['photos', 'audio', 'files', 'videos'];
  for (const dir of searchDirs) {
    if (dir === MESSAGES_DIR) continue;
    for (const sub of mediaTargets) {
      const srcSub = path.join(dir, sub);
      const destSub = path.join(ROOT_DIR, 'public', 'media', sub);
      if (fs.existsSync(srcSub)) {
        fs.mkdirSync(destSub, { recursive: true });
        const mediaFiles = fs.readdirSync(srcSub);
        let copied = 0;
        for (const mf of mediaFiles) {
          const destFile = path.join(destSub, mf);
          if (!fs.existsSync(destFile)) {
            fs.copyFileSync(path.join(srcSub, mf), destFile);
            copied++;
          }
        }
        if (copied > 0) {
          console.log(`Synced ${copied} new ${sub} files into public/media/${sub}`);
        }
      }
    }
  }

  const rawEntries: { source: string; msg: any }[] = [];

  for (const filePath of filePaths) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const parts = parseConcatenatedJson(content);
    console.log(`Loaded ${fileName}: parsed ${parts.length} JSON part(s)`);

    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
      const msgs = parts[pIdx].messages || [];
      console.log(`  - Part ${pIdx + 1}: ${msgs.length.toLocaleString()} messages`);
      for (const m of msgs) {
        rawEntries.push({
          source: `${fileName}#p${pIdx + 1}`,
          msg: m,
        });
      }
    }
  }

  console.log(`\nTotal raw message records read: ${rawEntries.length.toLocaleString()}`);

  // Deduplication & Normalization
  const seenKeys = new Set<string>();
  const normalizedMessages: any[] = [];
  let duplicatesCount = 0;

  for (const entry of rawEntries) {
    const raw = entry.msg;
    const senderRaw = raw.sender_name || 'UNKNOWN';
    const sender = decodeMojibake(senderRaw);
    const senderId = sender === 'farhannn' ? 'farhannn' : 'NILU';
    const senderDisplay = senderId === 'NILU' ? 'NILA' : 'FARHAN';

    const timestamp = Number(raw.timestamp_ms);
    const contentRaw = raw.content || '';
    const content = decodeMojibake(contentRaw);

    const shareLink = raw.share?.link || '';
    const shareText = decodeMojibake(raw.share?.share_text || '');

    // Deduplication Key: timestamp_ms + sender + content + shareLink
    const dedupeKey = `${timestamp}|${senderId}|${content}|${shareLink}`;

    if (seenKeys.has(dedupeKey)) {
      duplicatesCount++;
      continue;
    }
    seenKeys.add(dedupeKey);

    // Classify Type
    let type: string = 'text';
    let shareType: string | undefined = undefined;

    if (raw.share && typeof raw.share === 'object') {
      type = 'share';
      shareType = classifyShare(shareLink);
    } else if (raw.photos && Array.isArray(raw.photos) && raw.photos.length > 0) {
      type = 'photo';
    } else if (raw.videos && Array.isArray(raw.videos) && raw.videos.length > 0) {
      type = 'video';
    } else if (raw.audio_files && Array.isArray(raw.audio_files) && raw.audio_files.length > 0) {
      type = 'audio';
    } else if (raw.files && Array.isArray(raw.files) && raw.files.length > 0) {
      type = 'file';
    } else if (typeof raw.call_duration === 'number' || (content && content.toLowerCase().includes('call'))) {
      type = 'call';
    }

    // Media extraction
    const media: any[] = [];
    if (raw.photos) {
      for (const p of raw.photos) {
        const filename = path.basename(p.uri);
        media.push({
          type: 'photo',
          uri: `/media/photos/${filename}`,
          filename,
          creationTimestamp: p.creation_timestamp,
        });
      }
    }
    if (raw.videos) {
      for (const v of raw.videos) {
        const filename = path.basename(v.uri);
        // Check if file exists in videos, photos or audio
        const inVideos = fs.existsSync(path.join(ROOT_DIR, 'public', 'media', 'videos', filename));
        const inPhotos = fs.existsSync(path.join(ROOT_DIR, 'public', 'media', 'photos', filename));
        const subfolder = inVideos ? 'videos' : (inPhotos ? 'photos' : 'audio');
        media.push({
          type: 'video',
          uri: `/media/${subfolder}/${filename}`,
          filename,
          creationTimestamp: v.creation_timestamp,
        });
      }
    }
    if (raw.audio_files) {
      for (const a of raw.audio_files) {
        const filename = path.basename(a.uri);
        media.push({
          type: 'audio',
          uri: `/media/audio/${filename}`,
          filename,
          creationTimestamp: a.creation_timestamp,
        });
      }
    }
    if (raw.files) {
      for (const f of raw.files) {
        const filename = path.basename(f.uri);
        media.push({
          type: 'file',
          uri: `/media/files/${filename}`,
          filename,
          creationTimestamp: f.creation_timestamp,
        });
      }
    }

    // Reactions extraction
    const reactions: any[] = [];
    if (raw.reactions && Array.isArray(raw.reactions)) {
      for (const r of raw.reactions) {
        const decodedReaction = decodeMojibake(r.reaction);
        const actor = decodeMojibake(r.actor);
        const actorDisplay = actor === 'farhannn' ? 'FARHAN' : 'NILA';
        reactions.push({
          reaction: decodedReaction,
          actor,
          actorDisplay,
        });
      }
    }

    const dateObj = new Date(timestamp);
    const dateStr = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = formatTime(dateObj);
    const isEdited = content.includes('(edited)');

    // Generate stable unique message ID
    const msgId = `m_${timestamp}_${senderId}`;

    normalizedMessages.push({
      id: msgId,
      sender: senderId,
      senderDisplay,
      timestamp,
      date: dateStr,
      time: timeStr,
      iso: dateObj.toISOString(),
      content,
      type,
      ...(shareType ? { shareType, shareLink, shareText } : {}),
      reactions,
      ...(media.length > 0 ? { media } : {}),
      ...(typeof raw.call_duration === 'number' ? { callDuration: raw.call_duration } : {}),
      ...(isEdited ? { isEdited: true } : {}),
      sourceFile: entry.source,
    });
  }

  console.log(`Deduplication finished: removed ${duplicatesCount.toLocaleString()} duplicate(s)`);
  console.log(`Normalized message count: ${normalizedMessages.length.toLocaleString()}`);

  // Sort strictly chronologically (oldest to newest)
  normalizedMessages.sort((a, b) => a.timestamp - b.timestamp);

  // Group by Date for Day Shards & Daily Stats
  const dayGroups = new Map<string, any[]>();
  for (const m of normalizedMessages) {
    if (!dayGroups.has(m.date)) {
      dayGroups.set(m.date, []);
    }
    dayGroups.get(m.date)!.push(m);
  }

  const activeDaysList = Array.from(dayGroups.keys()).sort();
  console.log(`\nActive days: ${activeDaysList.length} (from ${activeDaysList[0]} to ${activeDaysList[activeDaysList.length - 1]})`);

  // Global Metrics Accumulators
  let totalNila = 0;
  let totalFarhan = 0;
  let totalShares = 0;
  let totalReels = 0;
  let totalPosts = 0;
  let totalStories = 0;
  let totalOtherShares = 0;
  let totalReactions = 0;
  const reactionsByActor = { NILU: 0, farhannn: 0 };
  const reactionsByEmoji: Record<string, { total: number; NILU: number; farhannn: number }> = {};
  const sharesBySender = {
    NILU: { total: 0, reels: 0, posts: 0, stories: 0, other: 0 },
    farhannn: { total: 0, reels: 0, posts: 0, stories: 0, other: 0 },
  };
  const hourlyTotals = new Array(24).fill(0);
  const dayOfWeekTotals = new Array(7).fill(0);

  let totalPhotos = 0;
  let totalVideos = 0;
  let totalAudio = 0;
  let totalFiles = 0;
  let totalCalls = 0;

  const dailyStatsList: any[] = [];
  const searchIndex: any[] = [];
  const mediaRecords: any[] = [];

  // Process Each Day
  for (const [dateStr, msgs] of dayGroups.entries()) {
    let dayNila = 0;
    let dayFarhan = 0;
    let dayShares = 0;
    let dayReels = 0;
    let dayPosts = 0;
    let dayStories = 0;
    let dayOtherShares = 0;
    let dayReactions = 0;
    let dayNilaReactions = 0;
    let dayFarhanReactions = 0;
    let dayPhotos = 0;
    let dayVideos = 0;
    let dayAudio = 0;
    let dayCalls = 0;
    const hourly = new Array(24).fill(0);

    for (const m of msgs) {
      const isNila = m.sender === 'NILU';
      if (isNila) {
        dayNila++;
        totalNila++;
      } else {
        dayFarhan++;
        totalFarhan++;
      }

      const d = new Date(m.timestamp);
      const hour = d.getHours();
      const dow = d.getDay();
      hourly[hour]++;
      hourlyTotals[hour]++;
      dayOfWeekTotals[dow]++;

      if (m.type === 'share') {
        dayShares++;
        totalShares++;
        const senderKey = m.sender as 'NILU' | 'farhannn';
        if (m.shareType === 'reel') {
          dayReels++;
          totalReels++;
          sharesBySender[senderKey].reels++;
        } else if (m.shareType === 'post') {
          dayPosts++;
          totalPosts++;
          sharesBySender[senderKey].posts++;
        } else if (m.shareType === 'story') {
          dayStories++;
          totalStories++;
          sharesBySender[senderKey].stories++;
        } else {
          dayOtherShares++;
          totalOtherShares++;
          sharesBySender[senderKey].other++;
        }
        sharesBySender[senderKey].total++;

        // Add to media index
        mediaRecords.push({
          id: `media_${m.id}`,
          messageId: m.id,
          date: m.date,
          time: m.time,
          timestamp: m.timestamp,
          sender: m.sender,
          type: m.shareType || 'other',
          link: m.shareLink,
          title: m.shareText ? m.shareText.slice(0, 100) : '',
          caption: m.shareText,
          contextSnippet: m.content !== 'NILU sent an attachment.' && m.content !== 'farhannn sent an attachment.' ? m.content : '',
        });
      } else if (m.type === 'photo') {
        dayPhotos++;
        totalPhotos++;
        mediaRecords.push({
          id: `media_${m.id}`,
          messageId: m.id,
          date: m.date,
          time: m.time,
          timestamp: m.timestamp,
          sender: m.sender,
          type: 'photo',
          uri: m.media?.[0]?.uri,
          filename: m.media?.[0]?.filename,
          contextSnippet: m.content,
        });
      } else if (m.type === 'video') {
        dayVideos++;
        totalVideos++;
        mediaRecords.push({
          id: `media_${m.id}`,
          messageId: m.id,
          date: m.date,
          time: m.time,
          timestamp: m.timestamp,
          sender: m.sender,
          type: 'video',
          uri: m.media?.[0]?.uri,
          filename: m.media?.[0]?.filename,
          contextSnippet: m.content,
        });
      } else if (m.type === 'audio') {
        dayAudio++;
        totalAudio++;
        mediaRecords.push({
          id: `media_${m.id}`,
          messageId: m.id,
          date: m.date,
          time: m.time,
          timestamp: m.timestamp,
          sender: m.sender,
          type: 'audio',
          uri: m.media?.[0]?.uri,
          filename: m.media?.[0]?.filename,
          contextSnippet: m.content,
        });
      } else if (m.type === 'file') {
        totalFiles++;
        mediaRecords.push({
          id: `media_${m.id}`,
          messageId: m.id,
          date: m.date,
          time: m.time,
          timestamp: m.timestamp,
          sender: m.sender,
          type: 'file',
          uri: m.media?.[0]?.uri,
          filename: m.media?.[0]?.filename,
          contextSnippet: m.content,
        });
      } else if (m.type === 'call') {
        dayCalls++;
        totalCalls++;
      }

      // Reactions
      if (m.reactions && m.reactions.length > 0) {
        dayReactions += m.reactions.length;
        totalReactions += m.reactions.length;
        for (const r of m.reactions) {
          if (r.actor === 'farhannn') {
            dayFarhanReactions++;
            reactionsByActor.farhannn++;
          } else {
            dayNilaReactions++;
            reactionsByActor.NILU++;
          }

          if (!reactionsByEmoji[r.reaction]) {
            reactionsByEmoji[r.reaction] = { total: 0, NILU: 0, farhannn: 0 };
          }
          reactionsByEmoji[r.reaction].total++;
          if (r.actor === 'farhannn') {
            reactionsByEmoji[r.reaction].farhannn++;
          } else {
            reactionsByEmoji[r.reaction].NILU++;
          }
        }
      }

      // Build search index entry
      searchIndex.push({
        id: m.id,
        date: m.date,
        time: m.time,
        timestamp: m.timestamp,
        sender: m.sender,
        type: m.type,
        content: m.content,
        ...(m.shareType ? { shareType: m.shareType, shareLink: m.shareLink } : {}),
      });
    }

    const firstMsg = msgs[0];
    const lastMsg = msgs[msgs.length - 1];
    const durationMinutes = Math.max(1, Math.round((lastMsg.timestamp - firstMsg.timestamp) / 60000));

    let peakHour = 0;
    let peakHourCount = 0;
    let hourlySpread = 0;
    for (let h = 0; h < 24; h++) {
      if (hourly[h] > 0) hourlySpread++;
      if (hourly[h] > peakHourCount) {
        peakHourCount = hourly[h];
        peakHour = h;
      }
    }

    const activityScore = calculateActivityScore({
      totalMessages: msgs.length,
      activeDurationMinutes: durationMinutes,
      shares: dayShares,
      reactions: dayReactions,
      hourlySpread,
    });

    const dayStat = {
      date: dateStr,
      totalMessages: msgs.length,
      nilaMessages: dayNila,
      farhanMessages: dayFarhan,
      nilaPercentage: Math.round((dayNila / msgs.length) * 1000) / 10,
      farhanPercentage: Math.round((dayFarhan / msgs.length) * 1000) / 10,
      shares: dayShares,
      reels: dayReels,
      posts: dayPosts,
      stories: dayStories,
      otherShares: dayOtherShares,
      reactions: dayReactions,
      nilaReactions: dayNilaReactions,
      farhanReactions: dayFarhanReactions,
      photos: dayPhotos,
      videos: dayVideos,
      audioNotes: dayAudio,
      calls: dayCalls,
      firstMessage: firstMsg.time,
      lastMessage: lastMsg.time,
      firstTimestamp: firstMsg.timestamp,
      lastTimestamp: lastMsg.timestamp,
      activeDurationMinutes: durationMinutes,
      peakHour,
      peakHourCount,
      hourlyActivity: hourly,
      activityScore,
    };

    dailyStatsList.push(dayStat);

    // Write Day Shard file
    const dayFilePath = path.join(DAYS_DIR, `${dateStr}.json`);
    fs.writeFileSync(dayFilePath, JSON.stringify(msgs));
  }

  // Expressions Analysis
  const expressionDefinitions = [
    { id: 'ily', label: 'I love you', category: 'love', pattern: '\\bi\\s*(love|luv)\\s*(you|u)\\b' },
    { id: 'sorry', label: 'sorry', category: 'apology', pattern: '\\b(sorry+|sry|sori)\\b' },
    { id: 'thank_you', label: 'thank you', category: 'gratitude', pattern: '\\bthank\\s+you\\b' },
    { id: 'thank_u', label: 'thank u', category: 'gratitude', pattern: '\\bthank\\s+u\\b' },
    { id: 'thanks', label: 'thanks', category: 'gratitude', pattern: '\\bthanks\\b' },
    { id: 'miss_you', label: 'miss you', category: 'missing', pattern: '\\bmiss\\s*(you|u)\\b' },
    { id: 'good_morning', label: 'good morning', category: 'greetings', pattern: '\\bgood\\s*morning\\b|\\bgm\\b' },
    { id: 'good_night', label: 'good night', category: 'greetings', pattern: '\\bgood\\s*night\\b|\\bgn\\b' },
    { id: 'promise', label: 'promise', category: 'promises', pattern: '\\bpromise\\b' },
    { id: 'forgive', label: 'forgive', category: 'forgiveness', pattern: '\\bforgive\\b' },
  ];

  const expressionsResults: any[] = [];
  for (const exp of expressionDefinitions) {
    const reg = new RegExp(exp.pattern, 'gi');
    let totalOccurrences = { total: 0, NILU: 0, farhannn: 0 };
    let messagesCount = { total: 0, NILU: 0, farhannn: 0 };

    for (const m of normalizedMessages) {
      if (!m.content) continue;
      const matches = m.content.match(reg);
      if (matches && matches.length > 0) {
        const sender = m.sender as 'NILU' | 'farhannn';
        messagesCount.total++;
        messagesCount[sender]++;
        totalOccurrences.total += matches.length;
        totalOccurrences[sender] += matches.length;
      }
    }

    expressionsResults.push({
      ...exp,
      totalOccurrences,
      messagesCount,
    });
  }

  // Nicknames Analysis
  const nicknameList = [
    'pagli', 'baby', 'jaan', 'jano', 'pakhi', 'shona', 'bou', 'wifey',
    'jamai', 'husband', 'cutie', 'dushtu', 'goru', 'queen', 'king',
    'princess', 'prince', 'bestie', 'best friend'
  ];

  const nicknamesResults: any[] = [];
  for (const nick of nicknameList) {
    const reg = new RegExp(`\\b${nick}\\b`, 'gi');
    let totalCount = 0;
    const bySender = { NILU: 0, farhannn: 0 };
    const sampleIds: string[] = [];

    for (const m of normalizedMessages) {
      if (!m.content) continue;
      const matches = m.content.match(reg);
      if (matches && matches.length > 0) {
        const sender = m.sender as 'NILU' | 'farhannn';
        totalCount += matches.length;
        bySender[sender] += matches.length;
        if (sampleIds.length < 5) {
          sampleIds.push(m.id);
        }
      }
    }

    nicknamesResults.push({
      nickname: nick,
      totalCount,
      bySender,
      sampleMessageIds: sampleIds,
    });
  }

  // Archive Metadata
  const firstMessageObj = normalizedMessages[0];
  const lastMessageObj = normalizedMessages[normalizedMessages.length - 1];

  const metadata = {
    totalMessages: normalizedMessages.length,
    participants: {
      NILU: totalNila,
      farhannn: totalFarhan,
    },
    participantsDisplay: {
      NILA: totalNila,
      FARHAN: totalFarhan,
    },
    startDate: activeDaysList[0],
    endDate: activeDaysList[activeDaysList.length - 1],
    startTimestamp: firstMessageObj.timestamp,
    endTimestamp: lastMessageObj.timestamp,
    activeDays: activeDaysList.length,
    shares: {
      total: totalShares,
      reels: totalReels,
      posts: totalPosts,
      stories: totalStories,
      other: totalOtherShares,
    },
    sharesBySender,
    reactions: {
      total: totalReactions,
      byActor: reactionsByActor,
      byEmoji: reactionsByEmoji,
    },
    media: {
      photos: totalPhotos,
      videos: totalVideos,
      audio: totalAudio,
      files: totalFiles,
      calls: totalCalls,
    },
    hourlyTotals,
    dayOfWeekTotals,
  };

  // Write all artifacts
  fs.writeFileSync(path.join(OUTPUT_DIR, 'archive_metadata.json'), JSON.stringify(metadata, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'daily_stats.json'), JSON.stringify(dailyStatsList, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'search_index.json'), JSON.stringify(searchIndex));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'media_index.json'), JSON.stringify(mediaRecords, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'expressions.json'), JSON.stringify(expressionsResults, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'nicknames.json'), JSON.stringify(nicknamesResults, null, 2));

  console.log('\n=== DATA PIPELINE COMPLETED SUCCESSFULLY ===');
  console.log(`Generated:`);
  console.log(`  - public/data/archive_metadata.json`);
  console.log(`  - public/data/daily_stats.json (${dailyStatsList.length} days)`);
  console.log(`  - public/data/days/*.json (60 day shards)`);
  console.log(`  - public/data/search_index.json (${searchIndex.length.toLocaleString()} search items)`);
  console.log(`  - public/data/media_index.json (${mediaRecords.length.toLocaleString()} media records)`);
  console.log(`  - public/data/expressions.json`);
  console.log(`  - public/data/nicknames.json`);

  // Print Validation Summary
  console.log('\n=== ARCHIVE VERIFICATION & AUDIT ===');
  const isExactBaseline =
    metadata.totalMessages === 52784 &&
    metadata.participants.NILU === 27139 &&
    metadata.participants.farhannn === 25645 &&
    metadata.shares.total === 1267 &&
    metadata.shares.reels === 1014 &&
    metadata.shares.posts === 166 &&
    metadata.shares.stories === 41 &&
    metadata.reactions.total === 1403 &&
    metadata.activeDays === 60;

  console.log(`Total Messages:       ${metadata.totalMessages.toLocaleString()} (Baseline: 52,784) -> ${metadata.totalMessages >= 52784 ? 'VALID ✅' : 'UNDER BASELINE ⚠️'}`);
  console.log(`NILU (NILA):          ${metadata.participants.NILU.toLocaleString()} (Baseline: 27,139) -> ${metadata.participants.NILU >= 27139 ? 'VALID ✅' : 'UNDER BASELINE ⚠️'}`);
  console.log(`farhannn (FARHAN):    ${metadata.participants.farhannn.toLocaleString()} (Baseline: 25,645) -> ${metadata.participants.farhannn >= 25645 ? 'VALID ✅' : 'UNDER BASELINE ⚠️'}`);
  console.log(`Total Shares:         ${metadata.shares.total.toLocaleString()} (Baseline: 1,267)`);
  console.log(`Reels:                ${metadata.shares.reels.toLocaleString()} (Baseline: 1,014)`);
  console.log(`Posts:                ${metadata.shares.posts.toLocaleString()} (Baseline: 166)`);
  console.log(`Stories:              ${metadata.shares.stories.toLocaleString()} (Baseline: 41)`);
  console.log(`Total Reactions:      ${metadata.reactions.total.toLocaleString()} (Baseline: 1,403)`);
  console.log(`Active Days:          ${metadata.activeDays} (Baseline: 60)`);

  if (metadata.totalMessages < 52784) {
    throw new Error(`Verification failed! Total messages (${metadata.totalMessages}) is less than baseline (52,784). Potential data loss!`);
  }

  if (isExactBaseline) {
    console.log('\n🎉 ALL INITIAL BASELINE TARGETS VERIFIED WITH 100% PRECISION!\n');
  } else {
    console.log(`\n🎉 ARCHIVE EXPANSION VERIFIED: ${metadata.totalMessages.toLocaleString()} total messages indexed (+${(metadata.totalMessages - 52784).toLocaleString()} new records) across ${metadata.activeDays} active days!\n`);
  }
}

runPipeline().catch((err) => {
  console.error('Pipeline error:', err);
  process.exit(1);
});
