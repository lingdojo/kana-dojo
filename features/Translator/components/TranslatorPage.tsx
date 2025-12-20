'use client';

import { useEffect } from 'react';
import { ArrowLeftRight, WifiOff, Languages, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import SidebarLayout from '@/shared/components/layout/SidebarLayout';
import useTranslatorStore from '../store/useTranslatorStore';
import TranslatorInput from './TranslatorInput';
import TranslatorOutput from './TranslatorOutput';
import TranslationHistory from './TranslationHistory';
import SEOContent from './SEOContent';

interface TranslatorPageProps {
  locale?: string;
}

export default function TranslatorPage({ locale = 'en' }: TranslatorPageProps) {
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
    restoreFromHistory
  } = useTranslatorStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleTranslate = () => {
    if (!isOffline && sourceText.trim().length > 0) translate();
  };

  return (
    <SidebarLayout>
      <div className='flex flex-col gap-6 w-full max-w-6xl mx-auto'>
        {/* Header */}
        <div
          className={cn(
            'flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-6 rounded-2xl',
            'bg-gradient-to-r from-[var(--card-color)] to-[var(--background-color)] border border-[var(--border-color)]'
          )}
        >
          <div
            className={cn(
              'p-2.5 sm:p-3 rounded-xl bg-[var(--main-color)]/10 border border-[var(--main-color)]/20'
            )}
          >
            <Languages className='h-6 w-6 sm:h-8 sm:w-8 text-[var(--main-color)]' />
          </div>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-[var(--main-color)]'>
              Japanese Translator
            </h1>
            <p className='text-xs sm:text-sm text-[var(--secondary-color)] mt-1'>
              Translate between English and Japanese with romanization support
            </p>
          </div>
        </div>

        {/* Offline indicator */}
        {isOffline && (
          <div
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400'
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
            'grid gap-4 grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-stretch'
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
                'h-12 w-12 lg:h-14 lg:w-14 rounded-full cursor-pointer bg-[var(--card-color)] border-2 border-[var(--border-color)]',
                'hover:border-[var(--main-color)] hover:bg-[var(--border-color)] active:scale-95 transition-all duration-200',
                'flex items-center justify-center rotate-90 lg:rotate-0 disabled:opacity-50 disabled:cursor-not-allowed',
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
            targetLanguage={targetLanguage}
            isLoading={isLoading}
          />
        </div>

        {/* Translate button */}
        <div className='flex justify-center items-start px-4 sm:px-0 h-[54px] sm:h-[62px]'>
          <ActionButton
            onClick={handleTranslate}
            disabled={isLoading || isOffline || sourceText.trim().length === 0}
            gradient
            borderRadius='2xl'
            borderBottomThickness={6}
            className={cn(
              'w-full sm:w-auto sm:min-w-[240px] h-12 sm:h-14 text-base sm:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
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
    </SidebarLayout>
  );
}
