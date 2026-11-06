import { describe, expect, it } from 'vitest';
import type { IVocabObj } from '@/entities/vocabulary';
import { getVocabularyIncorrectWordObjs } from '@/features/Vocabulary/lib/getVocabularyIncorrectWordObjs';

const vocabulary: IVocabObj[] = [
  {
    word: '開く',
    reading: 'あく',
    meanings: ['to open'],
  },
  {
    word: '開ける',
    reading: 'あける',
    meanings: ['to open'],
  },
  {
    word: '閉める',
    reading: 'しめる',
    meanings: ['to close'],
  },
];

describe('getVocabularyIncorrectWordObjs', () => {
  it('excludes words with the same meaning as the correct answer', () => {
    const result = getVocabularyIncorrectWordObjs(
      vocabulary,
      '開く',
      'meaning',
    );

    expect(result.map(word => word.word)).toEqual(['閉める']);
  });
});