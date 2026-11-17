import type { IVocabObj } from '@/features/Vocabulary/store/useVocabStore';

const norm = (v?: string) => (v ?? '').trim().toLowerCase();

export const sharesPrimaryMeaning = (a: IVocabObj, b: IVocabObj): boolean =>
  norm(a.meanings[0]) !== '' && norm(a.meanings[0]) === norm(b.meanings[0]);

/**
 * Removes candidates that would be a valid answer too: other words with the
 * same primary meaning (meaning quiz) or the same reading (reading quiz).
 */
export function filterDistractorCandidates(
  candidates: IVocabObj[],
  target: IVocabObj,
  quizType: 'meaning' | 'reading',
): IVocabObj[] {
  return candidates.filter(obj => {
    if (obj.word === target.word) return false;
    if (quizType === 'meaning') return !sharesPrimaryMeaning(obj, target);
    return norm(obj.reading) !== norm(target.reading);
  });
}
