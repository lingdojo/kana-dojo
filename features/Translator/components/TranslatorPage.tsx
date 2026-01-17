'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeftRight, WifiOff, Languages, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ActionButton } from '@/shared/components/ui/ActionButton';

import useTranslatorStore from '../store/useTranslatorStore';
import TranslatorInput from './TranslatorInput';
import TranslatorOutput from './TranslatorOutput';
import TranslationHistory from './TranslationHistory';

// Lazy load SEOContent for better initial page load performance
const SEOContent = dynamic(() => import('./SEOContent'), {
  loading: () => (
    <div className='mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] animate-pulse'>
      <div className='h-8 w-64 bg-[var(--border-color)] rounded mb-4' />
      <div className='space-y-3'>
        <div className='h-4 w-full bg-[var(--border-color)] rounded' />
        <div className='h-4 w-3/4 bg-[var(--border-color)] rounded' />
        <div className='h-4 w-5/6 bg-[var(--border-color)] rounded' />
      </div>
    </div>
  ),
  ssr: true // Keep SSR for SEO purposes
});

interface TranslatorPageProps {
  locale?: string;
}

export default function TranslatorPage({ locale = 'en' }: TranslatorPageProps) {
  const searchParams = useSearchParams();
  const initializedFromUrl = useRef(false);

  const {
    sourceText,
    sourceLanguage,
    targetLanguage,
    translatedText,
    romanization,
    isLoading,
    error,
    isOffline,
    history,
    setSourceText,
    setSourceLanguage,
    swapLanguages,
    translate,
    loadHistory,
    deleteFromHistory,
    clearHistory,
    restoreFromHistory,
    initFromUrlParams
  } = useTranslatorStore();

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Handle URL parameters for sharable translations
  useEffect(() => {
    if (initializedFromUrl.current) return;

    const text = searchParams.get('text') || searchParams.get('q');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (text) {
      const hasParams = initFromUrlParams({
        text: text || undefined,
        from: from || undefined,
        to: to || undefined,
        q: searchParams.get('q') || undefined
      });

      if (hasParams) {
        initializedFromUrl.current = true;
        // Auto-translate if text was provided via URL
        setTimeout(() => {
          translate();
        }, 100);
      }
    }
  }, [searchParams, initFromUrlParams, translate]);

  const handleTranslate = () => {
    if (!isOffline && sourceText.trim().length > 0) translate();
  };

  return (
    <div
      className='mx-auto flex w-full max-w-6xl flex-col gap-6'
      role='application'
      aria-label='Japanese to English translator'
    >
      {/* Header with SEO-optimized content */}
      <header
        className={cn(
          'flex flex-col items-start gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-6',
          'border border-[var(--border-color)] bg-gradient-to-r from-[var(--card-color)] to-[var(--background-color)]'
        )}
      >
        <div
          className={cn(
            'rounded-xl border border-[var(--main-color)]/20 bg-[var(--main-color)]/10 p-2.5 sm:p-3'
          )}
          aria-hidden='true'
        >
          <Languages className='h-6 w-6 text-[var(--main-color)] sm:h-8 sm:w-8' />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-[var(--main-color)] sm:text-3xl'>
            Free English to Japanese Translator
          </h1>
          <p className='mt-1 text-sm text-[var(--secondary-color)] sm:text-base'>
            <strong>Translate English to Japanese</strong> or Japanese to English
            instantly. Get accurate translations with{' '}
            <strong>romaji pronunciation</strong> — no registration required.
          </p>
        </div>
      </header>

      {/* Offline indicator */}
      {isOffline && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-600 dark:text-yellow-400'
          )}
          role='alert'
        >
          <WifiOff className='h-5 w-5 flex-shrink-0' />
          <span className='text-sm font-medium'>
            You are offline. Translation is unavailable until you reconnect.
          </span>
        </div>
      )}

      {/* Main translation area */}
      <div
        className={cn(
          'grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]'
        )}
      >
        <TranslatorInput
          value={sourceText}
          onChange={setSourceText}
          onTranslate={handleTranslate}
          sourceLanguage={sourceLanguage}
          onLanguageChange={setSourceLanguage}
          isLoading={isLoading}
          error={error}
          isOffline={isOffline}
        />
        <div className='flex items-center justify-center py-2 lg:py-0 lg:pt-16'>
          <button
            onClick={swapLanguages}
            disabled={isLoading || isOffline}
            className={cn(
              'h-12 w-12 cursor-pointer rounded-full border-2 border-[var(--border-color)] bg-[var(--card-color)] lg:h-14 lg:w-14',
              'transition-all duration-200 hover:border-[var(--main-color)] hover:bg-[var(--border-color)] active:scale-95',
              'flex rotate-90 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50 lg:rotate-0',
              'focus-visible:ring-2 focus-visible:ring-[var(--main-color)] focus-visible:ring-offset-2'
            )}
            aria-label='Swap languages'
          >
            <ArrowLeftRight className='h-5 w-5 text-[var(--main-color)]' />
          </button>
        </div>
        <TranslatorOutput
          translation={translatedText}
          romanization={romanization}
          sourceText={sourceText}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          isLoading={isLoading}
        />
      </div>

      {/* Translate button */}
      <div className='flex h-[54px] items-start justify-center px-4 sm:h-[62px] sm:px-0'>
        <ActionButton
          onClick={handleTranslate}
          disabled={isLoading || isOffline || sourceText.trim().length === 0}
          gradient
          borderRadius='2xl'
          borderBottomThickness={6}
          className={cn(
            'h-12 w-full text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-auto sm:min-w-[240px] sm:text-lg'
          )}
        >
          <Sparkles className='h-5 w-5' />
          {isLoading ? 'Translating...' : 'Translate'}
        </ActionButton>
      </div>

      <div className='mt-6'>
        <TranslationHistory
          entries={history}
          onSelect={restoreFromHistory}
          onDelete={deleteFromHistory}
          onClearAll={clearHistory}
        />
      </div>
      <SEOContent locale={locale} />
    </div>
  );
}
