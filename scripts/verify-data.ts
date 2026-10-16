import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'public', 'data');

console.log('=== VERIFYING PROCESSED ARCHIVE DATASETS ===\n');

const metadataPath = path.join(DATA_DIR, 'archive_metadata.json');
const dailyStatsPath = path.join(DATA_DIR, 'daily_stats.json');
const searchIndexPath = path.join(DATA_DIR, 'search_index.json');
const mediaIndexPath = path.join(DATA_DIR, 'media_index.json');
const daysDir = path.join(DATA_DIR, 'days');

if (!fs.existsSync(metadataPath)) {
  console.error('Missing archive_metadata.json! Run npm run build:data first.');
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
const dailyStats = JSON.parse(fs.readFileSync(dailyStatsPath, 'utf-8'));
const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf-8'));
const mediaIndex = JSON.parse(fs.readFileSync(mediaIndexPath, 'utf-8'));
const dayFiles = fs.readdirSync(daysDir).filter((f) => f.endsWith('.json'));

let errors = 0;

function assert(desc: string, actual: any, expected: any) {
  if (actual === expected) {
    console.log(`  PASS: ${desc} = ${actual}`);
  } else {
    console.error(`  FAIL: ${desc} -> got ${actual}, expected ${expected}`);
    errors++;
  }
}

function assertTrue(desc: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`  PASS: ${desc}`);
  } else {
    console.error(`  FAIL: ${desc} ${details ? '(' + details + ')' : ''}`);
    errors++;
  }
}

console.log('1. Checking Authoritative Baseline Values:');
assertTrue('Total Messages > 0', metadata.totalMessages > 0, `Total: ${metadata.totalMessages}`);
assertTrue('Active Days > 0', metadata.activeDays > 0, `Active Days: ${metadata.activeDays}`);
assertTrue('NIHAN messages present', (metadata.participants.NIHAN || 0) > 0);
assertTrue('SUMAIYA messages present', (metadata.participants.SUMAIYA || 0) > 0);
assertTrue('Start and End dates valid', !!metadata.startDate && !!metadata.endDate);

console.log('\n2. Checking Daily Stats Aggregations:');
assert('Daily Stats Count matches Active Days', dailyStats.length, metadata.activeDays);
assert('Day Shards Count matches Active Days', dayFiles.length, metadata.activeDays);

let sumDailyMessages = 0;
let sumDailyShares = 0;
let sumDailyReactions = 0;

for (const day of dailyStats) {
  sumDailyMessages += day.totalMessages;
  sumDailyShares += day.shares;
  sumDailyReactions += day.reactions;
}

assert('Sum of Daily Messages equals Total Messages', sumDailyMessages, metadata.totalMessages);
assert('Sum of Daily Shares equals Total Shares', sumDailyShares, metadata.shares.total);
assert('Sum of Daily Reactions equals Total Reactions', sumDailyReactions, metadata.reactions.total);

console.log('\n3. Checking Search & Media Indices:');
assert('Search Index Length equals Total Messages', searchIndex.length, metadata.totalMessages);
assertTrue('Media Index populated', mediaIndex.length > 0, `Count: ${mediaIndex.length}`);

console.log('\n4. Participant Distribution:');
for (const [p, count] of Object.entries(metadata.participants)) {
  if (typeof count === 'number') {
    const pct = ((count / metadata.totalMessages) * 100).toFixed(1);
    console.log(`  - ${p}: ${count.toLocaleString()} messages (${pct}%)`);
  }
}

if (errors === 0) {
  console.log('\n✅ ALL VERIFICATION CHECKS PASSED WITH 100% PRECISION!\n');
} else {
  console.error(`\n❌ VERIFICATION COMPLETED WITH ${errors} ERROR(S)!\n`);
  process.exit(1);
}
