import { describe, it, expect } from 'vitest';
import { isVocabularyMeaningAnswerCorrect } from '@/features/Vocabulary/lib/isVocabularyMeaningAnswerCorrect';

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

describe('isVocabularyMeaningAnswerCorrect reverse-mode synonyms', () => {
  it('accepts akeru (word, kana or romaji) for the "to open" prompt of aku', () => {
    expect(isVocabularyMeaningAnswerCorrect(aku, '開ける', true, pool)).toBe(
      true,
    );
    expect(isVocabularyMeaningAnswerCorrect(aku, 'あける', true, pool)).toBe(
      true,
    );
    expect(isVocabularyMeaningAnswerCorrect(aku, 'akeru', true, pool)).toBe(
      true,
    );
  });

  it('accepts asoko for the "over there" prompt of acchi and vice versa', () => {
    expect(isVocabularyMeaningAnswerCorrect(acchi, 'あそこ', true, pool)).toBe(
      true,
    );
    expect(isVocabularyMeaningAnswerCorrect(asoko, 'acchi', true, pool)).toBe(
      true,
    );
  });

  it('still accepts the target itself', () => {
    expect(isVocabularyMeaningAnswerCorrect(aku, 'あく', true, pool)).toBe(
      true,
    );
  });

  it('rejects a word with a different meaning', () => {
    expect(isVocabularyMeaningAnswerCorrect(aku, '食べる', true, pool)).toBe(
      false,
    );
  });

  it('keeps old behavior when no alternatives are passed', () => {
    expect(isVocabularyMeaningAnswerCorrect(aku, 'あける', true)).toBe(false);
  });

  it('does not change normal-mode meaning checks', () => {
    expect(isVocabularyMeaningAnswerCorrect(aku, 'to open', false, pool)).toBe(
      true,
    );
  });
});
