import type { KanaCharacter } from '@/entities/kana';
import { shuffle } from '@/shared/utils/shuffle';
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
    count: number,
  ): string[] {
    const correct = this.getCorrectAnswer(kana, mode);

    // Collect wrong options from the pool, excluding the current correct answer.
    // Note: some kana share the same romaji (e.g. ぢ and じ both map to "ji",
    // づ and ず both map to "zu"). Filtering by answer string alone is not enough
    // because those shared strings can re-appear as distractors for other kana
    // in the pool. We therefore deduplicate the entire final option set so no
    // string ever appears more than once in the rendered choices.
    const seen = new Set<string>([correct]);
    const wrongOptions: string[] = [];

    for (const k of pool) {
      if (wrongOptions.length >= count - 1) break;
      const answer = this.getCorrectAnswer(k, mode);
      if (!seen.has(answer)) {
        seen.add(answer);
        wrongOptions.push(answer);
      }
    }

    // Combine and shuffle (using secure random)
    return shuffle([correct, ...wrongOptions]);
  },

  validateAnswer(
    userAnswer: string,
    kana: KanaCharacter,
    mode: GameMode,
  ): boolean {
    const correct = this.getCorrectAnswer(kana, mode);
    return userAnswer.toLowerCase().trim() === correct.toLowerCase().trim();
  },

  getMetadata(kana: KanaCharacter) {
    return {
      primary: kana.kana,
      secondary: kana.romaji,
    };
  },
};

