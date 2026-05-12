import { beforeEach, describe, expect, it, vi } from 'vitest';

const memory = new Map<string, unknown>();

vi.mock('localforage', () => {
  const createInstance = () => ({
    async getItem<T>(key: string) {
      return (memory.get(key) as T | null | undefined) ?? null;
    },
    async setItem<T>(key: string, value: T) {
      memory.set(key, value);
      return value;
    },
  });

  return {
    default: {
      createInstance,
    },
  };
});

import useStatsStore from '@/features/Progress/store/useStatsStore';
import useSetProgressStore from '@/features/Progress/store/useSetProgressStore';

const emptyProgress = {
  version: 1 as const,
  updatedAt: 0,
  kanji: {},
  vocabulary: {},
};

describe('useSetProgressStore', () => {
  beforeEach(() => {
    memory.clear();
    useSetProgressStore.setState({
      isHydrated: false,
      data: { ...emptyProgress },
    });
    useStatsStore.setState({
      allTimeStats: {
        ...useStatsStore.getState().allTimeStats,
        totalSessions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        bestStreak: 0,
        characterMastery: {},
        hiraganaCorrect: 0,
        katakanaCorrect: 0,
        kanjiCorrectByLevel: {},
        vocabularyCorrect: 0,
      },
    });
  });

  it('hydrates missing persisted progress as empty state', async () => {
    await useSetProgressStore.getState().hydrate();

    expect(useSetProgressStore.getState().isHydrated).toBe(true);
    expect(useSetProgressStore.getState().data.kanji).toEqual({});
    expect(useSetProgressStore.getState().data.vocabulary).toEqual({});
  });

  it('caps kanji progress at 100 correct answers', async () => {
    await useSetProgressStore.getState().hydrate();

    for (let i = 0; i < 250; i++) {
      await useSetProgressStore.getState().recordKanjiProgress('日');
    }

    expect(useSetProgressStore.getState().data.kanji['日']).toEqual({
      correct: 100,
    });
  });

  it('tracks vocabulary meaning and reading progress separately with caps', async () => {
    await useSetProgressStore.getState().hydrate();

    for (let i = 0; i < 120; i++) {
      await useSetProgressStore
        .getState()
        .recordVocabularyProgress('日本語', 'meaning');
    }
    for (let i = 0; i < 130; i++) {
      await useSetProgressStore
        .getState()
        .recordVocabularyProgress('日本語', 'reading');
    }

    expect(useSetProgressStore.getState().data.vocabulary['日本語']).toEqual({
      meaningCorrect: 50,
      readingCorrect: 50,
    });
  });

  it('clears the set progress index', async () => {
    await useSetProgressStore.getState().hydrate();
    await useSetProgressStore.getState().recordKanjiProgress('火');

    await useSetProgressStore.getState().clearSetProgress();

    expect(useSetProgressStore.getState().data.kanji).toEqual({});
    expect(useSetProgressStore.getState().data.vocabulary).toEqual({});
  });

  it('clearAllProgress also clears the set progress index', async () => {
    await useSetProgressStore.getState().hydrate();
    await useSetProgressStore.getState().recordKanjiProgress('水');

    useStatsStore.getState().clearAllProgress();
    await Promise.resolve();

    expect(useSetProgressStore.getState().data.kanji).toEqual({});
  });
});
