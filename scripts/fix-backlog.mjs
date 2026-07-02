// One-time canonicalization of community/backlog/*.json.
//
// For each non-excluded file: parse, re-emit with 2-space indent + trailing
// newline. Files that don't parse abort the whole script (no writes).
//
// Local-only: do NOT chain into npm run check; do NOT invoke from a workflow.
// Run on a workstation before commit 2 of the JSON-escape fix PR.
//
// Prototype-pollution safety: JSON.parse(JSON.stringify(...)) drops
// __proto__/constructor/prototype keys since they are not JSON-stringifiable
// as object properties.

import fs from 'node:fs';
import path from 'node:path';
import { EXCLUDED_FILES } from './backlog-exclusions.mjs';

const backlogDir = path.resolve('community/backlog');

function main() {
  const files = fs
    .readdirSync(backlogDir)
    .filter((name) => name.endsWith('.json') && !EXCLUDED_FILES.has(name))
    .sort();

  if (files.length === 0) {
    console.error(`No backlog files found in ${backlogDir}`);
    process.exit(1);
  }

  console.log(`Scanning ${files.length} file(s) in ${backlogDir}`);

  // First pass: parse every file. If any fails, abort with no writes.
  const parsed = [];
  for (const file of files) {
    const fullPath = path.join(backlogDir, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`PARSE-FAIL: ${file} - ${message}`);
      process.exit(1);
    }
    if (!Array.isArray(data)) {
      console.error(`NOT-ARRAY: ${file} (root is not an array)`);
      process.exit(1);
    }
    parsed.push({ file, fullPath, raw, data });
  }

  // Second pass: re-emit. Track which files actually change so the maintainer
  // can review the diff.
  let changed = 0;
  let unchanged = 0;
  for (const { file, fullPath, raw, data } of parsed) {
    const emitted = JSON.stringify(data, null, 2) + '\n';
    if (emitted === raw) {
      unchanged += 1;
      continue;
    }
    fs.writeFileSync(fullPath, emitted);
    changed += 1;
    console.log(`Rewrote: ${file}`);
  }

  console.log(`Done. Changed: ${changed}, Unchanged: ${unchanged}`);
}

main();