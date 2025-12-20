'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Loader2, FileText } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Language } from '../types';

interface TranslatorOutputProps {
  translation: string;
  romanization?: string | null;
  targetLanguage: Language;
  isLoading: boolean;
}

export default function TranslatorOutput({
  translation,
  romanization,
  targetLanguage,
  isLoading
}: TranslatorOutputProps) {
  const [copied, setCopied] = useState(false);

  // Show romanization when target is Japanese (translating TO Japanese)
  // This displays romaji pronunciation below the Japanese translation
  const showRomanization = targetLanguage === 'ja' && romanization;

  const handleCopy = useCallback(async () => {
    if (!translation) return;

    try {
      await navigator.clipboard.writeText(translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [translation]);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 w-full p-4 sm:p-5 rounded-2xl',
        'bg-[var(--card-color)] border border-[var(--border-color)]',
        'shadow-lg shadow-black/5'
      )}
    >
      {/* Header with language label */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider'>
            To
          </span>
          <span
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-[var(--background-color)] border border-[var(--border-color)]',
              'text-[var(--main-color)]'
            )}
          >
            {targetLanguage === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'}
          </span>
        </div>

        {/* Copy button */}
        {translation && !isLoading && (
          <button
            onClick={handleCopy}
            className={cn(
              'h-9 w-9 rounded-lg cursor-pointer',
              'flex items-center justify-center',
              'bg-[var(--background-color)] border border-[var(--border-color)]',
              'hover:border-[var(--main-color)] transition-all duration-200',
              copied
                ? 'text-green-500 border-green-500'
                : 'text-[var(--secondary-color)] hover:text-[var(--main-color)]'
            )}
            aria-label={copied ? 'Copied!' : 'Copy translation'}
          >
            {copied ? (
              <Check className='h-4 w-4' />
            ) : (
              <Copy className='h-4 w-4' />
            )}
          </button>
        )}
      </div>

      {/* Output area */}
      <div
        className={cn(
          'w-full min-h-[180px] sm:min-h-[220px] p-3 sm:p-4 rounded-xl',
          'bg-[var(--background-color)] border border-[var(--border-color)]',
          'text-[var(--main-color)]',
          'relative'
        )}
      >
        {isLoading ? (
          <div className='flex flex-col items-center justify-center h-full min-h-[188px] gap-3'>
            <div
              className={cn(
                'p-4 rounded-full',
                'bg-[var(--main-color)]/10',
                'animate-pulse'
              )}
            >
              <Loader2 className='h-8 w-8 animate-spin text-[var(--main-color)]' />
            </div>
            <span className='text-sm text-[var(--secondary-color)]'>
              Translating...
            </span>
          </div>
        ) : translation ? (
          <div className='flex flex-col'>
            {/* Main translation */}
            <p className='text-xl sm:text-2xl whitespace-pre-wrap break-words leading-relaxed font-medium'>
              {translation}
            </p>

            {/* Romaji pronunciation (when translating TO Japanese) */}
            {showRomanization && (
              <p className='mt-2 text-sm sm:text-base text-[var(--secondary-color)] whitespace-pre-wrap break-words leading-relaxed italic'>
                {romanization}
              </p>
            )}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-full min-h-[188px] gap-3'>
            <div
              className={cn(
                'p-4 rounded-full',
                'bg-[var(--secondary-color)]/10'
              )}
            >
              <FileText className='h-8 w-8 text-[var(--secondary-color)]/50' />
            </div>
            <p className='text-[var(--secondary-color)]/60 text-sm text-center'>
              {targetLanguage === 'en'
                ? 'Translation will appear here...'
                : '翻訳がここに表示されます...'}
            </p>
          </div>
        )}
      </div>

      {/* Copy confirmation message */}
      {copied && (
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'bg-green-500/10 border border-green-500/30',
            'text-green-500 text-sm font-medium'
          )}
          role='status'
        >
          <Check className='h-4 w-4' />
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}
