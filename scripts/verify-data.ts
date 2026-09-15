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
const daysDir = path.join(DATA_DIR, 'days');

if (!fs.existsSync(metadataPath)) {
  console.error('Missing archive_metadata.json! Run npm run build:data first.');
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
const dailyStats = JSON.parse(fs.readFileSync(dailyStatsPath, 'utf-8'));
const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf-8'));
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

console.log('1. Checking Authoritative Baseline Values:');
assert('Total Messages', metadata.totalMessages, 66472);
assert('NILU Messages', metadata.participants.NILU, 34179);
assert('farhannn Messages', metadata.participants.farhannn, 32293);
assert('Total Shares', metadata.shares.total, 1652);
assert('Reels', metadata.shares.reels, 1325);
assert('Posts', metadata.shares.posts, 230);
assert('Stories', metadata.shares.stories, 44);
assert('Total Reactions', metadata.reactions.total, 1929);
assert('Active Days', metadata.activeDays, 71);

console.log('\n2. Checking Daily Stats Aggregations:');
assert('Daily Stats Count', dailyStats.length, 71);
assert('Day Shards Count', dayFiles.length, 71);

let sumDailyMessages = 0;
let sumDailyShares = 0;
let sumDailyReactions = 0;

for (const day of dailyStats) {
  sumDailyMessages += day.totalMessages;
  sumDailyShares += day.shares;
  sumDailyReactions += day.reactions;
}

assert('Sum of Daily Messages equals Total', sumDailyMessages, 66472);
assert('Sum of Daily Shares equals Total Shares', sumDailyShares, 1652);
assert('Sum of Daily Reactions equals Total Reactions', sumDailyReactions, 1929);

console.log('\n3. Checking Search Index:');
assert('Search Index Length', searchIndex.length, 66472);

if (errors === 0) {
  console.log('\n✅ ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
} else {
  console.error(`\n❌ VERIFICATION COMPLETED WITH ${errors} ERROR(S)!\n`);
  process.exit(1);
}
