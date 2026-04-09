import fs from 'node:fs';
import path from 'node:path';

const contentDir = path.resolve('community/content');
const maxPasses = 12;

/**
 * Fixes a common malformed pattern:
 *   "..." means "..."
 * inside a JSON string where interior quotes should be escaped.
 */
function escapeEmbeddedQuotesInStrings(raw) {
  return raw.replace(/"((?:\\.|[^"\\])*)"/g, (full, inner) => {
    const escaped = inner.replace(/(^|[^\\])"/g, '$1\\"');
    return `"${escaped}"`;
  });
}

/**
 * Fixes string entries where interior quoted phrases are not escaped:
 *   "\"〜ても" means "even if"..."
 * -> "\"〜ても\" means \"even if\"..."
 */
function fixUnescapedQuotedPhrases(raw) {
  return raw.replace(/^(\s*")((?:\\.|[^"\\])*)"([^,\n]*),?$/gm, (line, prefix, content, suffix) => {
    if (!suffix.includes(' means ') && !suffix.includes(' with ') && !suffix.includes(' is ')) {
      return line;
    }

    const fixedContent = content.replace(/(^|[^\\])"/g, '$1\\"');
    const fixedSuffix = suffix.replace(/(^|[^\\])"/g, '$1\\"');
    return `${prefix}${fixedContent}"${fixedSuffix}`;
  });
}

/**
 * Fixes broken object boundaries inside arrays:
 *   }
 *     "key": ...
 * into:
 *   },
 *   {
 *     "key": ...
 */
function fixMissingObjectBoundary(raw) {
  return raw.replace(
    /(\n\s*}\s*)\n(\s*)"([A-Za-z_][A-Za-z0-9_]*)"\s*:/g,
    (_m, closing, indent, key) => `${closing},\n${indent}{\n${indent}"${key}":`,
  );
}

/**
 * Fixes missing comma between adjacent objects:
 *   }
 *   {
 */
function fixMissingCommaBetweenObjects(raw) {
  return raw.replace(/(\n\s*})\n(\s*{)/g, '$1,\n$2');
}

function normalizeNewline(raw) {
  return raw.replace(/\r\n/g, '\n');
}

function tryParse(raw) {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message };
  }
}

function attemptRepair(raw) {
  let current = normalizeNewline(raw);

  for (let pass = 1; pass <= maxPasses; pass += 1) {
    const parsed = tryParse(current);
    if (parsed.ok) {
      return { fixed: true, data: parsed.value, passes: pass - 1 };
    }

    const next = [
      fixMissingObjectBoundary,
      fixMissingCommaBetweenObjects,
      fixUnescapedQuotedPhrases,
      escapeEmbeddedQuotesInStrings,
    ].reduce((acc, fn) => fn(acc), current);

    if (next === current) {
      return { fixed: false, error: parsed.message, passes: pass - 1 };
    }

    current = next;
  }

  const final = tryParse(current);
  if (final.ok) {
    return { fixed: true, data: final.value, passes: maxPasses };
  }
  return { fixed: false, error: final.message, passes: maxPasses };
}

function main() {
  const files = fs
    .readdirSync(contentDir)
    .filter((name) => name.endsWith('.json'))
    .sort();

  const repaired = [];
  const unchangedValid = [];
  const failed = [];

  for (const file of files) {
    const fullPath = path.join(contentDir, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = tryParse(raw);

    if (parsed.ok) {
      unchangedValid.push(file);
      continue;
    }

    const result = attemptRepair(raw);
    if (!result.fixed) {
      failed.push({ file, error: result.error });
      continue;
    }

    fs.writeFileSync(fullPath, `${JSON.stringify(result.data, null, 2)}\n`);
    repaired.push({ file, passes: result.passes });
  }

  console.log(`Scanned ${files.length} file(s) in community/content`);
  console.log(`Already valid: ${unchangedValid.length}`);
  console.log(`Repaired: ${repaired.length}`);
  for (const item of repaired) {
    console.log(`  - ${item.file} (passes=${item.passes})`);
  }

  if (failed.length > 0) {
    console.log(`Failed: ${failed.length}`);
    for (const item of failed) {
      console.log(`  - ${item.file}: ${item.error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('All files are valid JSON after repair.');
}

main();
