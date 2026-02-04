'use client';

import { useCallback, useEffect, useRef } from 'react';
import { X, Keyboard, Mic, MicOff } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { Language } from '../types';
import { useVoiceInput } from '../hooks/useVoiceInput';

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
  isOffline = false,
}: TranslatorInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const characterCount = getCharacterCount(value);
  const isOverLimit = characterCount > MAX_CHARACTERS;
  const isDisabled = isLoading || isOffline;

  // Voice input hook
  const {
    isListening,
    isSupported: isVoiceSupported,
    error: voiceError,
    startListening,
    stopListening,
    transcript,
  } = useVoiceInput({
    language: sourceLanguage,
    onResult: text => {
      onChange(text);
    },
    onError: err => {
      console.error('Voice input error:', err);
    },
  });

  // Show transcript in real-time while listening
  useEffect(() => {
    if (isListening && transcript) {
      onChange(transcript);
    }
  }, [transcript, isListening, onChange]);

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
    [isDisabled, isOverLimit, value, onTranslate],
  );

  // Handle text change with character limit
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= MAX_CHARACTERS) {
        onChange(newValue);
      }
    },
    [onChange],
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
        'flex w-full flex-col gap-3 rounded-2xl p-4 sm:p-5',
        'border border-(--border-color) bg-(--card-color)',
        'shadow-lg shadow-black/5',
      )}
    >
      {/* Header with language selector */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-medium tracking-wider text-(--secondary-color) uppercase'>
            From
          </span>
          <Select
            value={sourceLanguage}
            onValueChange={value => onLanguageChange(value as Language)}
            disabled={isDisabled}
          >
            <SelectTrigger
              className={cn(
                'h-9 w-[130px] cursor-pointer',
                'border-(--border-color) bg-(--background-color)',
                'font-medium text-(--main-color)',
                'transition-colors duration-200 hover:border-(--main-color)',
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='border-(--border-color) bg-(--card-color)'>
              <SelectItem value='en' className='cursor-pointer'>
                🇺🇸 English
              </SelectItem>
              <SelectItem value='ja' className='cursor-pointer'>
                🇯🇵 日本語
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          {/* Voice input button */}
          {isVoiceSupported && (
            <ActionButton
              onClick={isListening ? stopListening : startListening}
              disabled={isDisabled}
              colorScheme={isListening ? 'main' : 'secondary'}
              borderColorScheme={isListening ? 'main' : 'secondary'}
              borderRadius='xl'
              borderBottomThickness={6}
              className={cn(
                'h-9 !w-9 !min-w-9 !p-0',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isListening && 'animate-pulse',
              )}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? (
                <MicOff className='h-4 w-4' />
              ) : (
                <Mic className='h-4 w-4' />
              )}
            </ActionButton>
          )}

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
                'h-9 !w-9 !min-w-9 !p-0',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
              aria-label='Clear input'
            >
              <X className='h-4 w-4' />
            </ActionButton>
          )}
        </div>
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
            'min-h-[180px] w-full resize-none rounded-xl p-3 sm:min-h-[220px] sm:p-4',
            'border border-(--border-color) bg-(--background-color)',
            'text-base text-(--main-color) placeholder:text-(--secondary-color)/60 sm:text-lg',
            'focus:border-transparent focus:ring-2 focus:ring-(--main-color) focus:outline-none',
            'transition-all duration-200',
            isOverLimit && 'border-red-500 focus:ring-red-500',
            isDisabled && 'cursor-not-allowed opacity-60',
          )}
          aria-label='Source text input'
          aria-describedby='character-count'
        />

        {/* Character count badge */}
        <div
          id='character-count'
          className={cn(
            'absolute right-3 bottom-3 rounded-md px-2 py-1 text-xs font-medium',
            'bg-(--card-color)/80 backdrop-blur-sm',
            isOverLimit ? 'text-red-500' : 'text-(--secondary-color)',
          )}
        >
          {characterCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
        </div>
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg p-3',
            'border border-(--main-color)/30 bg-(--main-color)/10',
            'text-sm text-(--main-color)',
          )}
        >
          <div className='flex h-4 items-center gap-1'>
            <span className='h-2 w-1 animate-pulse rounded-full bg-(--main-color)' />
            <span
              className='h-2 w-1 animate-pulse rounded-full bg-(--main-color)'
              style={{ animationDelay: '0.2s' }}
            />
            <span
              className='h-2 w-1 animate-pulse rounded-full bg-(--main-color)'
              style={{ animationDelay: '0.4s' }}
            />
          </div>
          <span>Listening... Speak now</span>
        </div>
      )}

      {/* Error message */}
      {(error || voiceError) && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg p-3',
            'border border-red-500/30 bg-red-500/10',
            'text-sm text-red-500',
          )}
          role='alert'
          aria-live='polite'
        >
          {error || voiceError}
        </div>
      )}

      {/* Warning for character limit */}
      {isOverLimit && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg p-3',
            'border border-red-500/30 bg-red-500/10',
            'text-sm text-red-500',
          )}
          role='alert'
          aria-live='assertive'
        >
          Text exceeds maximum length of {MAX_CHARACTERS.toLocaleString()}{' '}
          characters
        </div>
      )}

      {/* Keyboard shortcut hint - hidden on mobile */}
      <div className='hidden items-center gap-2 text-xs text-(--secondary-color) sm:flex'>
        <Keyboard className='h-3.5 w-3.5' />
        <span>
          Press{' '}
          <kbd className='rounded bg-(--background-color) px-1.5 py-0.5 font-mono text-[10px]'>
            Ctrl
          </kbd>
          +
          <kbd className='rounded bg-(--background-color) px-1.5 py-0.5 font-mono text-[10px]'>
            Enter
          </kbd>{' '}
          to translate
        </span>
      </div>
    </div>
  );
}
