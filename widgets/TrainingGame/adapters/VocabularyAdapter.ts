import type { IVocabObj } from '@/features/Vocabulary/store/useVocabStore';
import { shuffle } from '@/shared/lib/shuffle';
import type { ContentAdapter, GameMode } from './ContentAdapter';

/**
 * Vocabulary Content Adapter
 *
 * Handles game logic for vocabulary words with readings and meanings
 */
export const vocabularyAdapter: ContentAdapter<IVocabObj> = {
  getQuestion(vocab: IVocabObj, mode: GameMode): string {
    // reverse modes show meaning, regular modes show word
    return mode.includes('reverse')
      ? vocab.displayMeanings[0] || vocab.meanings[0] || ''
      : vocab.word;
  },

  getCorrectAnswer(vocab: IVocabObj, mode: GameMode): string {
    // reverse modes expect word, regular modes expect meaning
    return mode.includes('reverse')
      ? vocab.word
      : vocab.displayMeanings[0] || vocab.meanings[0] || '';
  },

  generateOptions(
    vocab: IVocabObj,
    pool: IVocabObj[],
    mode: GameMode,
    count: number
  ): string[] {
    const correct = this.getCorrectAnswer(vocab, mode);

    // Get wrong options from pool
    const wrongOptions = pool
      .filter(v => this.getCorrectAnswer(v, mode) !== correct)
      .map(v => this.getCorrectAnswer(v, mode))
      // Remove duplicates
      .filter((value, index, self) => self.indexOf(value) === index)
      .slice(0, count - 1);

    // Combine and shuffle (using secure random)
    return shuffle([correct, ...wrongOptions]);
  },

  validateAnswer(
    userAnswer: string,
    vocab: IVocabObj,
    mode: GameMode
  ): boolean {
    const correct = this.getCorrectAnswer(vocab, mode);
    return userAnswer.toLowerCase().trim() === correct.toLowerCase().trim();
  },

  getMetadata(vocab: IVocabObj) {
    return {
      primary: vocab.word,
      secondary: vocab.reading,
      readings: [vocab.reading],
      meanings: vocab.displayMeanings.length
        ? vocab.displayMeanings
        : vocab.meanings
    };
  }
};
