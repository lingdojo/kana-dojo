import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import QuizProgressIndicator from '@/shared/ui-composite/Game/QuizProgressIndicator';

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
