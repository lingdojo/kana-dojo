import { normalizeKanjiMeaningAnswer } from './isKanjiAnswerCorrect';

interface KanjiClassicInputAnswerOptions {
  inputValue: string;
  target: string | string[] | undefined;
  isReverse: boolean;
}

const normalizeExactAnswer = (value: string): string =>
  value.trim().normalize('NFC').toLowerCase();

export const isKanjiClassicInputAnswerCorrect = ({
  inputValue,
  target,
  isReverse,
}: KanjiClassicInputAnswerOptions): boolean => {
  if (isReverse) {
    return (
      typeof target === 'string' &&
      normalizeExactAnswer(target) === normalizeExactAnswer(inputValue)
    );
  }

  if (!Array.isArray(target)) return false;

  const normalizedInput = normalizeKanjiMeaningAnswer(inputValue);
  return target.some(
    answer => normalizeKanjiMeaningAnswer(answer) === normalizedInput,
  );
};
