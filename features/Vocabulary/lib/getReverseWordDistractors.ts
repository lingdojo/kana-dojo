import type { IVocabObj } from '@/entities/vocabulary';
import { normalizeMeaningAnswer } from '@/shared/utils/meanings';

/**
 * Candidate words for reverse-mode (meaning shown, pick the word) questions.
 *
 * When several entries share the same displayed meaning, offering more than
 * one of them as options forces the learner to guess which entry the app
 * picked, because every shared-meaning word is a valid answer to the prompt
 * (see #30972). Entries whose primary meaning matches the question's
 * displayed meaning are excluded so the correct word stays the only
 * consistent option.
 */
export const getReverseWordDistractors = (
  question: IVocabObj,
  pool: IVocabObj[],
): string[] => {
  const displayed = question.meanings[0];
  const normalizedDisplayed =
    typeof displayed === 'string' && displayed.trim().length > 0
      ? normalizeMeaningAnswer(displayed)
      : null;

  const seen = new Set<string>();
  const distractors: string[] = [];
  for (const entry of pool) {
    if (entry.word === question.word) continue;
    if (seen.has(entry.word)) continue;
    seen.add(entry.word);
    if (
      normalizedDisplayed !== null &&
      typeof entry.meanings[0] === 'string' &&
      normalizeMeaningAnswer(entry.meanings[0]) === normalizedDisplayed
    ) {
      continue;
    }
    distractors.push(entry.word);
  }
  return distractors;
};
