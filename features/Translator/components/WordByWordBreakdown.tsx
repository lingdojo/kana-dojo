'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { analyzeText, needsAnalysis, type AnalyzedToken } from '../services/textAnalysisAPI';
import { Loader2 } from 'lucide-react';

interface WordByWordBreakdownProps {
  text: string;
  className?: string;
}

/**
 * Component that displays Japanese text with word-by-word tooltips
 * showing reading, part of speech, and meaning information
 */
export default function WordByWordBreakdown({
  text,
  className
}: WordByWordBreakdownProps) {
  const [tokens, setTokens] = useState<AnalyzedToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only analyze if text contains Japanese
    if (!text || !needsAnalysis(text)) {
      setTokens([]);
      return;
    }

    let isCancelled = false;

    const analyze = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await analyzeText(text);
        if (!isCancelled) {
          setTokens(result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Failed to analyze text');
          console.error('Analysis error:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    analyze();

    return () => {
      isCancelled = true;
    };
  }, [text]);

  // Show loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2 py-4',
          'text-[var(--secondary-color)]',
          className
        )}
      >
        <Loader2 className='h-4 w-4 animate-spin' />
        <span className='text-sm'>Analyzing text...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div
        className={cn(
          'text-sm text-[var(--secondary-color)] py-2',
          className
        )}
      >
        {error}
      </div>
    );
  }

  // If no tokens (not Japanese text), show regular text
  if (tokens.length === 0) {
    return (
      <div className={cn('text-[var(--main-color)]', className)}>
        {text}
      </div>
    );
  }

  // Render tokens with tooltips
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          'flex flex-wrap gap-x-1 gap-y-2 leading-relaxed',
          className
        )}
      >
        {tokens.map((token, index) => (
          <Tooltip key={`${token.surface}-${index}`}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'cursor-help inline-block',
                  'hover:bg-[var(--main-color)]/10',
                  'hover:text-[var(--main-color)]',
                  'rounded px-1 py-0.5',
                  'transition-colors duration-150',
                  'text-[var(--main-color)]'
                )}
              >
                {token.surface}
              </span>
            </TooltipTrigger>
            <TooltipContent
              side='top'
              className={cn(
                'max-w-xs p-3',
                'bg-[var(--card-color)] border border-[var(--border-color)]',
                'rounded-xl shadow-lg'
              )}
            >
              <div className='flex flex-col gap-2 text-xs'>
                {/* Surface form (the word itself) */}
                <div>
                  <span className='font-bold text-[var(--main-color)] text-base'>
                    {token.surface}
                  </span>
                </div>

                {/* Reading (hiragana) */}
                {token.reading && token.reading !== token.surface && (
                  <div className='flex items-baseline gap-2'>
                    <span className='text-[var(--secondary-color)] font-medium min-w-[60px]'>
                      Reading:
                    </span>
                    <span className='text-[var(--main-color)]'>
                      {token.reading}
                    </span>
                  </div>
                )}

                {/* Basic form (dictionary form) */}
                {token.basicForm &&
                  token.basicForm !== '*' &&
                  token.basicForm !== token.surface && (
                    <div className='flex items-baseline gap-2'>
                      <span className='text-[var(--secondary-color)] font-medium min-w-[60px]'>
                        Base form:
                      </span>
                      <span className='text-[var(--main-color)]'>
                        {token.basicForm}
                      </span>
                    </div>
                  )}

                {/* Part of speech */}
                <div className='flex items-baseline gap-2'>
                  <span className='text-[var(--secondary-color)] font-medium min-w-[60px]'>
                    Type:
                  </span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-md font-medium',
                      'bg-[var(--main-color)]/10 text-[var(--main-color)]',
                      'border border-[var(--main-color)]/20'
                    )}
                  >
                    {token.pos}
                  </span>
                </div>

                {/* POS details */}
                {token.posDetail && token.posDetail !== 'No additional info' && (
                  <div className='flex items-baseline gap-2'>
                    <span className='text-[var(--secondary-color)] font-medium min-w-[60px]'>
                      Details:
                    </span>
                    <span className='text-[var(--main-color)] text-xs'>
                      {token.posDetail}
                    </span>
                  </div>
                )}

                {/* Translation (if available) */}
                {token.translation && (
                  <div className='flex items-baseline gap-2 pt-1 border-t border-[var(--border-color)]'>
                    <span className='text-[var(--secondary-color)] font-medium min-w-[60px]'>
                      Meaning:
                    </span>
                    <span className='text-[var(--main-color)] font-medium'>
                      {token.translation}
                    </span>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
