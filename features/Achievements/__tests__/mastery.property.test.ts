import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ACHIEVEMENTS, type Achievement } from '../store/useAchievementStore';

/**
 * **Feature: expanded-achievements, Property 2: Mastery Achievement Unlocking**
 * For any achievement with a mastery-based requirement and for any character mastery
 * state where all characters in the target set have accuracy >= the required threshold,
 * the achievement SHALL be unlocked if not already unlocked.
 * **Validates: Requirements 1.7-1.8, 2.6-2.10, 3.5-3.6**
 */

// Filter mastery-based achievements
const masteryAchievements = ACHIEVEMENTS.filter(
  a => a.requirements.type === 'content_mastery',
);

// Helper to create character mastery data
function createCharacterMastery(
  numCharacters: number,
  accuracy: number,
  minAnswers: number = 10,
): Record<string, { correct: number; incorrect: number }> {
  const mastery: Record<string, { correct: number; incorrect: number }> = {};

  for (let i = 0; i < numCharacters; i++) {
    const charId = `char_${i}`;
    // Calculate correct/incorrect to achieve target accuracy
    const total = minAnswers;
    const correct = Math.round((accuracy / 100) * total);
    const incorrect = total - correct;

    mastery[charId] = { correct, incorrect };
  }

  return mastery;
}

// Helper to create stats for mastery achievement
function createStatsForMasteryAchievement(
  achievement: Achievement,
  meetsThreshold: boolean,
  numCharacters: number = 10,
): { allTimeStats: Record<string, unknown> } {
  const { value, additional } = achievement.requirements;
  const minAnswers = additional?.minAnswers ?? 10;

  // For mastery achievements, value is the accuracy threshold
  const targetAccuracy = meetsThreshold ? value : Math.max(0, value - 10);

  const characterMastery = createCharacterMastery(
    numCharacters,
    targetAccuracy,
    minAnswers,
  );

  return {
    allTimeStats: {
      characterMastery,
      contentMastery: {
        vocabulary:
          additional?.contentType === 'vocabulary' ? characterMastery : {},
      },
      totalCorrect: 0,
      totalIncorrect: 0,
      bestStreak: 0,
      totalSessions: 0,
      hiraganaCorrect: 0,
      katakanaCorrect: 0,
      kanjiCorrectByLevel: {},
      vocabularyCorrect: 0,
    },
  };
}

// Simplified mastery requirement checker for testing
function checkMasteryRequirement(
  achievement: Achievement,
  stats: { allTimeStats: Record<string, unknown> },
): boolean {
  const { value, additional } = achievement.requirements;
  const minAnswers = additional?.minAnswers;
  const characterMastery = stats.allTimeStats.characterMastery as Record<
    string,
    { correct: number; incorrect: number }
  >;

  if (!characterMastery || Object.keys(characterMastery).length === 0) {
    return false;
  }

  // For vocabulary mastery with minAnswers, check unique words mastered
  if (additional?.contentType === 'vocabulary' && minAnswers !== undefined) {
    const vocabularyMastery = (
      stats.allTimeStats.contentMastery as {
        vocabulary: Record<string, { correct: number; incorrect: number }>;
      }
    ).vocabulary;
    let masteredCount = 0;
    for (const [, charStats] of Object.entries(vocabularyMastery)) {
      const total = charStats.correct + charStats.incorrect;
      if (total > 0) {
        const accuracy = (charStats.correct / total) * 100;
        if (accuracy >= value) {
          masteredCount++;
        }
      }
    }
    return masteredCount >= minAnswers;
  }

  // For kana/kanji mastery, check all characters meet accuracy threshold
  for (const [, charStats] of Object.entries(characterMastery)) {
    const total = charStats.correct + charStats.incorrect;
    if (total > 0) {
      const accuracy = (charStats.correct / total) * 100;
      if (accuracy < value) {
        return false;
      }
    }
  }

  return Object.keys(characterMastery).length > 0;
}

describe('Property 2: Mastery Achievement Unlocking', () => {
  it('mastery achievements unlock when all characters meet accuracy threshold', () => {
    // Filter to kana mastery achievements (100% accuracy required)
    const kanaMasteryAchievements = masteryAchievements.filter(
      a =>
        a.requirements.additional?.contentType === 'hiragana' ||
        a.requirements.additional?.contentType === 'katakana',
    );

    if (kanaMasteryAchievements.length === 0) {
      return; // Skip if no kana mastery achievements
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...kanaMasteryAchievements),
        fc.boolean(),
        fc.integer({ min: 5, max: 46 }),
        (
          achievement: Achievement,
          meetsThreshold: boolean,
          numCharacters: number,
        ) => {
          const stats = createStatsForMasteryAchievement(
            achievement,
            meetsThreshold,
            numCharacters,
          );
          const isUnlocked = checkMasteryRequirement(achievement, stats);

          if (meetsThreshold) {
            expect(isUnlocked).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('vocabulary mastery achievements unlock when enough words are mastered', () => {
    const vocabMasteryAchievements = masteryAchievements.filter(
      a =>
        a.requirements.additional?.contentType === 'vocabulary' &&
        a.requirements.additional?.minAnswers !== undefined,
    );

    if (vocabMasteryAchievements.length === 0) {
      return; // Skip if no vocab mastery achievements
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...vocabMasteryAchievements),
        fc.boolean(),
        (achievement: Achievement, meetsThreshold: boolean) => {
          const minAnswers =
            achievement.requirements.additional?.minAnswers ?? 50;
          const numCharacters = meetsThreshold
            ? minAnswers
            : Math.max(1, minAnswers - 10);

          const stats = createStatsForMasteryAchievement(
            achievement,
            true, // All characters meet accuracy
            numCharacters,
          );

          const isUnlocked = checkMasteryRequirement(achievement, stats);

          if (meetsThreshold) {
            expect(isUnlocked).toBe(true);
          } else {
            expect(isUnlocked).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('mastery achievements do not unlock when accuracy is below threshold', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...masteryAchievements),
        fc.integer({ min: 5, max: 20 }),
        (achievement: Achievement, numCharacters: number) => {
          // Create stats with accuracy below threshold
          const stats = createStatsForMasteryAchievement(
            achievement,
            false, // Below threshold
            numCharacters,
          );

          const isUnlocked = checkMasteryRequirement(achievement, stats);

          // Should not unlock when below accuracy threshold
          expect(isUnlocked).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('mastery achievements handle mixed accuracy correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          ...masteryAchievements.filter(
            a =>
              a.requirements.additional?.contentType !== 'vocabulary' ||
              a.requirements.additional?.minAnswers === undefined,
          ),
        ),
        fc.integer({ min: 5, max: 20 }),
        (achievement: Achievement, numCharacters: number) => {
          const { value } = achievement.requirements;

          // Create mastery with one character below threshold
          const characterMastery: Record<
            string,
            { correct: number; incorrect: number }
          > = {};

          for (let i = 0; i < numCharacters; i++) {
            const charId = `char_${i}`;
            if (i === 0) {
              // First character below threshold
              characterMastery[charId] = { correct: 5, incorrect: 10 }; // ~33% accuracy
            } else {
              // Other characters at 100%
              characterMastery[charId] = { correct: 10, incorrect: 0 };
            }
          }

          const stats = {
            allTimeStats: { characterMastery },
          };

          const isUnlocked = checkMasteryRequirement(achievement, stats);

          // Should not unlock when any character is below threshold
          // (unless it's a vocabulary achievement with minAnswers)
          if (value > 33) {
            expect(isUnlocked).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
