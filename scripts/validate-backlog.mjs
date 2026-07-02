// Round-trip validator for community/backlog/*.json.
//
// For each non-excluded file: parse, then for each entry in the array, confirm
// that JSON.parse(JSON.stringify(entry)) === entry. Collects ALL failures
// (collect-all per KTD3) and exits 1 only after the report is printed.
//
// Wired into npm run check (npm run backlog:validate) and into the dedicated
// .github/workflows/backlog-validation.yml workflow.

import fs from 'node:fs';
import path from 'node:path';
import { EXCLUDED_FILES } from './backlog-exclusions.mjs';

/**
 * Walk a backlog directory and collect findings. Pure function so the test
 * file can exercise it against fixture directories.
 *
 * @param {{ backlogDir: string }} options
 * @returns {{ findings: Array<{ file: string, index: number|null, id: string|number|null, message: string }> }}
 */
export function run({ backlogDir }) {
  const findings = [];
  const files = fs
    .readdirSync(backlogDir)
    .filter((name) => name.endsWith('.json') && !EXCLUDED_FILES.has(name))
    .sort();

  for (const file of files) {
    const fullPath = path.join(backlogDir, file);
    const raw = fs.readFileSync(fullPath, 'utf8');

    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      findings.push({ file, index: null, id: null, message: `JSON parse failed: ${message}` });
      continue;
    }

    if (!Array.isArray(data)) {
      findings.push({ file, index: null, id: null, message: 'root is not an array' });
      continue;
    }

    data.forEach((entry, index) => {
      const original = JSON.stringify(entry);
      const roundTripped = JSON.stringify(JSON.parse(JSON.stringify(entry)));
      if (original !== roundTripped) {
        const id = entry && typeof entry === 'object' && 'id' in entry ? entry.id : null;
        findings.push({
          file,
          index,
          id,
          message: 'round-trip mismatch (entry does not survive JSON.stringify + JSON.parse)',
        });
      }
    });
  }

  return { findings };
}

function printReport(findings) {
  if (findings.length === 0) {
    console.log('All backlog files are valid JSON and round-trip cleanly.');
    return;
  }

  const byFile = new Map();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }

  console.log(`Found ${findings.length} finding(s) across ${byFile.size} file(s):\n`);
  for (const [file, entries] of byFile) {
    console.log(`  ${file}`);
    for (const e of entries) {
      const where = e.index === null ? '' : ` [entry ${e.index}${e.id !== null ? `, id=${JSON.stringify(e.id)}` : ''}]`;
      console.log(`    ${e.message}${where}`);
    }
    console.log('');
  }
}

function main() {
  const backlogDir = path.resolve('community/backlog');
  const { findings } = run({ backlogDir });
  printReport(findings);
  if (findings.length > 0) {
    process.exit(1);
  }
}

main();