import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MESSAGES_DIR = path.join(ROOT_DIR, 'Messages');
const UPDATES_DIR = path.join(ROOT_DIR, 'Updates');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'data');
const DAYS_DIR = path.join(OUTPUT_DIR, 'days');
const PUBLIC_MEDIA_DIR = path.join(ROOT_DIR, 'public', 'media');

// Ensure output directories exist
fs.mkdirSync(DAYS_DIR, { recursive: true });
['photos', 'audio', 'videos', 'files'].forEach((folder) => {
  fs.mkdirSync(path.join(PUBLIC_MEDIA_DIR, folder), { recursive: true });
});

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
 * Map raw sender to canonical sender ID and clean display name
 */
function resolveSender(rawSender: string, _threadTitle?: string): { senderId: string; senderDisplay: string } {
  const decoded = decodeMojibake(rawSender).trim();

  // Nihan (archive owner)
  if (decoded === 'Ashikul Islam Nihan' || decoded.toLowerCase().includes('nihan')) {
    return { senderId: 'NIHAN', senderDisplay: 'NIHAN' };
  }

  // Sumaiya (primary partner) - thread s_27446236815041740 or s_2318912581852590
  if (decoded === 'S' || decoded === 's.' || decoded.toLowerCase() === 'sumaiya' || decoded.toLowerCase() === 'june_4003') {
    return { senderId: 'SUMAIYA', senderDisplay: 'SUMAIYA' };
  }

  // Hasan - thread s_17908004676092734
  if (decoded.includes('ʜᴀsᴀɴ') || decoded.toLowerCase().includes('hasan')) {
    return { senderId: 'HASAN', senderDisplay: 'HASAN' };
  }

  // Sajid - thread s_17999763557854067
  if (decoded.includes('s ᴀ ᴊ ɪ ᴅ') || decoded.toLowerCase().includes('sajid') || decoded.startsWith('s ᴀ')) {
    return { senderId: 'SAJID', senderDisplay: 'SAJID' };
  }

  // Meta AI bot
  if (decoded === 'Meta AI' || decoded.toLowerCase().includes('meta ai')) {
    return { senderId: 'META_AI', senderDisplay: 'Meta AI' };
  }

  return { senderId: decoded, senderDisplay: decoded };
}

/**
 * Clean thread title for display
 */
function resolveThreadInfo(dirName: string, rawTitle?: string): { threadId: string; threadTitle: string } {
  const title = decodeMojibake(rawTitle || '').trim();
  if (dirName.includes('27446236815041740') || title === 'S') {
    return { threadId: 's_27446236815041740', threadTitle: 'Sumaiya' };
  }
  if (dirName.includes('17908004676092734') || title.includes('ʜᴀsᴀɴ')) {
    return { threadId: 's_17908004676092734', threadTitle: 'Hasan' };
  }
  if (dirName.includes('17999763557854067') || title.includes('s ᴀ ᴊ ɪ ᴅ')) {
    return { threadId: 's_17999763557854067', threadTitle: 'Sajid' };
  }
  if (dirName.includes('2318912581852590') || title === 's.') {
    return { threadId: 's_2318912581852590', threadTitle: 'Sumaiya (Old)' };
  }
  return { threadId: dirName, threadTitle: title || dirName };
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
  const volumeScore = Math.min(50, (stats.totalMessages / 500) * 50);
  const durationScore = Math.min(20, (stats.activeDurationMinutes / 720) * 20);
  const spreadScore = Math.min(15, (stats.hourlySpread / 18) * 15);
  const engagement = stats.shares * 1.5 + stats.reactions * 0.5;
  const engagementScore = Math.min(15, (engagement / 20) * 15);

  const rawScore = volumeScore + durationScore + spreadScore + engagementScore;
  return Math.max(5, Math.min(100, Math.round(rawScore)));
}

/**
 * Extract image dimensions and categorize photo
 */
function getImageMeta(filename?: string): { category: 'screenshot' | 'portrait' | 'aesthetic' | 'memory' | 'other'; dimensions?: { width: number; height: number } } {
  if (!filename) return { category: 'other' };
  const filePath = path.join(ROOT_DIR, 'public', 'media', 'photos', filename);
  if (!fs.existsSync(filePath)) return { category: 'other' };
  try {
    const buf = fs.readFileSync(filePath);
    let width = 0;
    let height = 0;
    let type = '';
    // PNG
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504E47) {
      width = buf.readUInt32BE(16);
      height = buf.readUInt32BE(20);
      type = 'png';
    } else if (buf.length > 4 && buf.readUInt16BE(0) === 0xFFD8) {
      let offset = 2;
      while (offset < buf.length) {
        const marker = buf.readUInt16BE(offset);
        offset += 2;
        if (marker === 0xFFC0 || marker === 0xFFC2) {
          height = buf.readUInt16BE(offset + 3);
          width = buf.readUInt16BE(offset + 5);
          type = 'jpeg';
          break;
        } else if (marker === 0xFFD9 || marker === 0xFFDA) {
          break;
        } else {
          const len = buf.readUInt16BE(offset);
          offset += len;
        }
      }
    }

    if (width > 0 && height > 0) {
      const ratio = height / width;
      let category: 'screenshot' | 'portrait' | 'aesthetic' | 'memory' | 'other' = 'other';
      if (ratio >= 2.05 || (ratio >= 1.9 && type === 'png')) {
        category = 'screenshot';
      } else if (ratio >= 1.25) {
        category = 'portrait';
      } else if (ratio >= 0.85 && ratio <= 1.25) {
        category = 'memory';
      } else if (ratio < 0.85) {
        category = 'aesthetic';
      }
      return { category, dimensions: { width, height } };
    }
  } catch {}
  return { category: 'other' };
}

async function runPipeline() {
  console.log('=== NIHAN ARCHIVE: INGESTION & NORMALIZATION PIPELINE ===\n');

  // Discover all source message files
  const searchDirs = new Set<string>();
  if (fs.existsSync(MESSAGES_DIR)) searchDirs.add(MESSAGES_DIR);
  if (fs.existsSync(UPDATES_DIR)) searchDirs.add(UPDATES_DIR);

  function scanDirectoryRecursively(dir: string, depth = 0) {
    if (depth > 5 || !fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let hasMessageFiles = false;
      let hasMediaFolders = false;

      for (const entry of entries) {
        if (entry.isFile() && entry.name.startsWith('message_') && entry.name.endsWith('.json')) {
          hasMessageFiles = true;
        }
        if (entry.isDirectory() && ['photos', 'audio', 'videos', 'files'].includes(entry.name)) {
          hasMediaFolders = true;
        }
      }

      if (hasMessageFiles || hasMediaFolders) {
        searchDirs.add(dir);
      }

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const lower = entry.name.toLowerCase();
          if (['node_modules', 'dist', 'public', '.git', 'android'].includes(lower)) continue;
          scanDirectoryRecursively(path.join(dir, entry.name), depth + 1);
        }
      }
    } catch {}
  }

  scanDirectoryRecursively(ROOT_DIR, 0);

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

  const filePaths = Array.from(filePathsSet).sort((a, b) => {
    const dirA = path.basename(path.dirname(a));
    const dirB = path.basename(path.dirname(b));
    if (dirA !== dirB) return dirA.localeCompare(dirB);
    const numA = parseInt(path.basename(a).match(/\d+/)?.[0] || '0', 10);
    const numB = parseInt(path.basename(b).match(/\d+/)?.[0] || '0', 10);
    return numA - numB;
  });

  console.log(`Discovered ${filePaths.length} message JSON file(s) across ${searchDirs.size} source directories:`);
  filePaths.forEach((f) => console.log(`  - ${path.relative(ROOT_DIR, f)}`));

  // Collect set of media files present in current updates
  const currentMediaFilenames = new Set<string>();
  const mediaTargets = ['photos', 'audio', 'files', 'videos'];

  // Clean sync: copy all active media from source directories to public/media
  for (const dir of searchDirs) {
    for (const sub of mediaTargets) {
      const srcSub = path.join(dir, sub);
      const destSub = path.join(ROOT_DIR, 'public', 'media', sub);
      if (fs.existsSync(srcSub)) {
        fs.mkdirSync(destSub, { recursive: true });
        const mediaFiles = fs.readdirSync(srcSub);
        let copied = 0;
        for (const mf of mediaFiles) {
          currentMediaFilenames.add(mf);
          const destFile = path.join(destSub, mf);
          const srcFile = path.join(srcSub, mf);
          if (!fs.existsSync(destFile)) {
            fs.copyFileSync(srcFile, destFile);
            copied++;
          } else {
            const srcSize = fs.statSync(srcFile).size;
            const destSize = fs.statSync(destFile).size;
            if (srcSize > destSize) {
              fs.copyFileSync(srcFile, destFile);
              copied++;
            }
          }
        }
        if (copied > 0) {
          console.log(`Synced ${copied} new/updated ${sub} files from ${path.basename(dir)} into public/media/${sub}`);
        }
      }
    }
  }

  // Purge any orphan media from previous versions that is no longer in updates
  for (const sub of mediaTargets) {
    const destSub = path.join(ROOT_DIR, 'public', 'media', sub);
    if (fs.existsSync(destSub)) {
      const existing = fs.readdirSync(destSub);
      let purged = 0;
      for (const file of existing) {
        if (!currentMediaFilenames.has(file)) {
          try {
            fs.unlinkSync(path.join(destSub, file));
            purged++;
          } catch {}
        }
      }
      if (purged > 0) {
        console.log(`Purged ${purged} obsolete ${sub} files from public/media/${sub}`);
      }
    }
  }

  // Read and parse all raw messages
  const rawEntries: { source: string; threadId: string; threadTitle: string; msg: any }[] = [];

  for (const filePath of filePaths) {
    const dirName = path.basename(path.dirname(filePath));
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const parts = parseConcatenatedJson(content);
    console.log(`Loaded ${dirName}/${fileName}: parsed ${parts.length} JSON part(s)`);

    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
      const threadInfo = resolveThreadInfo(dirName, parts[pIdx].title);
      const msgs = parts[pIdx].messages || [];
      console.log(`  - Part ${pIdx + 1} (${threadInfo.threadTitle}): ${msgs.length.toLocaleString()} messages`);
      for (const m of msgs) {
        rawEntries.push({
          source: `${dirName}/${fileName}#p${pIdx + 1}`,
          threadId: threadInfo.threadId,
          threadTitle: threadInfo.threadTitle,
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
    const rawSender = raw.sender_name || 'UNKNOWN';
    const { senderId, senderDisplay } = resolveSender(rawSender, entry.threadTitle);

    const timestamp = Number(raw.timestamp_ms);
    const contentRaw = raw.content || '';
    const content = decodeMojibake(contentRaw)
      .replace(/\bfarhan\b/gi, (match) => match[0] === 'F' ? 'Nihan' : 'nihan');

    const shareLink = raw.share?.link || '';
    const shareText = decodeMojibake(raw.share?.share_text || '')
      .replace(/\bfarhan\b/gi, (match) => match[0] === 'F' ? 'Nihan' : 'nihan');

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
        const rawActor = decodeMojibake(r.actor);
        const actorResolved = resolveSender(rawActor, entry.threadTitle);
        reactions.push({
          reaction: decodedReaction,
          actor: actorResolved.senderId,
          actorDisplay: actorResolved.senderDisplay,
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
      threadId: entry.threadId,
      threadTitle: entry.threadTitle,
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
  const participantCounts: Record<string, number> = {};
  const participantDisplayCounts: Record<string, number> = {};
  let totalShares = 0;
  let totalReels = 0;
  let totalPosts = 0;
  let totalStories = 0;
  let totalOtherShares = 0;
  let totalReactions = 0;
  const reactionsByActor: Record<string, number> = {};
  const reactionsByEmoji: Record<string, { total: number; [actor: string]: number }> = {};
  const sharesBySender: Record<string, { total: number; reels: number; posts: number; stories: number; other: number }> = {};
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

  // Clear old day shards in public/data/days
  if (fs.existsSync(DAYS_DIR)) {
    const existingShards = fs.readdirSync(DAYS_DIR);
    for (const sh of existingShards) {
      if (sh.endsWith('.json')) {
        fs.unlinkSync(path.join(DAYS_DIR, sh));
      }
    }
  }

  // Process Each Day
  for (const [dateStr, msgs] of dayGroups.entries()) {
    let dayNihan = 0;
    let daySumaiya = 0;
    let dayOther = 0;
    let dayShares = 0;
    let dayReels = 0;
    let dayPosts = 0;
    let dayStories = 0;
    let dayOtherShares = 0;
    let dayReactions = 0;
    let dayNihanReactions = 0;
    let daySumaiyaReactions = 0;
    let dayPhotos = 0;
    let dayVideos = 0;
    let dayAudio = 0;
    let dayCalls = 0;
    const hourly = new Array(24).fill(0);

    for (const m of msgs) {
      const sender = m.sender;
      participantCounts[sender] = (participantCounts[sender] || 0) + 1;
      participantDisplayCounts[m.senderDisplay] = (participantDisplayCounts[m.senderDisplay] || 0) + 1;

      if (sender === 'NIHAN') {
        dayNihan++;
      } else if (sender === 'SUMAIYA') {
        daySumaiya++;
      } else {
        dayOther++;
      }

      const d = new Date(m.timestamp);
      const hour = d.getHours();
      const dow = d.getDay();
      hourly[hour]++;
      hourlyTotals[hour]++;
      dayOfWeekTotals[dow]++;

      if (!sharesBySender[sender]) {
        sharesBySender[sender] = { total: 0, reels: 0, posts: 0, stories: 0, other: 0 };
      }

      if (m.type === 'share') {
        dayShares++;
        totalShares++;
        if (m.shareType === 'reel') {
          dayReels++;
          totalReels++;
          sharesBySender[sender].reels++;
        } else if (m.shareType === 'post') {
          dayPosts++;
          totalPosts++;
          sharesBySender[sender].posts++;
        } else if (m.shareType === 'story') {
          dayStories++;
          totalStories++;
          sharesBySender[sender].stories++;
        } else {
          dayOtherShares++;
          totalOtherShares++;
          sharesBySender[sender].other++;
        }
        sharesBySender[sender].total++;

        // Add to media index
        mediaRecords.push({
          id: `media_${m.id}`,
          messageId: m.id,
          date: m.date,
          time: m.time,
          timestamp: m.timestamp,
          sender: m.sender,
          threadTitle: m.threadTitle,
          type: m.shareType || 'other',
          link: m.shareLink,
          title: m.shareText ? m.shareText.slice(0, 100) : '',
          caption: m.shareText,
          contextSnippet: m.content && !/sent an attachment/i.test(m.content) ? m.content : '',
        });
      } else if (m.type === 'photo') {
        dayPhotos++;
        totalPhotos++;
        const filename = m.media?.[0]?.filename;
        const meta = getImageMeta(filename);
        mediaRecords.push({
          id: `media_${m.id}`,
          messageId: m.id,
          date: m.date,
          time: m.time,
          timestamp: m.timestamp,
          sender: m.sender,
          threadTitle: m.threadTitle,
          type: 'photo',
          uri: m.media?.[0]?.uri,
          filename,
          contextSnippet: m.content,
          category: meta.category,
          dimensions: meta.dimensions,
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
          threadTitle: m.threadTitle,
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
          threadTitle: m.threadTitle,
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
          threadTitle: m.threadTitle,
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
          const act = r.actor;
          reactionsByActor[act] = (reactionsByActor[act] || 0) + 1;
          if (act === 'NIHAN') dayNihanReactions++;
          else if (act === 'SUMAIYA') daySumaiyaReactions++;

          if (!reactionsByEmoji[r.reaction]) {
            reactionsByEmoji[r.reaction] = { total: 0 };
          }
          reactionsByEmoji[r.reaction].total++;
          reactionsByEmoji[r.reaction][act] = (reactionsByEmoji[r.reaction][act] || 0) + 1;
        }
      }

      // Build search index entry
      searchIndex.push({
        id: m.id,
        date: m.date,
        time: m.time,
        timestamp: m.timestamp,
        sender: m.sender,
        senderDisplay: m.senderDisplay,
        threadTitle: m.threadTitle,
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
      nihanMessages: dayNihan,
      sumaiyaMessages: daySumaiya,
      otherMessages: dayOther,
      nihanPercentage: Math.round((dayNihan / msgs.length) * 1000) / 10,
      sumaiyaPercentage: Math.round((daySumaiya / msgs.length) * 1000) / 10,
      shares: dayShares,
      reels: dayReels,
      posts: dayPosts,
      stories: dayStories,
      otherShares: dayOtherShares,
      reactions: dayReactions,
      nihanReactions: dayNihanReactions,
      sumaiyaReactions: daySumaiyaReactions,
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
    { id: 'ily', label: 'love / ily', category: 'love', pattern: '\\b(love|valobashi|valo\\s*bashi|luv|ily)\\b' },
    { id: 'cute', label: 'cute / cutie', category: 'affection', pattern: '\\b(cute|cutie|cutes)\\b' },
    { id: 'sundor', label: 'sundor', category: 'affection', pattern: '\\b(sundor|shundor|beautiful|pretty)\\b' },
    { id: 'sorry', label: 'sorry', category: 'apology', pattern: '\\b(sorry+|sry|sori|dukkito)\\b' },
    { id: 'thank_you', label: 'thank you', category: 'gratitude', pattern: '\\b(thank\\s*you+|thanks|thank\\s*u|dhonnobad)\\b' },
    { id: 'miss_you', label: 'miss you', category: 'missing', pattern: '\\bmiss\\s*(you|u|ing)?\\b' },
    { id: 'good_morning', label: 'good morning', category: 'greetings', pattern: '\\bgood\\s*morning\\b|\\bgm\\b' },
    { id: 'good_night', label: 'good night', category: 'greetings', pattern: '\\bgood\\s*night\\b|\\bgn\\b' },
    { id: 'coffee', label: 'coffee', category: 'comfort', pattern: '\\b(coffee|cha|tea)\\b' },
    { id: 'promise', label: 'promise', category: 'promises', pattern: '\\b(promise|kotha\\s*dilam)\\b' },
  ];

  const expressionsResults: any[] = [];
  for (const exp of expressionDefinitions) {
    const reg = new RegExp(exp.pattern, 'gi');
    let totalOccurrences: Record<string, number> = { total: 0 };
    let messagesCount: Record<string, number> = { total: 0 };

    for (const m of normalizedMessages) {
      if (!m.content) continue;
      const matches = m.content.match(reg);
      if (matches && matches.length > 0) {
        const sender = m.sender;
        messagesCount.total++;
        messagesCount[sender] = (messagesCount[sender] || 0) + 1;
        totalOccurrences.total += matches.length;
        totalOccurrences[sender] = (totalOccurrences[sender] || 0) + matches.length;
      }
    }

    expressionsResults.push({
      ...exp,
      totalOccurrences: {
        total: totalOccurrences.total,
        NIHAN: totalOccurrences.NIHAN || 0,
        SUMAIYA: totalOccurrences.SUMAIYA || 0,
        ...totalOccurrences,
      },
      messagesCount: {
        total: messagesCount.total,
        NIHAN: messagesCount.NIHAN || 0,
        SUMAIYA: messagesCount.SUMAIYA || 0,
        ...messagesCount,
      },
    });
  }

  // Nicknames Analysis
  const nicknameList = [
    'penguin', 'bauni', 'landmark', 'historical landmark', 'sumaiya', 'nihan',
    'babu', 'baby', 'jaan', 'shona', 'bou', 'pagli', 'pagol',
    'cute', 'cutie', 'queen', 'king', 'bestie', 'friend'
  ];

  const nicknamesResults: any[] = [];
  for (const nick of nicknameList) {
    const reg = new RegExp(`\\b${nick}\\b`, 'gi');
    let totalCount = 0;
    const bySender: Record<string, number> = { NIHAN: 0, SUMAIYA: 0 };
    const sampleIds: string[] = [];

    for (const m of normalizedMessages) {
      if (!m.content) continue;
      const matches = m.content.match(reg);
      if (matches && matches.length > 0) {
        const sender = m.sender;
        totalCount += matches.length;
        bySender[sender] = (bySender[sender] || 0) + matches.length;
        if (sampleIds.length < 5) {
          sampleIds.push(m.id);
        }
      }
    }

    nicknamesResults.push({
      nickname: nick,
      totalCount,
      bySender: {
        NIHAN: bySender.NIHAN || 0,
        SUMAIYA: bySender.SUMAIYA || 0,
        ...bySender,
      },
      sampleMessageIds: sampleIds,
    });
  }

  // Archive Metadata
  const firstMessageObj = normalizedMessages[0];
  const lastMessageObj = normalizedMessages[normalizedMessages.length - 1];

  const metadata = {
    archiveTitle: "NIHAN'S ARCHIVE",
    totalMessages: normalizedMessages.length,
    primaryCouple: {
      partner1: 'SUMAIYA',
      partner2: 'NIHAN',
    },
    participants: {
      NIHAN: participantCounts.NIHAN || 0,
      SUMAIYA: participantCounts.SUMAIYA || 0,
      ...participantCounts,
    },
    participantsDisplay: {
      NIHAN: participantDisplayCounts.NIHAN || 0,
      SUMAIYA: participantDisplayCounts.SUMAIYA || 0,
      ...participantDisplayCounts,
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
  console.log(`  - public/data/days/*.json (${dailyStatsList.length} day shards)`);
  console.log(`  - public/data/search_index.json (${searchIndex.length.toLocaleString()} search items)`);
  console.log(`  - public/data/media_index.json (${mediaRecords.length.toLocaleString()} media records)`);
  console.log(`  - public/data/expressions.json`);
  console.log(`  - public/data/nicknames.json`);

  // Verification Summary
  console.log('\n=== ARCHIVE VERIFICATION & AUDIT ===');
  console.log(`Total Messages:       ${metadata.totalMessages.toLocaleString()}`);
  console.log(`NIHAN:                ${(participantCounts.NIHAN || 0).toLocaleString()} (${(((participantCounts.NIHAN || 0) / metadata.totalMessages) * 100).toFixed(1)}%)`);
  console.log(`SUMAIYA:              ${(participantCounts.SUMAIYA || 0).toLocaleString()} (${(((participantCounts.SUMAIYA || 0) / metadata.totalMessages) * 100).toFixed(1)}%)`);
  if (participantCounts.HASAN) {
    console.log(`HASAN:                ${participantCounts.HASAN.toLocaleString()}`);
  }
  if (participantCounts.SAJID) {
    console.log(`SAJID:                ${participantCounts.SAJID.toLocaleString()}`);
  }
  console.log(`Total Shares:         ${metadata.shares.total.toLocaleString()} (Reels: ${metadata.shares.reels}, Posts: ${metadata.shares.posts}, Stories: ${metadata.shares.stories}, Other: ${metadata.shares.other})`);
  console.log(`Total Reactions:      ${metadata.reactions.total.toLocaleString()}`);
  console.log(`Active Days:          ${metadata.activeDays} days (${metadata.startDate} to ${metadata.endDate})`);

  if (metadata.totalMessages === 0) {
    throw new Error('Verification failed! 0 messages were processed.');
  }

  console.log(`\n🎉 UNIFIED ARCHIVE TARGET VERIFIED: ${metadata.totalMessages.toLocaleString()} total messages indexed across ${metadata.activeDays} active days!\n`);
}

runPipeline().catch((err) => {
  console.error('Pipeline error:', err);
  process.exit(1);
});
