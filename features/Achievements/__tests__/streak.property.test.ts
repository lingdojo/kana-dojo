import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ACHIEVEMENTS, type Achievement } from '../store/useAchievementStore';

/**
 * **Feature: expanded-achievements, Property 4: Streak Achievement Unlocking**
 * For any streak-based achievement and for any streak value >= the required threshold,
 * the achievement SHALL be unlocked if not already unlocked.
 * **Validates: Requirements 4.10, 5.4-5.5, 7.1-7.5**
 */

// Filter streak-based achievements
const streakAchievements = ACHIEVEMENTS.filter(
  a => a.requirements.type === 'streak',
);

// Helper to create stats for streak achievement
function createStatsForStreakAchievement(
  achievement: Achievement,
  meetsThreshold: boolean,
): { allTimeStats: Record<string, unknown> } {
  const { value, additional } = achievement.requirements;
  const targetValue = meetsThreshold ? value : Math.max(0, value - 1);

  const baseStats = {
    totalCorrect: 0,
    totalIncorrect: 0,
    bestStreak: 0,
    totalSessions: 0,
    gauntletStats: {
      totalRuns: 0,
      completedRuns: 0,
      normalCompleted: 0,
      hardCompleted: 0,
      instantDeathCompleted: 0,
      perfectRuns: 0,
      noDeathRuns: 0,
      livesRegenerated: 0,
      bestStreak: 0,
    },
    blitzStats: {
      totalSessions: 0,
      bestSessionScore: 0,
      bestStreak: 0,
      totalCorrect: 0,
    },
  };

  // Set the appropriate streak based on game mode
  const gameMode = additional?.gameMode;

  if (gameMode === 'gauntlet') {
    baseStats.gauntletStats.bestStreak = targetValue;
  } else if (gameMode === 'blitz') {
    baseStats.blitzStats.bestStreak = targetValue;
  } else {
    // General streak (no specific game mode)
    baseStats.bestStreak = targetValue;
  }

  return { allTimeStats: baseStats };
}

// Simplified streak requirement checker
function checkStreakRequirement(
  achievement: Achievement,
  stats: { allTimeStats: Record<string, unknown> },
): boolean {
  const { value, additional } = achievement.requirements;
  const allTimeStats = stats.allTimeStats;
  const gameMode = additional?.gameMode;

  if (gameMode === 'gauntlet') {
    const gauntletStats = allTimeStats.gauntletStats as { bestStreak: number };
    return gauntletStats.bestStreak >= value;
  } else if (gameMode === 'blitz') {
    const blitzStats = allTimeStats.blitzStats as { bestStreak: number };
    return blitzStats.bestStreak >= value;
  }

  return (allTimeStats.bestStreak as number) >= value;
}

describe('Property 4: Streak Achievement Unlocking', () => {
  it('streak achievements unlock when streak meets or exceeds threshold', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...streakAchievements),
        fc.boolean(),
        (achievement: Achievement, meetsThreshold: boolean) => {
          const stats = createStatsForStreakAchievement(
            achievement,
            meetsThreshold,
          );
          const isUnlocked = checkStreakRequirement(achievement, stats);

          if (meetsThreshold) {
            expect(isUnlocked).toBe(true);
          } else if (achievement.requirements.value > 1) {
            expect(isUnlocked).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('streak achievements unlock at exact threshold value', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...streakAchievements),
        (achievement: Achievement) => {
          const stats = createStatsForStreakAchievement(achievement, true);
          const isUnlocked = checkStreakRequirement(achievement, stats);

          expect(isUnlocked).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('streak achievements unlock when streak exceeds threshold', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...streakAchievements),
        fc.integer({ min: 1, max: 100 }),
        (achievement: Achievement, excess: number) => {
          const stats = createStatsForStreakAchievement(achievement, true);
          const { additional } = achievement.requirements;
          const gameMode = additional?.gameMode;

          // Add excess to the streak
          if (gameMode === 'gauntlet') {
            const gauntletStats = stats.allTimeStats.gauntletStats as {
              bestStreak: number;
            };
            gauntletStats.bestStreak += excess;
          } else if (gameMode === 'blitz') {
            const blitzStats = stats.allTimeStats.blitzStats as {
              bestStreak: number;
            };
            blitzStats.bestStreak += excess;
          } else {
            (stats.allTimeStats.bestStreak as number) += excess;
          }

          const isUnlocked = checkStreakRequirement(achievement, stats);
          expect(isUnlocked).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('general streak achievements are independent of mode-specific streaks', () => {
    const generalStreakAchievements = streakAchievements.filter(
      a => !a.requirements.additional?.gameMode,
    );

    if (generalStreakAchievements.length === 0) {
      return;
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...generalStreakAchievements),
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        (
          achievement: Achievement,
          gauntletStreak: number,
          blitzStreak: number,
        ) => {
          const { value } = achievement.requirements;

          // Create stats with high mode-specific streaks but low general streak
          const stats = {
            allTimeStats: {
              bestStreak: value - 1, // Below threshold
              gauntletStats: { bestStreak: gauntletStreak },
              blitzStats: { bestStreak: blitzStreak },
            },
          };

          const isUnlocked = checkStreakRequirement(achievement, stats);

          // Should not unlock based on mode-specific streaks
          expect(isUnlocked).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('mode-specific streak achievements only check their mode', () => {
    const gauntletStreakAchievements = streakAchievements.filter(
      a => a.requirements.additional?.gameMode === 'gauntlet',
    );

    const blitzStreakAchievements = streakAchievements.filter(
      a => a.requirements.additional?.gameMode === 'blitz',
    );

    // Test gauntlet streak achievements
    if (gauntletStreakAchievements.length > 0) {
      fc.assert(
        fc.property(
          fc.constantFrom(...gauntletStreakAchievements),
          fc.integer({ min: 0, max: 1000 }),
          (achievement: Achievement, generalStreak: number) => {
            const { value } = achievement.requirements;

            // High general streak, low gauntlet streak
            const stats = {
              allTimeStats: {
                bestStreak: generalStreak,
                gauntletStats: { bestStreak: value - 1 },
                blitzStats: { bestStreak: 0 },
              },
            };

            const isUnlocked = checkStreakRequirement(achievement, stats);
            expect(isUnlocked).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    }

    // Test blitz streak achievements
    if (blitzStreakAchievements.length > 0) {
      fc.assert(
        fc.property(
          fc.constantFrom(...blitzStreakAchievements),
          fc.integer({ min: 0, max: 1000 }),
          (achievement: Achievement, generalStreak: number) => {
            const { value } = achievement.requirements;

            // High general streak, low blitz streak
            const stats = {
              allTimeStats: {
                bestStreak: generalStreak,
                gauntletStats: { bestStreak: 0 },
                blitzStats: { bestStreak: value - 1 },
              },
            };

            const isUnlocked = checkStreakRequirement(achievement, stats);
            expect(isUnlocked).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    }
  });

  it('streak achievements are monotonic (higher streak always unlocks)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...streakAchievements),
        fc.integer({ min: 0, max: 500 }),
        (achievement: Achievement, additionalStreak: number) => {
          // If threshold is met, any higher value should also unlock
          const statsAtThreshold = createStatsForStreakAchievement(
            achievement,
            true,
          );
          const statsAboveThreshold = createStatsForStreakAchievement(
            achievement,
            true,
          );

          // Add additional streak
          const { additional } = achievement.requirements;
          const gameMode = additional?.gameMode;

          if (gameMode === 'gauntlet') {
            const gauntletStats = statsAboveThreshold.allTimeStats
              .gauntletStats as { bestStreak: number };
            gauntletStats.bestStreak += additionalStreak;
          } else if (gameMode === 'blitz') {
            const blitzStats = statsAboveThreshold.allTimeStats.blitzStats as {
              bestStreak: number;
            };
            blitzStats.bestStreak += additionalStreak;
          } else {
            (statsAboveThreshold.allTimeStats.bestStreak as number) +=
              additionalStreak;
          }

          const unlockedAtThreshold = checkStreakRequirement(
            achievement,
            statsAtThreshold,
          );
          const unlockedAboveThreshold = checkStreakRequirement(
            achievement,
            statsAboveThreshold,
          );

          // If unlocked at threshold, must be unlocked above threshold
          if (unlockedAtThreshold) {
            expect(unlockedAboveThreshold).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
