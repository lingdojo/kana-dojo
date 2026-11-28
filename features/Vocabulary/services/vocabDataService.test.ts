import { afterEach, describe, expect, it, vi } from 'vitest';
import n1 from '@/public/data-vocab/n1.json';
import n2 from '@/public/data-vocab/n2.json';
import n3 from '@/public/data-vocab/n3.json';
import n4 from '@/public/data-vocab/n4.json';
import n5 from '@/public/data-vocab/n5.json';
import { isVocabularyMeaningAnswerCorrect } from '@/features/Vocabulary/lib/isVocabularyMeaningAnswerCorrect';
import { vocabDataService } from '@/features/Vocabulary/services/vocabDataService';

const levels = { n1, n2, n3, n4, n5 };

const isBalanced = (value: string) =>
  (value.match(/\(/g) ?? []).length === (value.match(/\)/g) ?? []).length;

const loadLevel = async (
  level: keyof typeof levels,
  entries: (typeof levels)[keyof typeof levels],
) => {
  vocabDataService.clearCache();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ json: () => Promise.resolve(entries) }),
  );
  return vocabDataService.getVocabByLevel(level);
};

afterEach(() => {
  vi.unstubAllGlobals();
  vocabDataService.clearCache();
});

describe('vocabDataService meanings', () => {
  it.each(Object.entries(levels))(
    '%s never splits a meaning inside parentheses',
    async (level, entries) => {
      const words = await loadLevel(level as keyof typeof levels, entries);

      const broken = words.filter(
        (word, index) =>
          isBalanced(entries[index].waller_definition) &&
          !word.meanings.every(isBalanced),
      );

      expect(broken.map(word => word.meanings)).toEqual([]);
    },
  );

  it('keeps an annotation that contains commas in one meaning', async () => {
    const words = await loadLevel('n3', n3);
    const thankYou = words.find(word => word.reading === 'ありがとう');

    expect(thankYou?.meanings).toEqual(['(conj,exp,int) Thank you']);
    expect(isVocabularyMeaningAnswerCorrect(thankYou!, 'exp', false)).toBe(
      false,
    );
  });

  it('keeps the explanation of a meaning attached to it', async () => {
    const words = await loadLevel('n3', n3);
    const oni = words.find(word => word.reading === 'おに');

    expect(oni?.meanings).toEqual([
      'ogre',
      'demon',
      'it (i.e., in a game of tag)',
    ]);
  });
});
