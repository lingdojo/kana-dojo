import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import QuizProgressIndicator from '@/shared/ui-composite/Game/QuizProgressIndicator';

describe('QuizProgressIndicator', () => {
  it('shows question 1 at the start of a session', () => {
    const { container } = render(
      <QuizProgressIndicator completedQuestions={0} />,
    );

    expect(container.textContent).toBe('Question 1');
  });

  it('advances after each completed question', () => {
    const { container, rerender } = render(
      <QuizProgressIndicator completedQuestions={6} />,
    );

    expect(container.textContent).toBe('Question 7');

    rerender(<QuizProgressIndicator completedQuestions={7} />);

    expect(container.textContent).toBe('Question 8');
  });

  it('returns to question 1 when the session is reset', () => {
    const { container, rerender } = render(
      <QuizProgressIndicator completedQuestions={12} />,
    );

    rerender(<QuizProgressIndicator completedQuestions={0} />);

    expect(container.textContent).toBe('Question 1');
  });

  it('announces progress changes to screen readers', () => {
    const { container } = render(
      <QuizProgressIndicator completedQuestions={0} />,
    );

    expect(container.firstElementChild?.getAttribute('aria-live')).toBe(
      'polite',
    );
  });
});
