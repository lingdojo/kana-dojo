'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Info } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
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
      className='flex flex-col gap-6'
      role='region'
      aria-label={`Verb information for ${verb.dictionaryForm}`}
    >
      {/* Main info header */}
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-3'>
              <span className='text-[10px] font-bold tracking-widest text-(--secondary-color) uppercase opacity-50'>
                Dictionary Entry
              </span>
              <div className='h-[1px] w-8 bg-(--main-color)/10' />
            </div>

            <div className='flex flex-col'>
              <h3
                className='font-japanese text-3xl font-bold text-(--main-color) sm:text-4xl'
                lang='ja'
              >
                {verb.dictionaryForm}
              </h3>
              <div className='flex items-center gap-4 text-base font-medium text-(--secondary-color) opacity-60'>
                <span className='font-japanese' lang='ja'>
                  {verb.reading}
                </span>
                <span className='opacity-20'>/</span>
                <span className='italic'>{verb.romaji}</span>
              </div>
            </div>
          </div>

          <div className='flex flex-col items-end gap-1 pb-2 text-right'>
            <span className='text-[10px] font-bold tracking-widest text-(--main-color) uppercase opacity-30'>
              Status
            </span>
            <span className='text-xl font-bold tracking-tight text-(--main-color)/80'>
              Verified Analysis
            </span>
          </div>
        </div>

        <div
          className='flex flex-wrap items-center gap-8'
          role='group'
          aria-label='Verb classification details'
        >
          <div className='flex flex-col gap-1'>
            <span className='text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
              Type
            </span>
            <span className={cn('text-xl font-bold', verbTypeInfo.colorClass)}>
              {verbTypeInfo.label}
            </span>
          </div>

          <div className='hidden h-8 w-[1px] bg-(--border-color)/10 sm:block' />

          <div className='flex flex-col gap-1'>
            <span className='text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
              Stem
            </span>
            <span
              className='font-japanese text-xl font-bold text-(--main-color)'
              lang='ja'
            >
              {verb.stem || '—'}
            </span>
          </div>

          <div className='hidden h-8 w-[1px] bg-(--border-color)/10 sm:block' />

          <div className='flex flex-col gap-1'>
            <span className='text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
              Ending
            </span>
            <span
              className='font-japanese text-xl font-bold text-(--main-color)'
              lang='ja'
            >
              {verb.ending || '—'}
            </span>
          </div>
        </div>

        {/* Compound Alert - Minimalist Integrated Line */}
        {verb.compoundPrefix && (
          <div className='flex items-center gap-8 border-l border-(--main-color)/20 py-2 pl-8'>
            <div className='flex h-2 w-2 rounded-full bg-(--main-color)' />
            <div className='flex items-baseline gap-4'>
              <span className='text-[10px] font-black tracking-widest text-(--main-color) uppercase opacity-40'>
                Complex Morph Detected:
              </span>
              <span
                className='font-japanese text-xl font-black text-(--main-color) opacity-80'
                lang='ja'
              >
                {verb.compoundPrefix}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Conjugation Rules */}
      <section className='border-t border-(--border-color)/10 pt-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col gap-2'>
            <h4 className='text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
              Transformation Rules
            </h4>
            <p className='text-base font-medium text-(--secondary-color)/70'>
              {verbTypeInfo.description}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {verbTypeInfo.rules.map((rule, idx) => (
              <div
                key={idx}
                className='flex gap-3 text-sm font-medium text-(--secondary-color)/60'
              >
                <span className='text-(--main-color)/20'>{idx + 1}.</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
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
        colorClass: 'text-(--secondary-color)',
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

