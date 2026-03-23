import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameBottomBar } from '@/shared/components/Game/GameBottomBar';

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
});
