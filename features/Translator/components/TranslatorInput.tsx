'use client';

import { useCallback, useEffect, useRef } from 'react';
import { X, Keyboard } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import type { Language } from '../types';

const MAX_CHARACTERS = 5000;

interface TranslatorInputProps {
  value: string;
  onChange: (value: string) => void;
  onTranslate: () => void;
  sourceLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isLoading: boolean;
  error?: string | null;
  isOffline?: boolean;
}

/**
 * Helper function to calculate character count
 * Exported for testing purposes
 */
export function getCharacterCount(text: string): number {
  return text.length;
}

export default function TranslatorInput({
  value,
  onChange,
  onTranslate,
  sourceLanguage,
  onLanguageChange,
  isLoading,
  error,
  isOffline = false
}: TranslatorInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const characterCount = getCharacterCount(value);
  const isOverLimit = characterCount > MAX_CHARACTERS;
  const isDisabled = isLoading || isOffline;

  // Handle keyboard shortcut (Ctrl/Cmd + Enter)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isDisabled && !isOverLimit && value.trim().length > 0) {
          onTranslate();
        }
      }
    },
    [isDisabled, isOverLimit, value, onTranslate]
  );

  // Handle text change with character limit
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= MAX_CHARACTERS) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  // Handle clear button
  const handleClear = useCallback(() => {
    onChange('');
    textareaRef.current?.focus();
  }, [onChange]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 w-full p-4 sm:p-5 rounded-2xl',
        'bg-[var(--card-color)] border border-[var(--border-color)]',
        'shadow-lg shadow-black/5'
      )}
    >
      {/* Header with language selector */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider'>
            From
          </span>
          <Select
            value={sourceLanguage}
            onValueChange={value => onLanguageChange(value as Language)}
            disabled={isDisabled}
          >
            <SelectTrigger
              className={cn(
                'w-[130px] h-9 cursor-pointer',
                'bg-[var(--background-color)] border-[var(--border-color)]',
                'text-[var(--main-color)] font-medium',
                'hover:border-[var(--main-color)] transition-colors duration-200'
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-[var(--card-color)] border-[var(--border-color)]'>
              <SelectItem value='en' className='cursor-pointer'>
                🇺🇸 English
              </SelectItem>
              <SelectItem value='ja' className='cursor-pointer'>
                🇯🇵 日本語
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

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
              '!w-9 !min-w-9 h-9 !p-0',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label='Clear input'
          >
            <X className='h-4 w-4' />
          </ActionButton>
        )}
      </div>

      {/* Text area */}
      <div className='relative'>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={
            sourceLanguage === 'en'
              ? 'Enter text to translate...'
              : 'テキストを入力してください...'
          }
          className={cn(
            'w-full min-h-[180px] sm:min-h-[220px] p-3 sm:p-4 rounded-xl resize-none',
            'bg-[var(--background-color)] border border-[var(--border-color)]',
            'text-[var(--main-color)] text-base sm:text-lg placeholder:text-[var(--secondary-color)]/60',
            'focus:outline-none focus:ring-2 focus:ring-[var(--main-color)] focus:border-transparent',
            'transition-all duration-200',
            isOverLimit && 'border-red-500 focus:ring-red-500',
            isDisabled && 'opacity-60 cursor-not-allowed'
          )}
          aria-label='Source text input'
          aria-describedby='character-count'
        />

        {/* Character count badge */}
        <div
          id='character-count'
          className={cn(
            'absolute bottom-3 right-3 px-2 py-1 rounded-md text-xs font-medium',
            'bg-[var(--card-color)]/80 backdrop-blur-sm',
            isOverLimit ? 'text-red-500' : 'text-[var(--secondary-color)]'
          )}
        >
          {characterCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className={cn(
            'flex items-center gap-2 p-3 rounded-lg',
            'bg-red-500/10 border border-red-500/30',
            'text-red-500 text-sm'
          )}
          role='alert'
        >
          {error}
        </div>
      )}

      {/* Warning for character limit */}
      {isOverLimit && (
        <div
          className={cn(
            'flex items-center gap-2 p-3 rounded-lg',
            'bg-red-500/10 border border-red-500/30',
            'text-red-500 text-sm'
          )}
          role='alert'
        >
          Text exceeds maximum length of {MAX_CHARACTERS.toLocaleString()}{' '}
          characters
        </div>
      )}

      {/* Keyboard shortcut hint - hidden on mobile */}
      <div className='hidden sm:flex items-center gap-2 text-xs text-[var(--secondary-color)]'>
        <Keyboard className='h-3.5 w-3.5' />
        <span>
          Press{' '}
          <kbd className='px-1.5 py-0.5 rounded bg-[var(--background-color)] font-mono text-[10px]'>
            Ctrl
          </kbd>
          +
          <kbd className='px-1.5 py-0.5 rounded bg-[var(--background-color)] font-mono text-[10px]'>
            Enter
          </kbd>{' '}
          to translate
        </span>
      </div>
    </div>
  );
}
