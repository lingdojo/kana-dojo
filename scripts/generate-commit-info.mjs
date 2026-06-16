import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '..', 'shared', 'data', 'commitInfo.json');

try {
  const hash = execSync('git log -1 --format=%H', { encoding: 'utf-8' }).trim();
  const date = execSync('git log -1 --format=%ai', { encoding: 'utf-8' }).trim();
  const subject = execSync('git log -1 --format=%s', { encoding: 'utf-8' }).trim();
  const body = execSync('git log -1 --format=%b', { encoding: 'utf-8' }).trim();

  const commitInfo = { hash, date, subject, body };

  writeFileSync(outputPath, JSON.stringify(commitInfo, null, 2), 'utf-8');
  console.log(`✅ Generated commitInfo.json: ${hash}`);
} catch (error) {
  console.warn('⚠️ Could not generate commitInfo.json (not a git repo or git not available)');
  writeFileSync(outputPath, JSON.stringify({
    hash: 'unknown',
    date: new Date().toISOString(),
    subject: 'unknown',
    body: '',
  }, null, 2), 'utf-8');
}
