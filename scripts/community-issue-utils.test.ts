import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { findRandomEligible, toJsonStringLiteral } =
  require('../.github/scripts/community-issue-utils.cjs') as {
    findRandomEligible<T>(
      items: T[],
      predicate?: (item: T) => boolean,
    ): T | null;
    toJsonStringLiteral(value: string): string;
  };

describe('findRandomEligible', () => {
  it('selects only items that pass the eligibility predicate', () => {
    const existingGrammar = ['"〜て以来" means "since (doing)".'];
    const items = [
      { text: existingGrammar[0], issued: false, completed: false },
      { text: 'new grammar', issued: false, completed: false },
    ];

    expect(
      findRandomEligible(
        items,
        item =>
          !item.issued &&
          !item.completed &&
          !existingGrammar.includes(item.text),
      ),
    ).toEqual(items[1]);
  });

  it('returns null when no items pass the eligibility predicate', () => {
    expect(
      findRandomEligible([{ exists: true }], item => !item.exists),
    ).toBeNull();
  });

  it('serializes grammar text as a valid JSON string literal', () => {
    const text = '"〜て以来" means "since (doing)".';

    expect(JSON.parse(toJsonStringLiteral(text))).toBe(text);
  });
});
