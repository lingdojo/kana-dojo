'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/shared/utils/utils';

interface QuizQuestionProps {
  /** The question text to display */
  question?: string;
  /** Array of answer options */
  options?: string[];
  /** Index of the correct answer (0-based) */
  answer?: number;
  /** Optional explanation shown after answering */
  explanation?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * QuizQuestion Component for MDX
 * Renders an interactive multiple-choice question with success/failure feedback.
 *
 * @example
 * <QuizQuestion
 *   question="What is the hiragana for 'a'?"
 *   options={['あ', 'い', 'う', 'え']}
 *   answer={0}
 *   explanation="あ (a) is the first hiragana character."
 * />
 */
export function QuizQuestion({
  question,
  options,
  answer,
  explanation,
  className,
}: QuizQuestionProps) {
  const normalizedOptions = Array.isArray(options)
    ? options.filter(option => typeof option === 'string')
    : [];
  const normalizedQuestion =
    typeof question === 'string' && question.trim().length > 0
      ? question
      : 'Choose the best answer.';
  const normalizedAnswer =
    typeof answer === 'number' &&
    Number.isInteger(answer) &&
    answer >= 0 &&
    answer < normalizedOptions.length
      ? answer
      : -1;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleOptionClick = useCallback(
    (index: number) => {
      if (hasAnswered) return;
      setSelectedIndex(index);
      setHasAnswered(true);
    },
    [hasAnswered],
  );

  const isCorrect = normalizedAnswer >= 0 && selectedIndex === normalizedAnswer;

  const getOptionStyles = (index: number) => {
    if (!hasAnswered) {
      return 'border-(--border-color) bg-(--card-color) hover:border-(--main-color) cursor-pointer';
    }

    if (index === normalizedAnswer) {
      return 'border-green-500 bg-green-500/10 text-green-400';
    }

    if (index === selectedIndex && index !== normalizedAnswer) {
      return 'border-red-500 bg-red-500/10 text-red-400';
    }

    return 'border-(--border-color) bg-(--card-color) opacity-50';
  };

  return (
    <div
      className={cn(
        'my-6 rounded-lg border border-(--border-color) bg-(--card-color) p-4',
        className,
      )}
      data-testid='quiz-question'
    >
      {/* Question */}
      <p
        className='mb-4 text-lg font-medium text-(--main-color)'
        data-testid='quiz-question-text'
      >
        {normalizedQuestion}
      </p>

      {/* Options */}
      <div className='space-y-2' data-testid='quiz-options'>
        {normalizedOptions.length === 0 ? (
          <p className='text-sm text-(--secondary-color) opacity-80'>
            Quiz options are unavailable for this question.
          </p>
        ) : (
          normalizedOptions.map((option, index) => (
          <button
            key={`${option}-${index}`}
            onClick={() => handleOptionClick(index)}
            disabled={hasAnswered}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
              getOptionStyles(index),
            )}
            data-testid='quiz-option'
            data-index={index}
            data-selected={selectedIndex === index}
            data-correct={index === normalizedAnswer}
            aria-pressed={selectedIndex === index}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                hasAnswered && index === normalizedAnswer
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : hasAnswered && index === selectedIndex
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-(--border-color)',
              )}
            >
              {String.fromCharCode(65 + index)}
            </span>
            <span data-testid='quiz-option-text'>{option}</span>
          </button>
          ))
        )}
      </div>

      {/* Feedback */}
      {hasAnswered && normalizedOptions.length > 0 && (
        <div
          className={cn(
            'mt-4 rounded-lg p-3',
            isCorrect
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400',
          )}
          data-testid='quiz-feedback'
          data-correct={isCorrect}
        >
          <p className='font-medium' data-testid='quiz-feedback-text'>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          {typeof explanation === 'string' && explanation.trim().length > 0 && (
            <p
              className='mt-1 text-sm text-(--main-color)'
              data-testid='quiz-explanation'
            >
              {explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizQuestion;

