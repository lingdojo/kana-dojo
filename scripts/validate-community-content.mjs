/**
 * validate-community-content.mjs
 *
 * Validates all JSON files in community/content/ and community/backlog/
 * against their expected schemas. Catches the most common contribution
 * mistakes: wrong field names, wrong types, duplicate IDs, and invalid
 * oklch color values in themes.
 *
 * Run with: npm run community:validate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'community', 'content');
const BACKLOG_DIR = path.join(ROOT, 'community', 'backlog');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function err(errors, file, index, message) {
  errors.push({ file, index, message });
}

function requireFields(errors, file, index, entry, fields) {
  for (const { name, type } of fields) {
    if (!(name in entry)) {
      err(errors, file, index, `Missing required field "${name}"`);
    } else if (type === 'array' && !Array.isArray(entry[name])) {
      err(errors, file, index, `Field "${name}" must be an array`);
    } else if (type !== 'array' && typeof entry[name] !== type) {
      err(errors, file, index, `Field "${name}" must be of type ${type}, got ${typeof entry[name]}`);
    }
  }
}

const OKLCH_REGEX = /^oklch\(\s*[\d.]+%\s+[\d.]+\s+[\d.]+\s*\/\s*[\d.]+\s*\)$/;
const isOklch = value => typeof value === 'string' && OKLCH_REGEX.test(value);

// ─── Schema validators ────────────────────────────────────────────────────────

function validateTrivia(data, file, errors) {
  if (!Array.isArray(data)) { err(errors, file, null, 'Root must be a JSON array'); return; }
  const seenQuestions = new Set();
  data.forEach((entry, i) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      err(errors, file, i, 'Entry must be an object'); return;
    }
    requireFields(errors, file, i, entry, [
      { name: 'question', type: 'string' },
      { name: 'difficulty', type: 'string' },
      { name: 'answers', type: 'array' },
      { name: 'correctIndex', type: 'number' },
    ]);
    if (Array.isArray(entry.answers)) {
      if (entry.answers.length !== 4)
        err(errors, file, i, `"answers" must have exactly 4 items, got ${entry.answers.length}`);
      entry.answers.forEach((a, ai) => {
        if (typeof a !== 'string') err(errors, file, i, `"answers[${ai}]" must be a string`);
      });
    }
    if (typeof entry.correctIndex === 'number' && (entry.correctIndex < 0 || entry.correctIndex > 3))
      err(errors, file, i, `"correctIndex" must be 0-3, got ${entry.correctIndex}`);
    if (typeof entry.question === 'string') {
      if (seenQuestions.has(entry.question)) err(errors, file, i, `Duplicate question: "${entry.question}"`);
      seenQuestions.add(entry.question);
    }
  });
}

function validateThemes(data, file, errors) {
  if (!Array.isArray(data)) { err(errors, file, null, 'Root must be a JSON array'); return; }
  const seenIds = new Set();
  data.forEach((entry, i) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      err(errors, file, i, 'Entry must be an object'); return;
    }
    requireFields(errors, file, i, entry, [
      { name: 'id', type: 'string' },
      { name: 'backgroundColor', type: 'string' },
      { name: 'mainColor', type: 'string' },
      { name: 'secondaryColor', type: 'string' },
    ]);
    for (const colorField of ['backgroundColor', 'mainColor', 'secondaryColor']) {
      if (typeof entry[colorField] === 'string' && !isOklch(entry[colorField]))
        err(errors, file, i, `"${colorField}" must use oklch() format, got "${entry[colorField]}"`);
    }
    if (typeof entry.id === 'string') {
      if (seenIds.has(entry.id)) err(errors, file, i, `Duplicate theme id: "${entry.id}"`);
      seenIds.add(entry.id);
    }
  });
}

function validateStringArray(data, file, errors) {
  if (!Array.isArray(data)) { err(errors, file, null, 'Root must be a JSON array'); return; }
  const seen = new Set();
  data.forEach((entry, i) => {
    if (typeof entry !== 'string') {
      err(errors, file, i, `Entry must be a string, got ${typeof entry}. Did you accidentally add an object?`);
      return;
    }
    if (seen.has(entry)) err(errors, file, i, `Duplicate entry: "${entry.slice(0, 60)}"`);
    seen.add(entry);
  });
}

function validateHaiku(data, file, errors) {
  if (!Array.isArray(data)) { err(errors, file, null, 'Root must be a JSON array'); return; }
  const seenJapanese = new Set();
  data.forEach((entry, i) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      err(errors, file, i, 'Entry must be an object'); return;
    }
    requireFields(errors, file, i, entry, [
      { name: 'japanese', type: 'string' },
      { name: 'romaji', type: 'string' },
      { name: 'english', type: 'string' },
      { name: 'poet', type: 'string' },
      { name: 'season', type: 'string' },
      { name: 'kigo', type: 'string' },
    ]);
    if (typeof entry.japanese === 'string') {
      if (seenJapanese.has(entry.japanese))
        err(errors, file, i, `Duplicate haiku: "${entry.japanese.slice(0, 30)}"`);
      seenJapanese.add(entry.japanese);
    }
  });
}

function validateEtiquette(data, file, errors) {
  if (!Array.isArray(data)) { err(errors, file, null, 'Root must be a JSON array'); return; }
  data.forEach((entry, i) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      err(errors, file, i, 'Entry must be an object'); return;
    }
    requireFields(errors, file, i, entry, [
      { name: 'situation', type: 'string' },
      { name: 'do', type: 'string' },
      { name: 'dont', type: 'string' },
      { name: 'note', type: 'string' },
    ]);
  });
}

function validateQuotes(data, file, errors, extraField) {
  if (!Array.isArray(data)) { err(errors, file, null, 'Root must be a JSON array'); return; }
  const seenJapanese = new Set();
  data.forEach((entry, i) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      err(errors, file, i, 'Entry must be an object'); return;
    }
    requireFields(errors, file, i, entry, [
      { name: 'japanese', type: 'string' },
      { name: 'romaji', type: 'string' },
      { name: 'english', type: 'string' },
      { name: extraField, type: 'string' },
      { name: 'character', type: 'string' },
    ]);
    if (typeof entry.japanese === 'string') {
      if (seenJapanese.has(entry.japanese))
        err(errors, file, i, `Duplicate quote: "${entry.japanese.slice(0, 40)}"`);
      seenJapanese.add(entry.japanese);
    }
  });
}

function validateObjectArray(data, file, errors, fields) {
  if (!Array.isArray(data)) { err(errors, file, null, 'Root must be a JSON array'); return; }
  data.forEach((entry, i) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      err(errors, file, i, 'Entry must be an object'); return;
    }
    requireFields(errors, file, i, entry, fields);
  });
}

function validateCommunityNotesBacklog(data, file, errors) {
  if (!Array.isArray(data)) { err(errors, file, null, 'Root must be a JSON array'); return; }
  const seenIds = new Set();
  data.forEach((entry, i) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      err(errors, file, i, 'Entry must be an object'); return;
    }
    requireFields(errors, file, i, entry, [
      { name: 'id', type: 'number' },
      { name: 'file', type: 'string' },
      { name: 'position', type: 'string' },
      { name: 'text', type: 'string' },
      { name: 'issued', type: 'boolean' },
      { name: 'completed', type: 'boolean' },
    ]);
    if (typeof entry.id === 'number') {
      if (seenIds.has(entry.id)) err(errors, file, i, `Duplicate id: ${entry.id}`);
      seenIds.add(entry.id);
    }
  });
}

// ─── File → validator map ─────────────────────────────────────────────────────

const FILE_VALIDATORS = {
  'japan-trivia-easy.json':           (d, f, e) => validateTrivia(d, f, e),
  'japan-trivia-medium.json':         (d, f, e) => validateTrivia(d, f, e),
  'japan-trivia-hard.json':           (d, f, e) => validateTrivia(d, f, e),
  'community-themes.json':            (d, f, e) => validateThemes(d, f, e),
  'japanese-grammar.json':            (d, f, e) => validateStringArray(d, f, e),
  'japan-facts.json':                 (d, f, e) => validateStringArray(d, f, e),
  'japanese-haiku.json':              (d, f, e) => validateHaiku(d, f, e),
  'japanese-cultural-etiquette.json': (d, f, e) => validateEtiquette(d, f, e),
  'japanese-videogame-quotes.json':   (d, f, e) => validateQuotes(d, f, e, 'game'),
  'anime-quotes.json':                (d, f, e) => validateQuotes(d, f, e, 'anime'),
  'japanese-proverbs.json':           (d, f, e) => validateObjectArray(d, f, e, [
    { name: 'japanese', type: 'string' }, { name: 'romaji', type: 'string' },
    { name: 'english', type: 'string' },  { name: 'meaning', type: 'string' },
  ]),
  'japanese-idioms.json':             (d, f, e) => validateObjectArray(d, f, e, [
    { name: 'japanese', type: 'string' }, { name: 'romaji', type: 'string' },
    { name: 'english', type: 'string' },  { name: 'meaning', type: 'string' },
  ]),
  'japanese-false-friends.json':      (d, f, e) => validateObjectArray(d, f, e, [
    { name: 'termA', type: 'string' }, { name: 'termB', type: 'string' },
    { name: 'explanation', type: 'string' }, { name: 'example', type: 'string' },
  ]),
  'japanese-regional-dialects.json':  (d, f, e) => validateObjectArray(d, f, e, [
    { name: 'dialect', type: 'string' }, { name: 'standardJapanese', type: 'string' },
    { name: 'english', type: 'string' }, { name: 'region', type: 'string' },
    { name: 'note', type: 'string' },
  ]),
  'japanese-example-sentences.json':  (d, f, e) => validateObjectArray(d, f, e, [
    { name: 'japanese', type: 'string' }, { name: 'romaji', type: 'string' },
    { name: 'english', type: 'string' },  { name: 'jlpt', type: 'string' },
  ]),
  'japanese-tech-vocabulary.json':    (d, f, e) => validateObjectArray(d, f, e, [
    { name: 'japanese', type: 'string' }, { name: 'kana', type: 'string' },
    { name: 'english', type: 'string' },  { name: 'category', type: 'string' },
  ]),
  'japanese-common-mistakes.json':    (d, f, e) => validateObjectArray(d, f, e, [
    { name: 'wrong', type: 'string' }, { name: 'correct', type: 'string' },
    { name: 'explanation', type: 'string' },
  ]),
};

const BACKLOG_VALIDATORS = {
  'community-notes-backlog.json': (d, f, e) => validateCommunityNotesBacklog(d, f, e),
};

// ─── Runner ───────────────────────────────────────────────────────────────────

function runValidations(dir, validators) {
  const errors = [];
  for (const [filename, validator] of Object.entries(validators)) {
    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠  File not found, skipping: ${filename}`);
      continue;
    }
    let data;
    try {
      data = loadJson(filePath);
    } catch (parseError) {
      errors.push({ file: filename, index: null, message: `JSON parse error: ${parseError.message}` });
      continue;
    }
    validator(data, filename, errors);
  }
  return errors;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('🔍 Validating community content...\n');

const allErrors = [
  ...runValidations(CONTENT_DIR, FILE_VALIDATORS),
  ...runValidations(BACKLOG_DIR, BACKLOG_VALIDATORS),
];

if (allErrors.length === 0) {
  console.log('✅ All community content files are valid!\n');
  process.exit(0);
}

console.error(`❌ Found ${allErrors.length} validation error(s):\n`);

const byFile = allErrors.reduce((acc, e) => {
  if (!acc[e.file]) acc[e.file] = [];
  acc[e.file].push(e);
  return acc;
}, {});

for (const [file, fileErrors] of Object.entries(byFile)) {
  console.error(`  📄 ${file}`);
  for (const e of fileErrors) {
    const loc = e.index !== null ? `[entry ${e.index}]` : '         ';
    console.error(`    ${loc} ${e.message}`);
  }
  console.error('');
}

process.exit(1);
