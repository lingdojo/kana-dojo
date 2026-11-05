import { describe, it, expect } from 'vitest';
import { filterDistractorCandidates } from './distractors';

const v = (word: string, reading: string, meanings: string[]) => ({
  word,
  reading,
  meanings,
});

const aku = v('開く', 'あく', ['to open']);
const akeru = v('開ける', 'あける', ['to open']);
const acchi = v('あっち', 'あっち', ['over there']);
const asoko = v('あそこ', 'あそこ', ['over there']);
const other = v('食べる', 'たべる', ['to eat']);
const pool = [aku, akeru, acchi, asoko, other];

describe('filterDistractorCandidates', () => {
  it('excludes akeru when target is aku (meaning quiz)', () => {
    const r = filterDistractorCandidates(pool, aku, 'meaning');
    expect(r).not.toContain(akeru);
    expect(r).not.toContain(aku);
    expect(r).toContain(other);
  });

  it('excludes asoko when target is acchi (meaning quiz)', () => {
    const r = filterDistractorCandidates(pool, acchi, 'meaning');
    expect(r).not.toContain(asoko);
  });

  it('excludes homophones in a reading quiz', () => {
    const homophone = v('空く', 'あく', ['to be empty']);
    const r = filterDistractorCandidates(
      [aku, homophone, other],
      aku,
      'reading',
    );
    expect(r).not.toContain(homophone);
    expect(r).toContain(other);
  });

  it('does not exclude words with different meanings', () => {
    expect(filterDistractorCandidates(pool, other, 'meaning')).toHaveLength(4);
  });
});
