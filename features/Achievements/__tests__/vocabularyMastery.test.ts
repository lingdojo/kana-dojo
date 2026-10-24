import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStatsStore } from '@/features/Progress';
import { useGameStats } from '@/shared/hooks/game/useGameStats';
import useAchievementStore from '@/features/Achievements/store/useAchievementStore';
import { countMasteredVocabulary } from '@/features/Achievements/lib/countMasteredVocabulary';

vi.mock('@/features/Progress', async () => ({
  // Load only the store; the public barrel also imports Next navigation code.
  // eslint-disable-next-line import/no-restricted-paths
  useStatsStore: (await import('@/features/Progress/store/useStatsStore'))
    .default,
}));

const checkVocabularyAchievements = () => {
  useAchievementStore.getState().checkAchievements(useStatsStore.getState());
  return useAchievementStore.getState().unlockedAchievements;
};

describe('vocabulary mastery achievements', () => {
  beforeEach(() => {
    const stats = useStatsStore.getState().allTimeStats;
    useStatsStore.setState({
      allTimeStats: {
        ...stats,
        characterMastery: {},
        contentMastery: { kana: {}, kanji: {}, vocabulary: {} },
        vocabularyCorrect: 0,
      },
    });
    useAchievementStore.setState({
      unlockedAchievements: {},
      notifications: [],
      unseenNotifications: [],
      hasUnseenNotifications: false,
      totalPoints: 0,
      level: 1,
    });
  });

  it('does not unlock vocabulary awards from kana-only mastery', () => {
    const { result } = renderHook(() => useGameStats('kana'));
    const kana = [...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほ'];
    act(() => {
      for (let i = 0; i < 200; i++) {
        result.current.incrementCharacterScore(
          `${kana[Math.floor(i / kana.length)]}${kana[i % kana.length]}`,
          'correct',
        );
      }
    });

    const stats = useStatsStore.getState().allTimeStats;
    expect(Object.keys(stats.characterMastery)).toHaveLength(200);
    expect(countMasteredVocabulary(stats.contentMastery.vocabulary, 90)).toBe(
      0,
    );
    const unlocked = checkVocabularyAchievements();
    expect(unlocked.word_wizard).toBeUndefined();
    expect(unlocked.linguistic_legend).toBeUndefined();
  });

  it('keeps identical kana, kanji, and vocabulary keys in separate mastery maps', () => {
    const store = useStatsStore.getState();
    act(() => {
      store.incrementCharacterScore('日', 'correct', 'kana');
      store.incrementCharacterScore('日', 'wrong', 'kanji');
      store.incrementCharacterScore('日', 'correct', 'vocabulary');
    });

    const { characterMastery, contentMastery } =
      useStatsStore.getState().allTimeStats;
    expect(characterMastery['日']).toEqual({ correct: 2, incorrect: 1 });
    expect(contentMastery.kana['日']).toEqual({ correct: 1, incorrect: 0 });
    expect(contentMastery.kanji['日']).toEqual({ correct: 0, incorrect: 1 });
    expect(contentMastery.vocabulary['日']).toEqual({
      correct: 1,
      incorrect: 0,
    });
  });

  it('unlocks vocabulary awards for explicitly recorded words, including short words', () => {
    const { result } = renderHook(() => useGameStats('vocabulary'));
    act(() => {
      for (let i = 0; i < 50; i++) {
        const word = i === 0 ? '日' : `word-${i}`;
        result.current.incrementCharacterScore(word, 'correct');
      }
    });

    expect(checkVocabularyAchievements().word_wizard).toBeDefined();
    expect(
      useAchievementStore.getState().unlockedAchievements.linguistic_legend,
    ).toBeUndefined();

    act(() => {
      for (let i = 50; i < 200; i++) {
        result.current.incrementCharacterScore(`word-${i}`, 'correct');
      }
    });
    expect(checkVocabularyAchievements().linguistic_legend).toBeDefined();
  });

  it('keeps legacy untyped progress without assigning it a content type', () => {
    const merge = useStatsStore.persist.getOptions().merge!;
    const legacyMastery = {
      ...Object.fromEntries(
        Array.from({ length: 50 }, (_, i) => [
          `legacy-${i}`,
          { correct: 5, incorrect: 0 },
        ]),
      ),
      しゅ: { correct: 5, incorrect: 0 },
      ねこ: { correct: 5, incorrect: 0 },
    };
    const restored = merge(
      { allTimeStats: { characterMastery: legacyMastery } },
      useStatsStore.getState(),
    );
    useStatsStore.setState(restored);

    expect(useStatsStore.getState().allTimeStats.characterMastery).toEqual(
      legacyMastery,
    );
    expect(useStatsStore.getState().allTimeStats.contentMastery).toEqual({
      kana: {},
      kanji: {},
      vocabulary: {},
    });
    expect(checkVocabularyAchievements().word_wizard).toBeUndefined();

    useStatsStore
      .getState()
      .incrementCharacterScore('ねこ', 'correct', 'vocabulary');
    expect(
      useStatsStore.getState().allTimeStats.characterMastery['ねこ'].correct,
    ).toBe(6);
    expect(
      useStatsStore.getState().allTimeStats.contentMastery.vocabulary['ねこ'],
    ).toEqual({
      correct: 1,
      incorrect: 0,
    });
  });

  it('restores typed vocabulary progress and already unlocked achievements', () => {
    const statsMerge = useStatsStore.persist.getOptions().merge!;
    const savedVocabulary = Object.fromEntries(
      Array.from({ length: 49 }, (_, i) => [
        `word-${i}`,
        { correct: 9, incorrect: 1 },
      ]),
    );
    useStatsStore.setState(
      statsMerge(
        { allTimeStats: { contentMastery: { vocabulary: savedVocabulary } } },
        useStatsStore.getState(),
      ),
    );

    expect(
      countMasteredVocabulary(
        useStatsStore.getState().allTimeStats.contentMastery.vocabulary,
        90,
      ),
    ).toBe(49);
    useStatsStore
      .getState()
      .incrementCharacterScore('word-49', 'correct', 'vocabulary');
    expect(checkVocabularyAchievements().word_wizard).toBeDefined();

    const achievementMerge = useAchievementStore.persist.getOptions().merge!;
    const savedAchievement =
      useAchievementStore.getState().unlockedAchievements.word_wizard;
    useAchievementStore.setState({ unlockedAchievements: {} });
    useAchievementStore.setState(
      achievementMerge(
        { unlockedAchievements: { word_wizard: savedAchievement } },
        useAchievementStore.getState(),
      ),
    );
    expect(
      useAchievementStore.getState().unlockedAchievements.word_wizard,
    ).toEqual(savedAchievement);
  });

  it('rehydrates legacy stats without assigning vocabulary credit and persists new typed practice', async () => {
    const storageKey = 'kanadojo-stats';
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        state: {
          allTimeStats: {
            characterMastery: { 'ねこ': { correct: 5, incorrect: 0 } },
          },
        },
        version: 0,
      }),
    );

    await useStatsStore.persist.rehydrate();
    expect(useStatsStore.getState().allTimeStats.characterMastery['ねこ']).toEqual({
      correct: 5,
      incorrect: 0,
    });
    expect(useStatsStore.getState().allTimeStats.contentMastery.vocabulary).toEqual(
      {},
    );

    useStatsStore
      .getState()
      .incrementCharacterScore('ねこ', 'correct', 'vocabulary');
    await new Promise(resolve => setTimeout(resolve, 2100));
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    expect(saved.state.allTimeStats.characterMastery['ねこ']).toEqual({
      correct: 6,
      incorrect: 0,
    });
    expect(saved.state.allTimeStats.contentMastery.vocabulary['ねこ']).toEqual({
      correct: 1,
      incorrect: 0,
    });
  });
});
