import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'community', 'content');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json') && !f.includes('test'));

let totalRemoved = 0;

files.forEach(file => {
  const filePath = path.join(contentDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  try {
    const data = JSON.parse(content);
    
    if (Array.isArray(data)) {
      const original = data.length;
      const unique = [...new Set(data)];
      const removed = original - unique.length;
      
      if (removed > 0) {
        fs.writeFileSync(filePath, JSON.stringify(unique, null, 2) + '\n', 'utf8');
        console.log(`${file}: removed ${removed} duplicate(s) (${original} → ${unique.length})`);
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
