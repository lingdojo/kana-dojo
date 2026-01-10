'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { CheckCircle2, Circle, Lightbulb, Loader2 } from 'lucide-react';
import { analyzeText, needsAnalysis, type AnalyzedToken } from '../services/textAnalysisAPI';

interface TranslationAlternativesProps {
  sourceText: string;
  mainTranslation: string;
  sourceLanguage: 'en' | 'ja';
  className?: string;
}

interface Alternative {
  translation: string;
  type: 'main' | 'literal' | 'alternative';
  label: string;
  description?: string;
}

/**
 * Generate a literal translation from word tokens
 */
function generateLiteralTranslation(tokens: AnalyzedToken[]): string {
  // This is a simplified literal translation
  // In a real implementation, this would use a dictionary lookup
  return tokens
    .map(token => {
      // For particles and common words, use standard translations
      const particleMap: Record<string, string> = {
        'は': 'wa (topic)',
        'が': 'ga (subject)',
        'を': 'wo (object)',
        'に': 'ni (to/at)',
        'の': 'no (possessive)',
        'で': 'de (at/by means of)',
        'と': 'to (and/with)',
        'も': 'mo (also)',
        'から': 'kara (from)',
        'まで': 'made (until)',
        'へ': 'e (to/towards)'
      };

      if (token.surface in particleMap) {
        return particleMap[token.surface];
      }

      // Return the surface form with reading if available
      if (token.reading && token.reading !== token.surface) {
        return `${token.surface}(${token.reading})`;
      }

      return token.surface;
    })
    .join(' ');
}

/**
 * Get alternative phrasings for common expressions
 */
function getCommonAlternatives(
  sourceText: string,
  sourceLanguage: 'en' | 'ja'
): Alternative[] {
  const alternatives: Alternative[] = [];

  if (sourceLanguage === 'en') {
    // Common English phrases that have multiple Japanese translations
    const lowerSource = sourceText.toLowerCase().trim();

    if (lowerSource === 'hello' || lowerSource === 'hi') {
      alternatives.push({
        translation: 'こんにちは (Konnichiwa)',
        type: 'alternative',
        label: 'Formal greeting',
        description: 'Standard polite greeting for daytime'
      });
      alternatives.push({
        translation: 'やあ (Yaa)',
        type: 'alternative',
        label: 'Casual greeting',
        description: 'Informal greeting among friends'
      });
      alternatives.push({
        translation: 'もしもし (Moshi moshi)',
        type: 'alternative',
        label: 'Phone greeting',
        description: 'Used when answering the phone'
      });
    } else if (lowerSource === 'thank you' || lowerSource === 'thanks') {
      alternatives.push({
        translation: 'ありがとうございます (Arigatou gozaimasu)',
        type: 'alternative',
        label: 'Formal thanks',
        description: 'Very polite expression of gratitude'
      });
      alternatives.push({
        translation: 'ありがとう (Arigatou)',
        type: 'alternative',
        label: 'Casual thanks',
        description: 'Informal thank you'
      });
      alternatives.push({
        translation: 'どうも (Doumo)',
        type: 'alternative',
        label: 'Quick thanks',
        description: 'Very casual, quick thank you'
      });
    } else if (lowerSource === 'goodbye' || lowerSource === 'bye') {
      alternatives.push({
        translation: 'さようなら (Sayounara)',
        type: 'alternative',
        label: 'Formal farewell',
        description: 'Formal goodbye, implies long separation'
      });
      alternatives.push({
        translation: 'じゃあね (Jaa ne)',
        type: 'alternative',
        label: 'Casual farewell',
        description: 'Casual "see you later"'
      });
      alternatives.push({
        translation: 'またね (Mata ne)',
        type: 'alternative',
        label: 'See you soon',
        description: 'Implies you\'ll meet again soon'
      });
    }
  } else if (sourceLanguage === 'ja') {
    // Common Japanese phrases with nuanced English translations
    const trimmedSource = sourceText.trim();

    if (trimmedSource.includes('よろしくお願いします') || trimmedSource.includes('よろしく')) {
      alternatives.push({
        translation: 'Nice to meet you',
        type: 'alternative',
        label: 'Introduction context',
        description: 'When meeting someone for the first time'
      });
      alternatives.push({
        translation: 'Thank you in advance',
        type: 'alternative',
        label: 'Request context',
        description: 'When asking for a favor'
      });
      alternatives.push({
        translation: 'Please treat me well',
        type: 'alternative',
        label: 'Literal meaning',
        description: 'Direct translation of the phrase'
      });
    }
  }

  return alternatives;
}

export default function TranslationAlternatives({
  sourceText,
  mainTranslation,
  sourceLanguage,
  className
}: TranslationAlternativesProps) {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAlternatives = async () => {
      setIsLoading(true);
      const alts: Alternative[] = [];

      // Add main translation
      alts.push({
        translation: mainTranslation,
        type: 'main',
        label: 'Main Translation',
        description: 'AI-powered translation by Google Translate'
      });

      // Check for common alternatives
      const commonAlts = getCommonAlternatives(sourceText, sourceLanguage);
      if (commonAlts.length > 0) {
        alts.push(...commonAlts);
      }

      // If source is Japanese, generate literal translation
      if (sourceLanguage === 'ja' && needsAnalysis(sourceText)) {
        try {
          const tokens = await analyzeText(sourceText);
          if (tokens.length > 0) {
            const literal = generateLiteralTranslation(tokens);
            alts.push({
              translation: literal,
              type: 'literal',
              label: 'Literal Breakdown',
              description: 'Word-by-word literal translation'
            });
          }
        } catch (error) {
          console.error('Failed to generate literal translation:', error);
        }
      }

      setAlternatives(alts);
      setIsLoading(false);
    };

    loadAlternatives();
  }, [sourceText, mainTranslation, sourceLanguage]);

  // Only show if there are multiple alternatives
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
        <span className='text-sm'>Loading alternatives...</span>
      </div>
    );
  }

  if (alternatives.length <= 1) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className='flex items-center gap-2'>
        <Lightbulb className='h-4 w-4 text-[var(--secondary-color)]' />
        <span className='text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider'>
          Translation Alternatives ({alternatives.length})
        </span>
      </div>

      <div className='flex flex-col gap-2'>
        {alternatives.map((alt, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'flex flex-col gap-1.5 p-3 rounded-xl text-left',
              'border transition-all duration-200',
              'hover:shadow-md',
              selectedIndex === index
                ? 'bg-[var(--main-color)]/10 border-[var(--main-color)] shadow-md'
                : 'bg-[var(--background-color)] border-[var(--border-color)] hover:border-[var(--main-color)]/50'
            )}
          >
            <div className='flex items-start justify-between gap-2'>
              <div className='flex items-center gap-2 flex-1'>
                {selectedIndex === index ? (
                  <CheckCircle2 className='h-4 w-4 text-[var(--main-color)] flex-shrink-0' />
                ) : (
                  <Circle className='h-4 w-4 text-[var(--secondary-color)] flex-shrink-0' />
                )}
                <div className='flex flex-col gap-1 flex-1'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-md font-medium',
                        alt.type === 'main'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : alt.type === 'literal'
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          : 'bg-[var(--main-color)]/10 text-[var(--main-color)] border border-[var(--main-color)]/20'
                      )}
                    >
                      {alt.label}
                    </span>
                    {alt.description && (
                      <span className='text-xs text-[var(--secondary-color)]'>
                        {alt.description}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm font-medium leading-relaxed',
                      selectedIndex === index
                        ? 'text-[var(--main-color)]'
                        : 'text-[var(--main-color)]/80'
                    )}
                  >
                    {alt.translation}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {alternatives.length === 1 && (
        <p className='text-xs text-[var(--secondary-color)] italic'>
          Tip: Translation alternatives are available for common phrases and Japanese text with word breakdowns.
        </p>
      )}
    </div>
  );
}
