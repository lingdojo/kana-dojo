import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuizProgressIndicator from '@/shared/ui-composite/Game/QuizProgressIndicator';
import ReturnFromGame from '@/shared/ui-composite/Game/ReturnFromGame';
import BlitzActiveGame from '@/shared/ui-composite/Blitz/ActiveGame';
import GauntletActiveGame from '@/shared/ui-composite/Gauntlet/ActiveGame';
import useClassicFeedbackStore from '@/shared/store/useClassicFeedbackStore';

const mockStatsState = vi.hoisted(() => ({
  correctAnswers: 0,
  wrongAnswers: 0,
  stars: 0,
  currentStreak: 0,
  saveSession: vi.fn(),
  toggleStats: vi.fn(),
  setNewTotalMilliseconds: vi.fn(),
}));

vi.mock('@/core/i18n/routing', () => ({
  usePathname: () => '/kana/train',
}));

vi.mock('react-timer-hook', () => ({
  useStopwatch: () => ({
    totalMilliseconds: 0,
    start: vi.fn(),
    pause: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/generic/useAudio', () => ({
  useClick: () => ({ playClick: vi.fn() }),
}));

vi.mock('@/features/Preferences', () => ({
  useThemePreferences: () => ({ isGlassMode: false }),
}));

vi.mock('@/features/Progress', () => ({
  useStatsDisplay: () => mockStatsState,
}));

vi.mock('@/features/Kana', () => ({
  useKanaSelection: () => ({ selectedGroupIndices: [0] }),
}));

vi.mock('@/features/Kanji', () => ({
  useKanjiSelection: () => ({ selectedSets: [] }),
}));

vi.mock('@/features/Vocabulary', () => ({
  useVocabSelection: () => ({ selectedSets: [] }),
}));

vi.mock('@/shared/ui-composite/Game/GameScoreBar', () => ({
  default: () => <div data-testid='mock-score-bar' />,
}));

vi.mock('@/shared/ui-composite/Game/Stars', () => ({
  default: () => null,
}));

vi.mock('@/shared/ui-composite/Menu/SelectedLevelsCard', () => ({
  SelectedLevelsCard: () => null,
}));

vi.mock('@/shared/ui-composite/Timer/GoalTimersPanel', () => ({
  default: () => null,
}));

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  mockStatsState.correctAnswers = 0;
  mockStatsState.wrongAnswers = 0;
  mockStatsState.stars = 0;
  mockStatsState.currentStreak = 0;
  useClassicFeedbackStore.setState({
    isClassicSessionActive: false,
    isShowingAnswerSummary: false,
    isShowingCorrectBottomBar: false,
  });
});

describe('QuizProgressIndicator', () => {
  it('displays Question 1 at the start of an endless session', () => {
    const { container } = render(<QuizProgressIndicator currentQuestion={1} />);

    expect(container.textContent).toBe('Question 1');
  });

  it('displays current question and total when totalQuestions is provided', () => {
    const { container } = render(
      <QuizProgressIndicator currentQuestion={7} totalQuestions={20} />,
    );

    expect(container.textContent).toBe('Question 7 / 20');
  });

  it('updates after each question and resets cleanly for a new session', () => {
    const { container, rerender } = render(
      <QuizProgressIndicator currentQuestion={1} totalQuestions={20} />,
    );
    expect(container.textContent).toBe('Question 1 / 20');

    rerender(<QuizProgressIndicator currentQuestion={8} totalQuestions={20} />);
    expect(container.textContent).toBe('Question 8 / 20');

    rerender(<QuizProgressIndicator currentQuestion={1} totalQuestions={20} />);
    expect(container.textContent).toBe('Question 1 / 20');
  });

  it('clamps out-of-range values safely', () => {
    const { container, rerender } = render(
      <QuizProgressIndicator currentQuestion={0} />,
    );
    expect(container.textContent).toBe('Question 1');

    rerender(
      <QuizProgressIndicator currentQuestion={25} totalQuestions={20} />,
    );
    expect(container.textContent).toBe('Question 20 / 20');
  });

  it('announces progress updates politely for screen readers', () => {
    const { container } = render(<QuizProgressIndicator currentQuestion={1} />);

    expect(container.firstElementChild?.getAttribute('aria-live')).toBe(
      'polite',
    );
  });
});

describe('Classic ReturnFromGame progress integration', () => {
  it('waits until post-answer feedback closes before advancing Question N and resets on new session', () => {
    const { rerender } = render(
      <ReturnFromGame isHidden={false} gameMode='Pick' onQuit={vi.fn()} />,
    );

    expect(screen.getByText('Question').parentElement?.textContent).toBe(
      'Question 1',
    );

    // Answer submitted correctly, AnswerSummary / Correct bar still visible:
    act(() => {
      mockStatsState.correctAnswers = 1;
      useClassicFeedbackStore.getState().setShowingCorrectBottomBar(true);
    });
    rerender(
      <ReturnFromGame isHidden={false} gameMode='Pick' onQuit={vi.fn()} />,
    );
    expect(screen.getByText('Question').parentElement?.textContent).toBe(
      'Question 1',
    );

    // User clicks Continue to advance to Question 2:
    act(() => {
      useClassicFeedbackStore.getState().setShowingCorrectBottomBar(false);
    });
    expect(screen.getByText('Question').parentElement?.textContent).toBe(
      'Question 2',
    );

    // Same hold-back applies to AnswerSummary:
    act(() => {
      mockStatsState.correctAnswers = 2;
      useClassicFeedbackStore.getState().setShowingAnswerSummary(true);
    });
    rerender(
      <ReturnFromGame isHidden={false} gameMode='Pick' onQuit={vi.fn()} />,
    );
    expect(screen.getByText('Question').parentElement?.textContent).toBe(
      'Question 2',
    );

    // New session resets back to Question 1:
    act(() => {
      mockStatsState.correctAnswers = 0;
      useClassicFeedbackStore.getState().setShowingAnswerSummary(false);
    });
    rerender(
      <ReturnFromGame isHidden={false} gameMode='Pick' onQuit={vi.fn()} />,
    );
    expect(screen.getByText('Question').parentElement?.textContent).toBe(
      'Question 1',
    );
  });
});

describe('Blitz ActiveGame progress integration', () => {
  it('displays and advances Question N during a Blitz session', () => {
    const baseProps = {
      minutes: 1,
      seconds: 0,
      timeLeft: 60,
      challengeDuration: 60,
      currentQuestion: 'あ',
      renderQuestion: (q: string) => q,
      isReverseActive: false,
      gameMode: 'Pick' as const,
      inputPlaceholder: 'Type...',
      userAnswer: '',
      setUserAnswer: vi.fn(),
      onSubmit: vi.fn(),
      getCorrectAnswer: (q: string) => q,
      shuffledOptions: ['a', 'i', 'u'],
      wrongSelectedAnswers: [],
      onOptionClick: vi.fn(),
      items: ['あ', 'い', 'う'],
      lastAnswerCorrect: null,
      showGoalTimers: false,
      elapsedTime: 0,
      goalTimers: {
        goals: [],
        addGoal: vi.fn(),
        removeGoal: vi.fn(),
        clearGoals: vi.fn(),
        nextGoal: undefined,
        progressToNextGoal: 0,
      },
      onCancel: vi.fn(),
    };

    const { rerender } = render(
      <BlitzActiveGame
        {...baseProps}
        stats={{ correct: 0, wrong: 0, streak: 0 }}
      />,
    );
    expect(screen.getByText('Question').parentElement?.textContent).toBe(
      'Question 1',
    );

    rerender(
      <BlitzActiveGame
        {...baseProps}
        stats={{ correct: 3, wrong: 1, streak: 2 }}
      />,
    );
    expect(screen.getByText('Question').parentElement?.textContent).toBe(
      'Question 4',
    );
  });
});

describe('Gauntlet ActiveGame progress integration', () => {
  it('displays Question N / Total and resets tile state when questionKey changes', () => {
    const baseProps = {
      dojoType: 'kana' as const,
      gameMode: 'Pick' as const,
      totalQuestions: 20,
      lives: 3,
      maxLives: 3,
      currentQuestion: 'あ',
      renderQuestion: (q: string) => q,
      isReverseActive: false,
      shuffledOptions: ['a', 'i', 'u'],
      items: ['あ', 'い', 'う'],
      onSubmit: vi.fn(),
      getCorrectOption: () => 'a',
      onCancel: vi.fn(),
    };

    const { rerender } = render(
      <GauntletActiveGame {...baseProps} currentIndex={0} questionKey='あ-0' />,
    );
    expect(screen.getByText('Question').parentElement?.textContent).toBe(
      'Question 1 / 20',
    );

    // Place a tile and check it, then transition questionKey:
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    fireEvent.click(screen.getByRole('button', { name: 'check' }));
    expect(screen.getByRole('button', { name: 'next' })).toBeTruthy();

    rerender(
      <GauntletActiveGame {...baseProps} currentIndex={6} questionKey='い-6' />,
    );
    expect(screen.getByText('Question').parentElement?.textContent).toBe(
      'Question 7 / 20',
    );
    expect(screen.getByRole('button', { name: 'check' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'next' })).toBeNull();
  });
});
