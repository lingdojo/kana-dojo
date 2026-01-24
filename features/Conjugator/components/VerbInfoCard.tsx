'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { VerbInfo, VerbType, IrregularType } from '../types';

interface VerbInfoCardProps {
  /** Verb information from classification */
  verb: VerbInfo;
}

/**
 * VerbInfoCard - Displays detected verb type and stem information
 *
 * Features:
 * - Shows verb type (Godan/Ichidan/Irregular)
 * - Displays verb stem
 * - Expandable section with conjugation rule explanation
 * - Proper ARIA labels and roles
 *
 * Requirements: 9.1, 9.2, 9.3, 10.2
 */
export default function VerbInfoCard({ verb }: VerbInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const verbTypeInfo = getVerbTypeInfo(verb.type, verb.irregularType);

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl',
        'border border-[var(--border-color)] bg-[var(--card-color)]',
        'shadow-lg shadow-black/5',
        'overflow-hidden',
      )}
      role='region'
      aria-label={`Verb information for ${verb.dictionaryForm}`}
    >
      {/* Main info section */}
      <div className='flex flex-col gap-3 p-4 sm:p-5'>
        {/* Header with verb */}
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'rounded-lg p-2',
              'bg-[var(--main-color)]/10',
              'border border-[var(--main-color)]/20',
            )}
            aria-hidden='true'
          >
            <BookOpen className='h-5 w-5 text-[var(--main-color)]' />
          </div>
          <div className='min-w-0 flex-1'>
            <h3
              className='font-japanese truncate text-xl font-bold text-[var(--main-color)] sm:text-2xl'
              lang='ja'
            >
              {verb.dictionaryForm}
            </h3>
            <p className='text-sm text-[var(--secondary-color)]'>
              <span lang='ja'>{verb.reading}</span> ({verb.romaji})
            </p>
          </div>
        </div>

        {/* Verb type and stem info */}
        <div
          className='grid grid-cols-2 gap-3 sm:grid-cols-3'
          role='group'
          aria-label='Verb classification details'
        >
          {/* Verb Type */}
          <div
            className={cn(
              'flex flex-col gap-1 rounded-xl p-3',
              'border border-[var(--border-color)] bg-[var(--background-color)]',
            )}
          >
            <span className='text-xs font-medium tracking-wider text-[var(--secondary-color)] uppercase'>
              Type
            </span>
            <span
              className={cn('text-sm font-semibold', verbTypeInfo.colorClass)}
            >
              {verbTypeInfo.label}
            </span>
          </div>

          {/* Stem */}
          <div
            className={cn(
              'flex flex-col gap-1 rounded-xl p-3',
              'border border-[var(--border-color)] bg-[var(--background-color)]',
            )}
          >
            <span className='text-xs font-medium tracking-wider text-[var(--secondary-color)] uppercase'>
              Stem
            </span>
            <span
              className='font-japanese text-sm font-semibold text-[var(--main-color)]'
              lang='ja'
            >
              {verb.stem || '—'}
            </span>
          </div>

          {/* Ending */}
          <div
            className={cn(
              'flex flex-col gap-1 rounded-xl p-3',
              'border border-[var(--border-color)] bg-[var(--background-color)]',
              'col-span-2 sm:col-span-1',
            )}
          >
            <span className='text-xs font-medium tracking-wider text-[var(--secondary-color)] uppercase'>
              Ending
            </span>
            <span
              className='font-japanese text-sm font-semibold text-[var(--main-color)]'
              lang='ja'
            >
              {verb.ending || '—'}
            </span>
          </div>
        </div>

        {/* Compound prefix if applicable */}
        {verb.compoundPrefix && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-xl p-3',
              'border border-[var(--main-color)]/30 bg-[var(--main-color)]/10',
            )}
            role='note'
          >
            <Info
              className='h-4 w-4 text-[var(--main-color)]'
              aria-hidden='true'
            />
            <span className='text-sm text-[var(--main-color)]'>
              Compound verb with prefix:{' '}
              <span className='font-japanese font-semibold' lang='ja'>
                {verb.compoundPrefix}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Expandable explanation section */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center justify-between px-4 py-3 sm:px-5',
          'border-t border-[var(--border-color)]',
          'bg-[var(--background-color)]',
          'text-sm font-medium text-[var(--secondary-color)]',
          'hover:bg-[var(--border-color)]/50',
          'transition-colors duration-200',
          'cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--main-color)] focus-visible:ring-inset',
        )}
        aria-expanded={isExpanded}
        aria-controls='verb-explanation'
        aria-label={`${isExpanded ? 'Hide' : 'Show'} conjugation rules for ${verbTypeInfo.label} verbs`}
      >
        <span>Conjugation Rules</span>
        {isExpanded ? (
          <ChevronUp className='h-4 w-4' aria-hidden='true' />
        ) : (
          <ChevronDown className='h-4 w-4' aria-hidden='true' />
        )}
      </button>

      {/* Explanation content */}
      {isExpanded && (
        <div
          id='verb-explanation'
          className={cn(
            'px-4 py-4 sm:px-5',
            'border-t border-[var(--border-color)]',
            'bg-[var(--background-color)]',
            'text-sm text-[var(--secondary-color)]',
          )}
          role='region'
          aria-label='Conjugation rules explanation'
        >
          <div className='space-y-3'>
            <p>{verbTypeInfo.description}</p>
            <ul className='space-y-2' role='list'>
              {verbTypeInfo.rules.map((rule, index) => (
                <li key={index} className='flex items-start gap-2'>
                  <span
                    className='mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--main-color)]'
                    aria-hidden='true'
                  />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get display information for verb type
 */
function getVerbTypeInfo(
  type: VerbType,
  irregularType?: IrregularType,
): {
  label: string;
  colorClass: string;
  description: string;
  rules: string[];
} {
  if (type === 'irregular' && irregularType) {
    return getIrregularTypeInfo(irregularType);
  }

  switch (type) {
    case 'godan':
      return {
        label: 'Godan (五段)',
        colorClass: 'text-blue-500',
        description:
          'Godan verbs (also called u-verbs or Group I verbs) conjugate across five vowel sounds. The final kana changes based on the conjugation form.',
        rules: [
          'The stem changes based on the vowel grade (a, i, u, e, o)',
          'Te-form has sound changes based on the ending (って, んで, いて, etc.)',
          'Negative form uses the a-grade stem + ない',
          'Masu-form uses the i-grade stem + ます',
        ],
      };
    case 'ichidan':
      return {
        label: 'Ichidan (一段)',
        colorClass: 'text-green-500',
        description:
          'Ichidan verbs (also called ru-verbs or Group II verbs) have a simpler conjugation pattern. The る ending is replaced with the appropriate suffix.',
        rules: [
          'Remove る and add the conjugation suffix',
          'Te-form: stem + て',
          'Negative form: stem + ない',
          'Masu-form: stem + ます',
          'Potential form has both traditional (-られる) and colloquial (-れる) forms',
        ],
      };
    case 'irregular':
      return {
        label: 'Irregular',
        colorClass: 'text-purple-500',
        description:
          'This verb has irregular conjugation patterns that must be memorized.',
        rules: ['Conjugation patterns do not follow standard rules'],
      };
    default:
      return {
        label: 'Unknown',
        colorClass: 'text-[var(--secondary-color)]',
        description: 'Unable to determine verb type.',
        rules: [],
      };
  }
}

/**
 * Get display information for specific irregular verb types
 */
function getIrregularTypeInfo(irregularType: IrregularType): {
  label: string;
  colorClass: string;
  description: string;
  rules: string[];
} {
  switch (irregularType) {
    case 'suru':
      return {
        label: 'する-verb',
        colorClass: 'text-purple-500',
        description:
          'する (to do) is one of the two main irregular verbs in Japanese. It has unique conjugation patterns.',
        rules: [
          'Te-form: して',
          'Negative: しない',
          'Masu-form: します',
          'Potential: できる (separate verb)',
          'Passive: される',
          'Causative: させる',
        ],
      };
    case 'kuru':
      return {
        label: '来る-verb',
        colorClass: 'text-purple-500',
        description:
          '来る (to come) is one of the two main irregular verbs. The reading changes between く and こ depending on the form.',
        rules: [
          'Te-form: 来て (きて)',
          'Negative: 来ない (こない)',
          'Masu-form: 来ます (きます)',
          'Potential: 来られる (こられる)',
          'Past: 来た (きた)',
        ],
      };
    case 'aru':
      return {
        label: 'ある-verb',
        colorClass: 'text-orange-500',
        description:
          'ある (to exist, for inanimate objects) has a unique negative form.',
        rules: [
          'Negative: ない (not あらない)',
          'Other forms follow Godan patterns',
          'Te-form: あって',
          'Past: あった',
        ],
      };
    case 'iku':
      return {
        label: '行く-verb',
        colorClass: 'text-orange-500',
        description:
          '行く (to go) is mostly regular but has an irregular te-form.',
        rules: [
          'Te-form: 行って (not 行いて)',
          'Ta-form: 行った (not 行いた)',
          'Other forms follow regular Godan patterns',
        ],
      };
    case 'honorific':
      return {
        label: 'Honorific',
        colorClass: 'text-pink-500',
        description:
          'Honorific verbs (くださる, なさる, いらっしゃる, おっしゃる, ござる) have irregular masu-forms.',
        rules: [
          'Masu-form uses ます instead of ります',
          'Example: くださる → くださいます (not くださります)',
          'Other forms follow Godan patterns',
        ],
      };
    default:
      return {
        label: 'Irregular',
        colorClass: 'text-purple-500',
        description: 'This verb has irregular conjugation patterns.',
        rules: [],
      };
  }
}
