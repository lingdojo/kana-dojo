/**
 * Unit Tests for false する/来る compound detection
 *
 * Verbs that merely end in くる / 来る / する (e.g. つくる, 出来る, こする) must not
 * be classified as 来る- or する-compounds.
 */

import { describe, it, expect } from 'vitest';
import { classifyVerb } from '../lib/engine/classifyVerb';
import { conjugate } from '../lib/engine/conjugate';

function formOf(verb: string, id: string): string | undefined {
  const res = conjugate(verb);
  if (!res.success) throw new Error(`conjugate(${verb}) failed`);
  return res.result.forms.find(f => f.id === id)?.hiragana;
}

describe('False 来る-compound detection', () => {
  it.each(['つくる', 'おくる', 'めくる', 'まくる', 'いじくる'])(
    'classifies %s as godan, not a 来る-compound',
    verb => {
      const result = classifyVerb(verb);
      expect(result.type).toBe('godan');
      expect(result.compoundPrefix).toBeUndefined();
    },
  );

  it('conjugates つくる correctly', () => {
    expect(formOf('つくる', 'nai')).toBe('つくらない');
    expect(formOf('つくる', 'masu')).toBe('つくります');
    expect(formOf('つくる', 'te')).toBe('つくって');
  });

  it('classifies 出来る as ichidan, not a 来る-compound', () => {
    const result = classifyVerb('出来る');
    expect(result.type).toBe('ichidan');
    expect(result.compoundPrefix).toBeUndefined();
    expect(formOf('出来る', 'nai')).toBe('出来ない');
    expect(formOf('出来る', 'masu')).toBe('出来ます');
  });

  it.each(['持ってくる', '持って来る', '飛んでくる', '出てくる'])(
    'still classifies te-form compound %s as a 来る-compound',
    verb => {
      const result = classifyVerb(verb);
      expect(result.irregularType).toBe('kuru');
      expect(result.compoundPrefix).toBeDefined();
    },
  );
});

describe('False する-compound detection', () => {
  it.each(['こする', 'ゆする', 'かする'])(
    'classifies %s as godan, not a する-compound',
    verb => {
      const result = classifyVerb(verb);
      expect(result.type).toBe('godan');
      expect(result.compoundPrefix).toBeUndefined();
    },
  );

  it('conjugates こする correctly', () => {
    expect(formOf('こする', 'nai')).toBe('こすらない');
    expect(formOf('こする', 'te')).toBe('こすって');
  });

  it.each(['勉強する', 'べんきょうする', 'あいする'])(
    'still classifies %s as a する-compound',
    verb => {
      expect(classifyVerb(verb).irregularType).toBe('suru');
    },
  );
});
