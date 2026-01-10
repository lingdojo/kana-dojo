'use client';

import { useState, useCallback } from 'react';
import {
  Copy,
  Check,
  Loader2,
  FileText,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Info
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Language } from '../types';
import { useVoiceOutput } from '../hooks/useVoiceOutput';
import WordByWordBreakdown from './WordByWordBreakdown';
import TranslationAlternatives from './TranslationAlternatives';

interface TranslatorOutputProps {
  translation: string;
  romanization?: string | null;
  sourceText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  isLoading: boolean;
}

export default function TranslatorOutput({
  translation,
  romanization,
  sourceText,
  sourceLanguage,
  targetLanguage,
  isLoading
}: TranslatorOutputProps) {
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Show romanization when target is Japanese (translating TO Japanese)
  // This displays romaji pronunciation below the Japanese translation
  const showRomanization = targetLanguage === 'ja' && romanization;

  // Show word breakdown for Japanese text
  const canShowBreakdown = targetLanguage === 'ja' && translation;

  // Voice output hook
  const {
    isSpeaking,
    isSupported: isVoiceOutputSupported,
    speak,
    stop,
    pause,
    resume,
    isPaused
  } = useVoiceOutput({
    language: targetLanguage,
    onEnd: () => {
      // Voice finished
    },
    onError: err => {
      console.error('Voice output error:', err);
    }
  });

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

  const handleSpeak = useCallback(() => {
    if (!translation) return;

    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(translation);
    }
  }, [translation, isSpeaking, isPaused, speak, pause, resume]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

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

        {/* Action buttons */}
        {translation && !isLoading && (
          <div className='flex items-center gap-2'>
            {/* Voice output buttons */}
            {isVoiceOutputSupported && (
              <>
                <button
                  onClick={handleSpeak}
                  className={cn(
                    'h-9 w-9 rounded-lg cursor-pointer',
                    'flex items-center justify-center',
                    'bg-[var(--background-color)] border border-[var(--border-color)]',
                    'hover:border-[var(--main-color)] transition-all duration-200',
                    isSpeaking && !isPaused
                      ? 'text-[var(--main-color)] border-[var(--main-color)]'
                      : 'text-[var(--secondary-color)] hover:text-[var(--main-color)]'
                  )}
                  aria-label={
                    isSpeaking
                      ? isPaused
                        ? 'Resume speaking'
                        : 'Pause speaking'
                      : 'Speak translation'
                  }
                  title={
                    isSpeaking
                      ? isPaused
                        ? 'Resume'
                        : 'Pause'
                      : 'Speak translation'
                  }
                >
                  {isSpeaking ? (
                    isPaused ? (
                      <Play className='h-4 w-4' />
                    ) : (
                      <Pause className='h-4 w-4' />
                    )
                  ) : (
                    <Volume2 className='h-4 w-4' />
                  )}
                </button>

                {isSpeaking && (
                  <button
                    onClick={handleStop}
                    className={cn(
                      'h-9 w-9 rounded-lg cursor-pointer',
                      'flex items-center justify-center',
                      'bg-[var(--background-color)] border border-[var(--border-color)]',
                      'hover:border-red-500 transition-all duration-200',
                      'text-[var(--secondary-color)] hover:text-red-500'
                    )}
                    aria-label='Stop speaking'
                    title='Stop'
                  >
                    <VolumeX className='h-4 w-4' />
                  </button>
                )}
              </>
            )}

            {/* Word breakdown button (only for Japanese) */}
            {canShowBreakdown && (
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className={cn(
                  'h-9 w-9 rounded-lg cursor-pointer',
                  'flex items-center justify-center',
                  'bg-[var(--background-color)] border border-[var(--border-color)]',
                  'hover:border-[var(--main-color)] transition-all duration-200',
                  showBreakdown
                    ? 'text-[var(--main-color)] border-[var(--main-color)]'
                    : 'text-[var(--secondary-color)] hover:text-[var(--main-color)]'
                )}
                aria-label={
                  showBreakdown
                    ? 'Hide word breakdown'
                    : 'Show word-by-word analysis'
                }
                title={
                  showBreakdown ? 'Hide breakdown' : 'Show word-by-word analysis'
                }
              >
                <Info className='h-4 w-4' />
              </button>
            )}

            {/* Copy button */}
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
          </div>
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
          <div className='flex flex-col gap-4'>
            {/* Main translation */}
            <p className='text-xl sm:text-2xl whitespace-pre-wrap break-words leading-relaxed font-medium'>
              {translation}
            </p>

            {/* Romaji pronunciation (when translating TO Japanese) */}
            {showRomanization && (
              <p className='text-sm sm:text-base text-[var(--secondary-color)] whitespace-pre-wrap break-words leading-relaxed italic'>
                {romanization}
              </p>
            )}

            {/* Word-by-word breakdown */}
            {showBreakdown && canShowBreakdown && (
              <div
                className={cn(
                  'pt-4 border-t border-[var(--border-color)]',
                  'flex flex-col gap-2'
                )}
              >
                <div className='flex items-center gap-2'>
                  <Info className='h-4 w-4 text-[var(--secondary-color)]' />
                  <span className='text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider'>
                    Word-by-Word Analysis (hover for details)
                  </span>
                </div>
                <WordByWordBreakdown
                  text={translation}
                  className='text-base sm:text-lg'
                />
              </div>
            )}

            {/* Translation alternatives */}
            {!isLoading && translation && sourceText && (
              <div
                className={cn(
                  'pt-4 border-t border-[var(--border-color)]'
                )}
              >
                <TranslationAlternatives
                  sourceText={sourceText}
                  mainTranslation={translation}
                  sourceLanguage={sourceLanguage}
                />
              </div>
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
