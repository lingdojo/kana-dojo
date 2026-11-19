import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'community', 'content');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json') && !f.includes('test'));

// `--check` reports what is duplicated without touching the files, so a CI job
// can fail on a duplicate instead of waiting for someone to run the script.
const checkOnly = process.argv.includes('--check');

let totalRemoved = 0;

/**
 * A key that identifies an entry by its content, not by its identity.
 *
 * `new Set(data)` compares objects by reference, so two structurally identical
 * questions were never equal and every duplicate survived: the script printed
 * "no duplicates found" on files that held them. Serialising with sorted keys
 * also makes two entries that differ only in property order read as one.
 */
const contentKey = value => {
  if (Array.isArray(value)) {
    return `[${value.map(contentKey).join(',')}]`;
  }

  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${contentKey(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
};

files.forEach(file => {
  const filePath = path.join(contentDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  try {
    const data = JSON.parse(content);
    
    if (Array.isArray(data)) {
      const original = data.length;
      const seen = new Set();
      const unique = data.filter(entry => {
        const key = contentKey(entry);

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });
      const removed = original - unique.length;
      
      if (removed > 0) {
        if (checkOnly) {
          console.log(`${file}: ${removed} duplicate(s) (${original} → ${unique.length})`);
        } else {
          fs.writeFileSync(filePath, JSON.stringify(unique, null, 2) + '\n', 'utf8');
          console.log(`${file}: removed ${removed} duplicate(s) (${original} → ${unique.length})`);
        }
        totalRemoved += removed;
      } else {
        console.log(`${file}: no duplicates found`);
      }
    } else if (typeof data === 'object') {
      console.log(`${file}: skipped (object, not array)`);
    }
  } catch (e) {
    console.error(`${file}: error - ${e.message}`);
  }
});

console.log(`\nTotal duplicates removed: ${totalRemoved}`);

if (checkOnly) {
  if (totalRemoved > 0) {
    console.error(`\n${totalRemoved} duplicate entr${totalRemoved === 1 ? 'y' : 'ies'} found. Run \`node scripts/deduplicate-content.js\` to remove them.`);
    process.exitCode = 1;
  } else {
    console.log('No duplicates: every content file holds unique entries.');
  }
}
