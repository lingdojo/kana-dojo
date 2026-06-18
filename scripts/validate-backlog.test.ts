import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { run } = require('./validate-backlog.mjs');
const { EXCLUDED_FILES } = require('./backlog-exclusions.mjs');

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-backlog-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeFixture(name: string, contents: string) {
  fs.writeFileSync(path.join(tmpDir, name), contents);
}

describe('EXCLUDED_FILES', () => {
  it('contains automation-state.json and pr-authors.json', () => {
    expect(EXCLUDED_FILES.has('automation-state.json')).toBe(true);
    expect(EXCLUDED_FILES.has('pr-authors.json')).toBe(true);
  });

  it('does not contain content backlog files', () => {
    expect(EXCLUDED_FILES.has('facts-backlog.json')).toBe(false);
    expect(EXCLUDED_FILES.has('proverbs-backlog.json')).toBe(false);
  });
});

describe('run()', () => {
  it('returns 0 findings for a directory of valid backlog files', () => {
    writeFixture(
      'facts-backlog.json',
      '[{"id":1,"fact":"Tokyo is the capital."}]',
    );
    writeFixture(
      'proverbs-backlog.json',
      '[{"id":1,"japanese":"猿も木から落ちる","english":"Even monkeys fall from trees."}]',
    );
    const { findings } = run({ backlogDir: tmpDir });
    expect(findings).toEqual([]);
  });

  it('returns 0 findings for an empty backlog file', () => {
    writeFixture('empty-backlog.json', '[]');
    const { findings } = run({ backlogDir: tmpDir });
    expect(findings).toEqual([]);
  });

  it('skips excluded files', () => {
    writeFixture('automation-state.json', 'this is not valid JSON {{{');
    writeFixture('pr-authors.json', 'this is not valid JSON either');
    writeFixture('facts-backlog.json', '[{"id":1,"fact":"Valid entry."}]');
    const { findings } = run({ backlogDir: tmpDir });
    expect(findings).toEqual([]);
  });

  it('reports a file with a JSON parse error and continues', () => {
    writeFixture('good.json', '[{"id":1,"fact":"Valid."}]');
    writeFixture('broken.json', '[{"id":1,"fact":"unterminated string}]');
    writeFixture('also-good.json', '[]');
    const { findings } = run({ backlogDir: tmpDir });
    expect(findings).toHaveLength(1);
    expect(findings[0].file).toBe('broken.json');
    expect(findings[0].message).toMatch(/JSON parse failed/);
  });

  it('reports a file with a non-array root and continues', () => {
    writeFixture('good.json', '[]');
    writeFixture('not-array.json', '{"id":1,"fact":"object root"}');
    const { findings } = run({ backlogDir: tmpDir });
    expect(findings).toHaveLength(1);
    expect(findings[0].file).toBe('not-array.json');
    expect(findings[0].message).toBe('root is not an array');
  });

  it('processes every file regardless of failures (collect-all)', () => {
    writeFixture('broken-1.json', 'not json');
    writeFixture('broken-2.json', '{"x":}');
    writeFixture('not-array.json', '"a string root"');
    writeFixture('good.json', '[]');
    const { findings } = run({ backlogDir: tmpDir });
    expect(findings.length).toBeGreaterThanOrEqual(3);
    const files = findings.map((f: { file: string }) => f.file).sort();
    expect(files).toEqual(['broken-1.json', 'broken-2.json', 'not-array.json']);
  });

  it('includes file, index, id, and message in each finding', () => {
    const broken = '[{"id":"a","fact":"unterminated},{"id":"b","fact":"also"}]';
    fs.writeFileSync(path.join(tmpDir, 'parse-fail.json'), broken);
    const { findings } = run({ backlogDir: tmpDir });
    expect(findings.length).toBeGreaterThan(0);
    for (const f of findings) {
      expect(typeof f.file).toBe('string');
      expect(f).toHaveProperty('index');
      expect(f).toHaveProperty('id');
      expect(typeof f.message).toBe('string');
    }
  });
});

describe('integration: real community/backlog/', () => {
  it('reports 0 findings against the real backlog directory', () => {
    const realDir = path.resolve('community/backlog');
    if (!fs.existsSync(realDir)) {
      // skip if running outside the kana-dojo repo
      return;
    }
    const { findings } = run({ backlogDir: realDir });
    expect(findings).toEqual([]);
  });
});
