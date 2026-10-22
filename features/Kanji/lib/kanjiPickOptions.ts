import type { IKanjiObj } from '@/entities/kanji';
import { normalizeMeaningAnswer } from '@/shared/utils/meanings';

/**
 * Picks the meanings that can be offered as wrong answers in pick mode.
 *
 * A kanji usually has several meanings and every one of them is a correct
 * translation, so a meaning of the target kanji must never be offered as a
 * wrong option - picking it would be graded as correct by the typed-answer
 * rules but as wrong by the option that was clicked. The same meaning is also
 * never offered twice, because two identical options make the question
 * ambiguous.
 *
 * @param candidates - Meanings to choose from, in random order.
 * @param kanji - The kanji the player is being asked about.
 * @param count - How many distractors are needed.
 */
export const pickKanjiDistractorMeanings = (
  candidates: readonly string[],
  kanji: IKanjiObj | undefined,
  count: number,
): string[] => {
  const taken = new Set(
    (kanji?.meanings ?? []).map(normalizeMeaningAnswer).filter(Boolean),
  );
  const distractors: string[] = [];

  for (const candidate of candidates) {
    const normalized = normalizeMeaningAnswer(candidate);
    if (!normalized || taken.has(normalized)) continue;
    taken.add(normalized);
    distractors.push(candidate);
    if (distractors.length === count) break;
  }

  return distractors;
};
