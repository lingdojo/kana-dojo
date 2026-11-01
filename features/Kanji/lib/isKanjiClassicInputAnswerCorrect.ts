import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
} from '@/shared/utils/meanings';

interface KanjiClassicInputAnswerOptions {
  inputValue: string;
  target: string | string[] | undefined;
  isReverse: boolean;
}

export const isKanjiClassicInputAnswerCorrect = ({
  inputValue,
  target,
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

  return target.some(
    answer => normalizeMeaningAnswer(answer) === normalizedInput,
  );
};
