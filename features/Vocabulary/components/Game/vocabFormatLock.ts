export type VocabQuizType = 'meaning' | 'reading';
export type VocabQuestionFormat =
  | 'meaning-normal'
  | 'meaning-reverse'
  | 'reading';

export const getQuestionFormatKey = (
  quizType: VocabQuizType,
  isReverse: boolean,
): VocabQuestionFormat =>
  quizType === 'reading'
    ? 'reading'
    : isReverse
      ? 'meaning-reverse'
      : 'meaning-normal';

export const getAvailableQuestionFormats = (
  word: string,
  isReverse: boolean,
): VocabQuestionFormat[] => {
  const hasKanji = /[\u4E00-\u9FAF]/.test(word);
  const meaningFormat = isReverse ? 'meaning-reverse' : 'meaning-normal';
  if (!hasKanji) {
    return [meaningFormat];
  }
  return [meaningFormat, 'reading'];
};

export const formatKeyToQuizType = (
  format: VocabQuestionFormat,
): VocabQuizType => (format === 'reading' ? 'reading' : 'meaning');
