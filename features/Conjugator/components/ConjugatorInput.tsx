'use client';

import { useCallback, useRef, useEffect } from 'react';
import { X, Keyboard, Search, Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { ActionButton } from '@/shared/ui/components/ActionButton';
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
      className='group relative flex w-full flex-col gap-8 transition-colors duration-500'
      role='search'
      aria-label='Japanese verb conjugation input'
    >
      {/* Input Field - The Ghost Focal Point */}
      <div className='relative flex flex-col gap-8'>
        <div className='relative flex items-center'>
          <input
            ref={inputRef}
            type='text'
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder='e.g. 食べる, 行く, する...'
            className={cn(
              'h-16 w-full bg-transparent p-0 text-3xl font-bold text-(--main-color) placeholder:text-(--secondary-color)/10 sm:h-20 sm:text-4xl',
              'font-japanese tracking-tight focus:outline-none',
              error ? 'text-red-500/80' : 'focus:text-(--main-color)',
              isDisabled && 'cursor-not-allowed opacity-20',
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

          {/* Precision Architectural Line (Replaces the box) */}
          <div
            className={cn(
              'absolute bottom-0 left-0 h-[2px] w-full transition-all duration-1000',
              error
                ? 'bg-red-500'
                : 'bg-gradient-to-r from-(--main-color) via-(--main-color)/20 to-transparent',
              'opacity-20 group-focus-within:h-1 group-focus-within:opacity-100',
            )}
          />

          {/* Clear button - Integrated Icon */}
          {value.length > 0 && !isDisabled && (
            <button
              onClick={handleClear}
              className='absolute right-0 flex h-20 w-20 items-center justify-center text-(--secondary-color) opacity-20 transition-all hover:text-(--main-color) hover:opacity-100'
              aria-label='Clear input field'
            >
              <X className='h-10 w-10' aria-hidden='true' />
            </button>
          )}
        </div>

        {/* Floating Label - Dynamic position */}
        <p
          className={cn(
            'text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase',
            'group-focus-within:text-(--main-color)',
          )}
          id='verb-input-hint'
        >
          {isLoading ? 'Processing...' : 'Enter a Japanese verb'}
        </p>

        {/* Error Message - Pure Typography */}
        {error && (
          <div
            id='input-error'
            className='animate-in fade-in slide-in-from-top-4 flex items-center gap-4 text-xs font-black tracking-widest text-red-500 uppercase'
            role='alert'
            aria-live='polite'
          >
            <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-red-500' />
            <span>{getErrorMessage(error)}</span>
          </div>
        )}
      </div>

      {/* Primary Catalyst Button & Hints */}
      <div className='mt-4 flex flex-col items-center gap-8 sm:flex-row sm:justify-between'>
        <ActionButton
          onClick={onConjugate}
          disabled={!canConjugate}
          gradient
          borderRadius='full'
          borderBottomThickness={0}
          className={cn(
            'h-14 w-full text-xs font-bold tracking-widest uppercase sm:h-16 sm:w-auto sm:px-12',
            'shadow-(--main-color)/10 shadow-xl transition-colors',
            'disabled:opacity-20 disabled:grayscale',
          )}
          aria-label={isLoading ? 'Conjugating...' : 'Conjugate'}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <div className='flex items-center gap-3'>
              <Loader2 className='h-5 w-5 animate-spin' />
              <span>Conjugating</span>
            </div>
          ) : (
            'Conjugate'
          )}
        </ActionButton>

        {/* High-end minimalist keyboard hints */}
        <div className='flex items-center gap-6 opacity-30'>
          <div className='flex items-center gap-3'>
            <div className='h-1 w-1 rounded-full bg-(--secondary-color)' />
            <span className='text-[9px] font-black tracking-widest text-(--secondary-color) uppercase'>
              Enter to synth
            </span>
          </div>
          <div className='flex items-center gap-3'>
            <div className='h-1 w-1 rounded-full bg-(--secondary-color)' />
            <span className='text-[9px] font-black tracking-widest text-(--secondary-color) uppercase'>
              Esc to purge
            </span>
          </div>
        </div>
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

