import type { KanaCharacter } from '@/features/Kana/lib/flattenKanaGroup';
import { shuffle } from '@/shared/lib/shuffle';
import type { ContentAdapter, GameMode } from './ContentAdapter';

/**
 * Kana Content Adapter
 *
 * Handles game logic for Hiragana and Katakana characters
 */
export const kanaAdapter: ContentAdapter<KanaCharacter> = {
  getQuestion(kana: KanaCharacter, mode: GameMode): string {
    // reverse modes show romanization, regular modes show kana character
    return mode.includes('reverse') ? kana.romaji : kana.kana;
  },

  getCorrectAnswer(kana: KanaCharacter, mode: GameMode): string {
    // reverse modes expect kana character, regular modes expect romanization
    return mode.includes('reverse') ? kana.kana : kana.romaji;
  },

  generateOptions(
    kana: KanaCharacter,
    pool: KanaCharacter[],
    mode: GameMode,
    count: number
  ): string[] {
    const correct = this.getCorrectAnswer(kana, mode);

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
    kana: KanaCharacter,
    mode: GameMode
  ): boolean {
    const correct = this.getCorrectAnswer(kana, mode);
    return userAnswer.toLowerCase().trim() === correct.toLowerCase().trim();
  },

  getMetadata(kana: KanaCharacter) {
    return {
      primary: kana.kana,
      secondary: kana.romaji
    };
  }
};
