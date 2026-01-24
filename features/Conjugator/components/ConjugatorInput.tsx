'use client';

import { useCallback, useRef, useEffect } from 'react';
import { X, Keyboard, Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import type { ConjugationError } from '../types';

interface ConjugatorInputProps {
  /** Current input value */
  value: string;
  /** Callback when input changes */
  onChange: (value: string) => void;
  /** Callback when conjugate is triggered */
  onConjugate: () => void;
  /** Whether conjugation is in progress */
  isLoading: boolean;
  /** Error from conjugation attempt */
  error: ConjugationError | null;
}

/**
 * ConjugatorInput - Text input component for Japanese verb conjugation
 *
 * Features:
 * - Japanese font support
 * - Conjugate button with loading state
 * - Enter key shortcut to conjugate
 * - Validation error display
 * - Proper ARIA labels and roles
 *
 * Requirements: 1.1, 1.3, 1.4, 5.1, 5.3, 10.2
 */
export default function ConjugatorInput({
  value,
  onChange,
  onConjugate,
  isLoading,
  error,
}: ConjugatorInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDisabled = isLoading;
  const canConjugate = value.trim().length > 0 && !isLoading;

  // Handle keyboard shortcut (Enter to conjugate, Escape to clear)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (canConjugate) {
          onConjugate();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (value.length > 0) {
          onChange('');
        }
      }
    },
    [canConjugate, onConjugate, value, onChange],
  );

  // Handle text change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  // Handle clear button
  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 rounded-2xl p-4 sm:p-5',
        'border border-[var(--border-color)] bg-[var(--card-color)]',
        'shadow-lg shadow-black/5',
      )}
      role='search'
      aria-label='Japanese verb conjugation input'
    >
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div
          className={cn(
            'rounded-lg p-2',
            'bg-[var(--main-color)]/10',
            'border border-[var(--main-color)]/20',
          )}
          aria-hidden='true'
        >
          <Search className='h-5 w-5 text-[var(--main-color)]' />
        </div>
        <div>
          <h2
            className='text-base font-semibold text-[var(--main-color)] sm:text-lg'
            id='verb-input-label'
          >
            Enter a Japanese Verb
          </h2>
          <p
            className='text-xs text-[var(--secondary-color)]'
            id='verb-input-hint'
          >
            Dictionary form (e.g., 食べる, 行く, する)
          </p>
        </div>
      </div>

      {/* Input field with clear button */}
      <div className='relative flex items-center gap-2'>
        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder='日本語の動詞を入力...'
          className={cn(
            'h-12 w-full rounded-xl px-4 sm:h-14 sm:px-5',
            'border border-[var(--border-color)] bg-[var(--background-color)]',
            'text-lg text-[var(--main-color)] placeholder:text-[var(--secondary-color)]/60 sm:text-xl',
            'font-japanese',
            'focus:border-transparent focus:ring-2 focus:ring-[var(--main-color)] focus:outline-none',
            'transition-all duration-200',
            error && 'border-red-500 focus:ring-red-500',
            isDisabled && 'cursor-not-allowed opacity-60',
          )}
          aria-labelledby='verb-input-label'
          aria-describedby={
            error ? 'input-error verb-input-hint' : 'verb-input-hint'
          }
          aria-invalid={!!error}
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck='false'
          lang='ja'
        />

        {/* Clear button */}
        {value.length > 0 && (
          <ActionButton
            onClick={handleClear}
            disabled={isDisabled}
            colorScheme='secondary'
            borderColorScheme='secondary'
            borderRadius='xl'
            borderBottomThickness={6}
            className={cn(
              'absolute right-2 h-8 !w-8 !min-w-8 !p-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
            aria-label='Clear input field'
          >
            <X className='h-4 w-4' aria-hidden='true' />
          </ActionButton>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          id='input-error'
          className={cn(
            'flex items-center gap-2 rounded-lg p-3',
            'border border-red-500/30 bg-red-500/10',
            'text-sm text-red-500',
          )}
          role='alert'
          aria-live='polite'
        >
          {getErrorMessage(error)}
        </div>
      )}

      {/* Conjugate button */}
      <ActionButton
        onClick={onConjugate}
        disabled={!canConjugate}
        gradient
        borderRadius='2xl'
        borderBottomThickness={6}
        className={cn(
          'h-12 w-full text-base font-semibold sm:h-14 sm:text-lg',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        aria-label={
          isLoading ? 'Conjugating verb, please wait' : 'Conjugate verb'
        }
        aria-busy={isLoading}
      >
        {isLoading ? 'Conjugating...' : 'Conjugate'}
      </ActionButton>

      {/* Keyboard shortcut hint */}
      <div
        className='hidden items-center justify-center gap-2 text-xs text-[var(--secondary-color)] sm:flex'
        aria-hidden='true'
      >
        <Keyboard className='h-3.5 w-3.5' />
        <span>
          Press{' '}
          <kbd className='rounded bg-[var(--background-color)] px-1.5 py-0.5 font-mono text-[10px]'>
            Enter
          </kbd>{' '}
          to conjugate,{' '}
          <kbd className='rounded bg-[var(--background-color)] px-1.5 py-0.5 font-mono text-[10px]'>
            Esc
          </kbd>{' '}
          to clear
        </span>
      </div>
    </div>
  );
}

/**
 * Get user-friendly error message from error code
 */
function getErrorMessage(error: ConjugationError): string {
  switch (error.code) {
    case 'EMPTY_INPUT':
      return 'Please enter a Japanese verb';
    case 'INVALID_CHARACTERS':
      return 'Please enter a valid Japanese verb using hiragana, katakana, or kanji';
    case 'UNKNOWN_VERB':
      return 'This verb is not recognized. Please check the spelling or try the dictionary form';
    case 'AMBIGUOUS_VERB':
      return 'This input could be multiple verbs. Please be more specific';
    case 'CONJUGATION_FAILED':
      return error.message || 'An unexpected error occurred';
    default:
      return error.message || 'An error occurred';
  }
}
