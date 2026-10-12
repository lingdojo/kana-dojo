import type { IVocabObj } from '@/entities/vocabulary';
import { normalizeMeaningAnswer } from '@/shared/utils/meanings';

export const getVocabularyIncorrectWordObjs = (
  selectedWordObjs: IVocabObj[],
  correctChar: string,
  quizType: 'meaning' | 'reading',
): IVocabObj[] => {
  const correctWordObj = selectedWordObjs.find(
    obj => obj.word === correctChar,
  );

  const correctMeaning =
    quizType === 'meaning'
      ? normalizeMeaningAnswer(correctWordObj?.meanings[0] ?? '')
      : '';

  return selectedWordObjs.filter(obj => {
    if (obj.word === correctChar) return false;

    if (quizType === 'meaning') {
      const meaning = normalizeMeaningAnswer(obj.meanings[0] ?? '');
      return meaning !== correctMeaning;
    }

    return true;
  });
};