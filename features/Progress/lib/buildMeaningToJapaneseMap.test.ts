import { describe, expect, it } from 'vitest';

import { buildMeaningToJapaneseMap } from './buildMeaningToJapaneseMap';

describe('buildMeaningToJapaneseMap', () => {
  it('does not map the shared "to open" meaning for aku and akeru', () => {
    const map = buildMeaningToJapaneseMap(
      [],
      [
        { word: '開く', meanings: ['to open', 'to become open'] },
        { word: '開ける', meanings: ['to open'] },
      ],
    );

    expect(map.has('to open')).toBe(false);
  });

  it('does not map the shared "over there" meaning', () => {
    const map = buildMeaningToJapaneseMap(
      [],
      [
        { word: 'あそこ', meanings: ['over there'] },
        { word: 'あっち', meanings: ['over there'] },
      ],
    );

    expect(map.has('over there')).toBe(false);
  });

  it('is independent of input order for shared meanings', () => {
    const forward = buildMeaningToJapaneseMap(
      [],
      [
        { word: 'あそこ', meanings: ['over there'] },
        { word: 'あっち', meanings: ['over there'] },
      ],
    );
    const reverse = buildMeaningToJapaneseMap(
      [],
      [
        { word: 'あっち', meanings: ['over there'] },
        { word: 'あそこ', meanings: ['over there'] },
      ],
    );

    expect(forward).toEqual(reverse);
    expect(forward.has('over there')).toBe(false);
  });

  it('maps unique meanings with normalized case and whitespace', () => {
    const map = buildMeaningToJapaneseMap(
      [],
      [{ word: '食べる', meanings: ['  To Eat '] }],
    );

    expect(map.get('to eat')).toBe('食べる');
  });

  it('treats a meaning shared between kanji and vocabulary as ambiguous', () => {
    const map = buildMeaningToJapaneseMap(
      [{ kanjiChar: '開く', meanings: ['to open'] }],
      [{ word: 'あく', meanings: ['to open'] }],
    );

    expect(map.has('to open')).toBe(false);
  });

  it('keeps repeated meanings on the same item mapped', () => {
    const map = buildMeaningToJapaneseMap(
      [],
      [{ word: '開く', meanings: ['to open', 'TO OPEN'] }],
    );

    expect(map.get('to open')).toBe('開く');
  });
});
