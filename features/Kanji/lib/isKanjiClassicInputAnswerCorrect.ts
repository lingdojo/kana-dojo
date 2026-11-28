import { readingsMatch } from '@/shared/utils/japaneseReading';
import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
} from '@/shared/utils/meanings';

interface KanjiClassicInputAnswerOptions {
  inputValue: string;
  target: string | string[] | undefined;
  readings?: string[];
  isReverse: boolean;
}

export const isKanjiClassicInputAnswerCorrect = ({
  inputValue,
  target,
  readings = [],
  isReverse,
}: KanjiClassicInputAnswerOptions): boolean => {
  if (isReverse) {
    return (
      typeof target === 'string' &&
      normalizeAnswerValue(target) === normalizeAnswerValue(inputValue)
    );
  }

  if (!Array.isArray(target)) return false;

  const normalizedInput = normalizeMeaningAnswer(inputValue);
  if (!normalizedInput) return false;

  const matchesMeaning = target.some(
    answer => normalizeMeaningAnswer(answer) === normalizedInput,
  );
  // Meanings stay on exact English comparison. "no" and "in" are also
  // valid romaji, so converting the meaning list would mark の and いん correct.
  const matchesReading = readings.some(reading =>
    readingsMatch(inputValue, reading),
  );
  return matchesMeaning || matchesReading;
};
