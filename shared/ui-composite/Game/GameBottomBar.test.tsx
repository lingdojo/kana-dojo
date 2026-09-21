import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameBottomBar } from '@/shared/ui-composite/Game/GameBottomBar';
import useContinueRequestStore from '@/shared/store/useContinueRequestStore';

describe('GameBottomBar feedback freezing', () => {
  it('keeps last checked feedback while transitioning through check state', () => {
    const onAction = vi.fn();
    const { rerender } = render(
      <GameBottomBar
        state='correct'
        onAction={onAction}
        canCheck
        feedbackContent='answer-a'
      />,
    );

    expect(screen.getByText('answer-a')).toBeTruthy();

    rerender(
      <GameBottomBar
        state='check'
        onAction={onAction}
        canCheck
        feedbackContent='answer-b'
      />,
    );

    expect(screen.getByText('answer-a')).toBeTruthy();
    expect(screen.queryByText('answer-b')).toBeNull();

    rerender(
      <GameBottomBar
        state='correct'
        onAction={onAction}
        canCheck
        feedbackContent='answer-b'
      />,
    );

    expect(screen.getByText('answer-b')).toBeTruthy();
  });

  it('hides wrong feedback when clear signal changes', () => {
    const onAction = vi.fn();
    const { rerender } = render(
      <GameBottomBar
        state='wrong'
        onAction={onAction}
        canCheck
        feedbackContent='answer-a'
      />,
    );

    expect(screen.getByText('Wrong! Correct answer:')).toBeTruthy();
    expect(screen.getByText('answer-a')).toBeTruthy();

    rerender(
      <GameBottomBar
        state='wrong'
        onAction={onAction}
        canCheck
        feedbackContent='answer-a'
        clearWrongFeedbackSignal={1}
      />,
    );

    expect(screen.queryByText('Wrong! Correct answer:')).toBeNull();
    expect(screen.queryByText('answer-a')).toBeNull();

    rerender(
      <GameBottomBar
        state='wrong'
        onAction={onAction}
        canCheck
        feedbackContent='answer-a'
        clearWrongFeedbackSignal={1}
        wrongFeedbackSignal={1}
      />,
    );

    expect(screen.getByText('Wrong! Correct answer:')).toBeTruthy();
    expect(screen.getByText('answer-a')).toBeTruthy();
  });
});

describe('GameBottomBar milestone-skip auto-continue', () => {
  beforeEach(() => {
    useContinueRequestStore.setState({ requestCount: 0 });
  });

  it('triggers onAction when a continue request arrives in correct state', () => {
    const onAction = vi.fn();
    const buttonRef = React.createRef<HTMLButtonElement>();
    render(
      <GameBottomBar
        state='correct'
        onAction={onAction}
        canCheck
        feedbackContent='answer-a'
        buttonRef={buttonRef}
      />,
    );

    act(() => {
      useContinueRequestStore.getState().requestContinue();
    });

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onAction for continue requests in check state', () => {
    const onAction = vi.fn();
    render(
      <GameBottomBar
        state='check'
        onAction={onAction}
        canCheck={false}
        feedbackContent={null}
      />,
    );

    act(() => {
      useContinueRequestStore.getState().requestContinue();
    });

    expect(onAction).not.toHaveBeenCalled();
  });

  it('does not trigger onAction for continue requests in wrong state', () => {
    const onAction = vi.fn();
    render(
      <GameBottomBar
        state='wrong'
        onAction={onAction}
        canCheck
        feedbackContent='answer-a'
      />,
    );

    act(() => {
      useContinueRequestStore.getState().requestContinue();
    });

    expect(onAction).not.toHaveBeenCalled();
  });

  it('does not auto-continue on mount when previous requests exist', () => {
    const onAction = vi.fn();
    useContinueRequestStore.setState({ requestCount: 3 });

    render(
      <GameBottomBar
        state='correct'
        onAction={onAction}
        canCheck
        feedbackContent='answer-a'
      />,
    );

    expect(onAction).not.toHaveBeenCalled();
  });
});
