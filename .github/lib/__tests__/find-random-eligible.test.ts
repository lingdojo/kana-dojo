import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const findRandomEligible = require('../find-random-eligible.cjs') as (
  items: unknown[],
  predicate: (item: never) => boolean,
) => unknown | null;

describe('findRandomEligible', () => {
  it('returns null for an empty array', () => {
    expect(findRandomEligible([], () => true)).toBeNull();
  });

  it('returns null for a non-array input', () => {
    expect(findRandomEligible(null as never, () => true)).toBeNull();
    expect(findRandomEligible(undefined as never, () => true)).toBeNull();
    expect(findRandomEligible('string' as never, () => true)).toBeNull();
  });

  it('returns null when no items satisfy the predicate', () => {
    const items = [
      { id: 1, issued: true },
      { id: 2, issued: true },
    ];
    const result = findRandomEligible(
      items,
      (i: { issued: boolean }) => !i.issued,
    );
    expect(result).toBeNull();
  });

  it('never returns an already-issued item', () => {
    const items = [
      { id: 1, issued: true },
      { id: 2, issued: false },
      { id: 3, issued: true },
    ];
    for (let run = 0; run < 50; run++) {
      const result = findRandomEligible(
        items,
        (i: { issued: boolean }) => !i.issued,
      ) as { id: number } | null;
      expect(result).not.toBeNull();
      expect(result!.id).toBe(2);
    }
  });

  it('never returns an already-completed item', () => {
    const items = [
      { id: 1, completed: true },
      { id: 2, completed: false },
      { id: 3, completed: true },
    ];
    for (let run = 0; run < 50; run++) {
      const result = findRandomEligible(
        items,
        (i: { completed: boolean }) => !i.completed,
      ) as { id: number } | null;
      expect(result).not.toBeNull();
      expect(result!.id).toBe(2);
    }
  });

  it('returns only truly eligible items from a mixed pool', () => {
    const items = [
      { id: 1, issued: true, completed: false },
      { id: 2, issued: false, completed: true },
      { id: 3, issued: false, completed: false },
      { id: 4, issued: true, completed: true },
      { id: 5, issued: false, completed: false },
    ];
    const eligible = new Set([3, 5]);

    for (let run = 0; run < 100; run++) {
      const result = findRandomEligible(
        items,
        (i: { issued: boolean; completed: boolean }) =>
          !i.issued && !i.completed,
      ) as { id: number } | null;
      expect(result).not.toBeNull();
      expect(eligible.has(result!.id)).toBe(true);
    }
  });

  it('returns null when every item is either issued or completed', () => {
    const items = [
      { id: 1, issued: true, completed: false },
      { id: 2, issued: false, completed: true },
      { id: 3, issued: true, completed: true },
    ];
    const result = findRandomEligible(
      items,
      (i: { issued: boolean; completed: boolean }) => !i.issued && !i.completed,
    );
    expect(result).toBeNull();
  });

  it('rejects communityNote entries with falsy file, position, or text', () => {
    const predicate = (entry: {
      issued?: boolean;
      completed?: boolean;
      file?: string;
      position?: string;
      text?: string;
    }) => {
      if (entry.issued || entry.completed) return false;
      if (!entry.file || !entry.position || !entry.text) return false;
      return true;
    };

    const items = [
      { id: 1, file: undefined, position: 'top', text: 'hello' },
      { id: 2, file: 'README.md', position: undefined, text: 'hello' },
      { id: 3, file: 'README.md', position: 'top', text: undefined },
      { id: 4, file: 'README.md', position: 'top', text: 'valid' },
    ];

    for (let run = 0; run < 50; run++) {
      const result = findRandomEligible(items, predicate) as {
        id: number;
      } | null;
      expect(result).not.toBeNull();
      expect(result!.id).toBe(4);
    }
  });

  it('skips items already present in the existing content array (duplicate guard)', () => {
    const existingThemes = [{ id: 'sakura-pink' }, { id: 'ocean-blue' }];

    const backlog = [
      { id: 'sakura-pink', issued: false },
      { id: 'ocean-blue', issued: false },
      { id: 'forest-green', issued: false },
    ];

    const predicate = (th: { id: string; issued: boolean }) => {
      if (th.issued) return false;
      if (existingThemes.some(et => et.id === th.id)) return false;
      return true;
    };

    for (let run = 0; run < 50; run++) {
      const result = findRandomEligible(backlog, predicate) as {
        id: string;
      } | null;
      expect(result).not.toBeNull();
      expect(result!.id).toBe('forest-green');
    }
  });

  it('returns null when all backlog items already exist in content', () => {
    const existingFacts = ['fact-a', 'fact-b'];
    const backlog = [
      { id: 1, fact: 'fact-a', issued: false },
      { id: 2, fact: 'fact-b', issued: false },
    ];

    const predicate = (f: { fact: string; issued: boolean }) => {
      if (f.issued) return false;
      if (existingFacts.includes(f.fact)) return false;
      return true;
    };

    expect(findRandomEligible(backlog, predicate)).toBeNull();
  });
});
