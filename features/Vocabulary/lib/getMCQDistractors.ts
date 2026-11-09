import type { IVocabObj } from '@/entities/vocabulary';

/**
 * Returns up to `limit` distractor option strings for a vocabulary MCQ question.
 *
 * Distractors are drawn from `wordPool` after excluding the word whose key
 * matches `correctWord`. Each candidate is mapped to the display string that
 * matches the current quiz surface:
 *   - meaning quiz, normal mode  → obj.meanings[0]
 *   - meaning quiz, reverse mode → obj.word
 *   - reading quiz               → obj.reading
 *
 * Any candidate whose mapped string is identical to `targetValue` is removed
 * before sampling. This prevents a distractor from duplicating the correct
 * answer — which would make the question unsolvable when two vocabulary entries
 * share the same primary meaning (e.g. 開く and 開ける both map to "to open").
 *
 * The caller is responsible for shuffling the returned array if order
 * randomness is required; this function returns candidates in their original
 * pool order so that tests remain deterministic.
 */
export function getMCQDistractors(
  wordPool: IVocabObj[],
  correctWord: string,
  targetValue: string,
  quizType: 'meaning' | 'reading',
  isReverse: boolean,
  limit = 2,
): string[] {
  const others = wordPool.filter(obj => obj.word !== correctWord);

  let candidates: (string | undefined)[];
  if (quizType === 'meaning') {
    candidates = others.map(obj => (isReverse ? obj.word : obj.meanings?.[0]));
  } else if (quizType === 'reading') {
    candidates = others.map(obj => obj.reading);
  } else {
    return [];
  }

  const uniqueDistractors: string[] = [];
  for (const option of candidates) {
    if (
      typeof option === 'string' &&
      option.trim().length > 0 &&
      option !== targetValue &&
      !uniqueDistractors.includes(option)
    ) {
      uniqueDistractors.push(option);
      if (uniqueDistractors.length === limit) {
        break;
      }
    }
  }

  return uniqueDistractors;
}
