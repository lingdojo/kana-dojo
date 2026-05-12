import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import useTilesMode from '@/shared/hooks/game/useTilesMode';
import useClassicSessionStore from '@/shared/store/useClassicSessionStore';

describe('useTilesMode', () => {
  beforeEach(() => {
    useClassicSessionStore.setState({ activeSessionId: null });
  });

  it('starts adaptive tiles progression at the minimum word length', () => {
    const { result } = renderHook(() =>
      useTilesMode({
        enableAdaptiveWordLength: true,
        minWordLength: 1,
        maxWordLength: 3,
      }),
    );

    expect(result.current.wordLength).toBe(1);
  });

  it('resets adaptive word length when a new classic session starts', async () => {
    const { result } = renderHook(() =>
      useTilesMode({
        enableAdaptiveWordLength: true,
        minWordLength: 1,
        maxWordLength: 3,
      }),
    );

    act(() => {
      result.current.setWordLength(3);
    });

    expect(result.current.wordLength).toBe(3);

    act(() => {
      useClassicSessionStore.setState({ activeSessionId: 'session-2' });
    });

    await waitFor(() => {
      expect(result.current.wordLength).toBe(1);
    });
  });

  it('increases word length by 1 after every 5 consecutive correct answers', () => {
    const { result } = renderHook(() =>
      useTilesMode({
        enableAdaptiveWordLength: true,
        minWordLength: 1,
        maxWordLength: 3,
        correctAnswersPerLengthStep: 5,
      }),
    );

    expect(result.current.wordLength).toBe(1);

    for (let i = 0; i < 5; i += 1) {
      act(() => {
        result.current.decideNextMode();
      });
    }
    expect(result.current.wordLength).toBe(2);

    for (let i = 0; i < 5; i += 1) {
      act(() => {
        result.current.decideNextMode();
      });
    }
    expect(result.current.wordLength).toBe(3);
  });

  it('decreases word length by 1 on each wrong answer', () => {
    const { result } = renderHook(() =>
      useTilesMode({
        enableAdaptiveWordLength: true,
        minWordLength: 1,
        maxWordLength: 3,
        correctAnswersPerLengthStep: 5,
      }),
    );

    for (let i = 0; i < 10; i += 1) {
      act(() => {
        result.current.decideNextMode();
      });
    }
    expect(result.current.wordLength).toBe(3);

    act(() => {
      result.current.recordWrongAnswer();
    });
    expect(result.current.wordLength).toBe(2);

    act(() => {
      result.current.recordWrongAnswer();
    });
    expect(result.current.wordLength).toBe(1);

    act(() => {
      result.current.recordWrongAnswer();
    });
    expect(result.current.wordLength).toBe(1);
  });

  it('alternates the celebration mode on each correct answer decision', () => {
    const { result } = renderHook(() =>
      useTilesMode({
        enableAdaptiveWordLength: false,
        minConsecutiveForTrigger: 0,
        baseProbability: 1,
        maxProbability: 1,
      }),
    );

    expect(result.current.nextCelebrationMode).toBe('bounce');

    act(() => {
      result.current.decideNextMode();
    });
    expect(result.current.nextCelebrationMode).toBe('explode');

    act(() => {
      result.current.decideNextMode();
    });
    expect(result.current.nextCelebrationMode).toBe('bounce');
  });
});
