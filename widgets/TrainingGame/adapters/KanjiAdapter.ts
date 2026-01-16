import type { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import { shuffle } from '@/shared/lib/shuffle';
import type { ContentAdapter, GameMode } from './ContentAdapter';

/**
 * Kanji Content Adapter
 *
 * Handles game logic for Kanji characters with readings and meanings
 */
export const kanjiAdapter: ContentAdapter<IKanjiObj> = {
  getQuestion(kanji: IKanjiObj, mode: GameMode): string {
    // reverse modes show meaning, regular modes show kanji character
    return mode.includes('reverse')
      ? kanji.displayMeanings[0] || kanji.meanings[0] || ''
      : kanji.kanjiChar;
  },

  getCorrectAnswer(kanji: IKanjiObj, mode: GameMode): string {
    // reverse modes expect kanji character, regular modes expect meaning
    return mode.includes('reverse')
      ? kanji.kanjiChar
      : kanji.displayMeanings[0] || kanji.meanings[0] || '';
  },

  generateOptions(
    kanji: IKanjiObj,
    pool: IKanjiObj[],
    mode: GameMode,
    count: number
  ): string[] {
    const correct = this.getCorrectAnswer(kanji, mode);

    // Get wrong options from pool
    const wrongOptions = pool
      .filter(k => this.getCorrectAnswer(k, mode) !== correct)
      .map(k => this.getCorrectAnswer(k, mode))
      // Remove duplicates
      .filter((value, index, self) => self.indexOf(value) === index)
      .slice(0, count - 1);

    // Combine and shuffle (using secure random)
    return shuffle([correct, ...wrongOptions]);
  },

  validateAnswer(
    userAnswer: string,
    kanji: IKanjiObj,
    mode: GameMode
  ): boolean {
    const correct = this.getCorrectAnswer(kanji, mode);
    return userAnswer.toLowerCase().trim() === correct.toLowerCase().trim();
  },

  getMetadata(kanji: IKanjiObj) {
    return {
      primary: kanji.kanjiChar,
      secondary: kanji.displayMeanings[0] || kanji.meanings[0],
      readings: [...kanji.onyomi, ...kanji.kunyomi],
      meanings: kanji.displayMeanings.length
        ? kanji.displayMeanings
        : kanji.meanings
    };
  }
};
