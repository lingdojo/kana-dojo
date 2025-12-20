import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { QuizQuestion } from '../components/mdx/QuizQuestion';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Safe characters for strings
const safeChars =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';

// Generate safe strings
const safeStringArb = fc
  .array(fc.constantFrom(...safeChars.split('')), {
    minLength: 1,
    maxLength: 30
  })
  .map(chars => chars.join('').trim())
  .filter(s => s.length > 0);

// Generate options array (2-6 options)
const optionsArb = fc.array(safeStringArb, { minLength: 2, maxLength: 6 });

// Generate quiz question props with valid answer index
const quizPropsArb = optionsArb.chain(options =>
  fc.record({
    question: safeStringArb,
    options: fc.constant(options),
    answer: fc.integer({ min: 0, max: options.length - 1 }),
    explanation: fc.option(safeStringArb, { nil: undefined })
  })
);

/**
 * **Feature: blog-system, Property 18: QuizQuestion Renders Options and Handles Selection**
 * For any QuizQuestion with a question string, options array, and answer index,
 * the rendered output should display all options, and selecting the correct answer
 * should indicate success while selecting incorrect answers should indicate failure.
 * **Validates: Requirements 6.4**
 */
describe('Property 18: QuizQuestion Renders Options and Handles Selection', () => {
  it('renders the question text', () => {
    fc.assert(
      fc.property(quizPropsArb, props => {
        const { getByTestId, unmount } = render(
          <QuizQuestion
            question={props.question}
            options={props.options}
            answer={props.answer}
            explanation={props.explanation}
          />
        );
        const questionText = getByTestId('quiz-question-text');
        expect(questionText.textContent).toBe(props.question);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders all options', () => {
    fc.assert(
      fc.property(quizPropsArb, props => {
        const { getAllByTestId, unmount } = render(
          <QuizQuestion
            question={props.question}
            options={props.options}
            answer={props.answer}
          />
        );
        const optionElements = getAllByTestId('quiz-option');
        expect(optionElements.length).toBe(props.options.length);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders each option text correctly', () => {
    fc.assert(
      fc.property(quizPropsArb, props => {
        const { getAllByTestId, unmount } = render(
          <QuizQuestion
            question={props.question}
            options={props.options}
            answer={props.answer}
          />
        );
        const optionTexts = getAllByTestId('quiz-option-text');
        props.options.forEach((option, index) => {
          expect(optionTexts[index].textContent).toBe(option);
        });
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('shows success feedback when correct answer is selected', () => {
    fc.assert(
      fc.property(quizPropsArb, props => {
        const { getAllByTestId, getByTestId, unmount } = render(
          <QuizQuestion
            question={props.question}
            options={props.options}
            answer={props.answer}
          />
        );

        const optionElements = getAllByTestId('quiz-option');
        fireEvent.click(optionElements[props.answer]);

        const feedback = getByTestId('quiz-feedback');
        expect(feedback.getAttribute('data-correct')).toBe('true');

        const feedbackText = getByTestId('quiz-feedback-text');
        expect(feedbackText.textContent).toContain('Correct');

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('shows failure feedback when incorrect answer is selected', () => {
    fc.assert(
      fc.property(
        quizPropsArb.filter(props => props.options.length > 1),
        props => {
          // Select an incorrect answer (any index that's not the correct answer)
          const incorrectIndex = props.answer === 0 ? 1 : props.answer - 1;

          const { getAllByTestId, getByTestId, unmount } = render(
            <QuizQuestion
              question={props.question}
              options={props.options}
              answer={props.answer}
            />
          );

          const optionElements = getAllByTestId('quiz-option');
          fireEvent.click(optionElements[incorrectIndex]);

          const feedback = getByTestId('quiz-feedback');
          expect(feedback.getAttribute('data-correct')).toBe('false');

          const feedbackText = getByTestId('quiz-feedback-text');
          expect(feedbackText.textContent).toContain('Incorrect');

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('marks correct option with data-correct attribute', () => {
    fc.assert(
      fc.property(quizPropsArb, props => {
        const { getAllByTestId, unmount } = render(
          <QuizQuestion
            question={props.question}
            options={props.options}
            answer={props.answer}
          />
        );

        const optionElements = getAllByTestId('quiz-option');
        optionElements.forEach((option, index) => {
          expect(option.getAttribute('data-correct')).toBe(
            String(index === props.answer)
          );
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('shows explanation when provided after answering', () => {
    fc.assert(
      fc.property(
        quizPropsArb.filter(props => props.explanation !== undefined),
        props => {
          const { getAllByTestId, getByTestId, unmount } = render(
            <QuizQuestion
              question={props.question}
              options={props.options}
              answer={props.answer}
              explanation={props.explanation}
            />
          );

          const optionElements = getAllByTestId('quiz-option');
          fireEvent.click(optionElements[props.answer]);

          const explanation = getByTestId('quiz-explanation');
          expect(explanation.textContent).toBe(props.explanation);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('disables options after answering', () => {
    fc.assert(
      fc.property(quizPropsArb, props => {
        const { getAllByTestId, unmount } = render(
          <QuizQuestion
            question={props.question}
            options={props.options}
            answer={props.answer}
          />
        );

        const optionElements = getAllByTestId('quiz-option');
        fireEvent.click(optionElements[props.answer]);

        // All options should be disabled after answering
        optionElements.forEach(option => {
          expect(option.hasAttribute('disabled')).toBe(true);
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
