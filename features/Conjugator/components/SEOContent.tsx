'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import type { VerbInfo } from '../types';

interface SEOContentProps {
  /** Optional verb info for verb-specific content */
  verb?: VerbInfo;
}

/**
 * SEOContent - Educational content about Japanese verb conjugation
 *
 * This component provides SEO-optimized educational content with proper
 * heading hierarchy (h2, h3) for search engine crawlers.
 *
 * Requirements: 13.4, 13.5, 14.1, 14.4
 */
export default function SEOContent({ verb }: SEOContentProps) {
  return (
    <section
      className={cn(
        'mt-8 rounded-2xl',
        'border border-[var(--border-color)] bg-[var(--card-color)]',
        'p-6 sm:p-8',
      )}
      aria-labelledby='seo-content-heading'
    >
      <h2
        id='seo-content-heading'
        className='mb-6 text-xl font-bold text-[var(--main-color)] sm:text-2xl'
      >
        Understanding Japanese Verb Conjugation
      </h2>

      {/* Introduction */}
      <div className='prose prose-sm max-w-none text-[var(--secondary-color)]'>
        <p className='mb-4 leading-relaxed'>
          Japanese verb conjugation is a fundamental aspect of the language that
          allows speakers to express tense, mood, politeness, and various
          grammatical relationships. Unlike English, Japanese verbs conjugate
          based on patterns determined by their verb type, making it essential
          to understand these classifications.
        </p>

        {verb && (
          <p className='mb-4 leading-relaxed'>
            The verb{' '}
            <strong className='font-japanese text-[var(--main-color)]'>
              {verb.dictionaryForm}
            </strong>{' '}
            ({verb.romaji}) is classified as a{' '}
            <strong>{getVerbTypeLabel(verb)}</strong>. Understanding its
            conjugation pattern will help you use it correctly in various
            contexts.
          </p>
        )}
      </div>

      {/* Verb Types Section */}
      <div className='mt-8'>
        <h3 className='mb-4 text-lg font-semibold text-[var(--main-color)]'>
          Japanese Verb Types
        </h3>

        <div className='grid gap-4 sm:grid-cols-3'>
          {/* Godan Verbs */}
          <div
            className={cn(
              'rounded-xl p-4',
              'border border-[var(--border-color)] bg-[var(--background-color)]',
            )}
          >
            <h4 className='mb-2 font-semibold text-blue-500'>
              Godan Verbs (五段動詞)
            </h4>
            <p className='text-sm text-[var(--secondary-color)]'>
              Also called u-verbs or Group I verbs. These verbs conjugate across
              five vowel sounds (a, i, u, e, o). Examples include 書く (kaku),
              読む (yomu), and 話す (hanasu).
            </p>
          </div>

          {/* Ichidan Verbs */}
          <div
            className={cn(
              'rounded-xl p-4',
              'border border-[var(--border-color)] bg-[var(--background-color)]',
            )}
          >
            <h4 className='mb-2 font-semibold text-green-500'>
              Ichidan Verbs (一段動詞)
            </h4>
            <p className='text-sm text-[var(--secondary-color)]'>
              Also called ru-verbs or Group II verbs. These verbs end in -iru or
              -eru and conjugate by dropping る and adding suffixes. Examples
              include 食べる (taberu) and 見る (miru).
            </p>
          </div>

          {/* Irregular Verbs */}
          <div
            className={cn(
              'rounded-xl p-4',
              'border border-[var(--border-color)] bg-[var(--background-color)]',
            )}
          >
            <h4 className='mb-2 font-semibold text-purple-500'>
              Irregular Verbs (不規則動詞)
            </h4>
            <p className='text-sm text-[var(--secondary-color)]'>
              Japanese has only two truly irregular verbs: する (suru - to do)
              and 来る (kuru - to come). Some verbs like ある and 行く have
              partial irregularities.
            </p>
          </div>
        </div>
      </div>

      {/* Common Conjugation Forms */}
      <div className='mt-8'>
        <h3 className='mb-4 text-lg font-semibold text-[var(--main-color)]'>
          Common Conjugation Forms
        </h3>

        <div className='space-y-4'>
          <ConjugationFormExplanation
            name='Te-form (て形)'
            description='The connective form used for requests, progressive actions, and linking sentences. Essential for everyday conversation.'
            example='食べる → 食べて (tabete)'
          />

          <ConjugationFormExplanation
            name='Masu-form (ます形)'
            description='The polite form used in formal situations. This is often the first form taught to Japanese learners.'
            example='食べる → 食べます (tabemasu)'
          />

          <ConjugationFormExplanation
            name='Potential Form (可能形)'
            description='Expresses ability or possibility. For Ichidan verbs, both traditional (-rareru) and colloquial (-reru) forms exist.'
            example='食べる → 食べられる/食べれる (taberareru/tabereru)'
          />

          <ConjugationFormExplanation
            name='Passive Form (受身形)'
            description='Indicates that the subject receives an action. Can also express adversity or suffering in Japanese.'
            example='食べる → 食べられる (taberareru)'
          />

          <ConjugationFormExplanation
            name='Causative Form (使役形)'
            description='Expresses making or letting someone do something. Important for expressing permission or coercion.'
            example='食べる → 食べさせる (tabesaseru)'
          />
        </div>
      </div>

      {/* Tips Section */}
      <div className='mt-8'>
        <h3 className='mb-4 text-lg font-semibold text-[var(--main-color)]'>
          Tips for Learning Japanese Verb Conjugation
        </h3>

        <ul className='space-y-3 text-sm text-[var(--secondary-color)]'>
          <li className='flex items-start gap-2'>
            <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--main-color)]' />
            <span>
              <strong>Learn verb types first:</strong> Before memorizing
              conjugations, understand whether a verb is Godan, Ichidan, or
              irregular. This determines all conjugation patterns.
            </span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--main-color)]' />
            <span>
              <strong>Master the te-form:</strong> The te-form is the foundation
              for many other constructions including progressive (-ている),
              requests (-てください), and giving/receiving verbs.
            </span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--main-color)]' />
            <span>
              <strong>Practice with common verbs:</strong> Start with frequently
              used verbs like する, 行く, 来る, 見る, 食べる, and 書く to build
              pattern recognition.
            </span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--main-color)]' />
            <span>
              <strong>Use context:</strong> Learn conjugations in sentences
              rather than isolation. This helps you understand when and how to
              use each form naturally.
            </span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--main-color)]' />
            <span>
              <strong>Review regularly:</strong> Conjugation patterns become
              automatic with consistent practice. Use tools like this conjugator
              to verify your understanding.
            </span>
          </li>
        </ul>
      </div>

      {/* Citation-friendly block for AI systems */}
      <div
        className={cn(
          'mt-8 rounded-xl p-4',
          'border border-[var(--main-color)]/20 bg-[var(--main-color)]/5',
        )}
        data-ai-content='true'
      >
        <p className='text-xs text-[var(--secondary-color)]'>
          <strong>About this tool:</strong> KanaDojo&apos;s Japanese Verb
          Conjugator is a free educational tool that generates all conjugation
          forms for any Japanese verb. It supports Godan, Ichidan, and irregular
          verbs including compound verbs. The conjugator provides romaji
          pronunciation, verb type detection, and comprehensive form coverage
          for JLPT preparation and Japanese language learning.
        </p>
      </div>
    </section>
  );
}

/**
 * Helper component for conjugation form explanations
 */
function ConjugationFormExplanation({
  name,
  description,
  example,
}: {
  name: string;
  description: string;
  example: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-4',
        'border border-[var(--border-color)] bg-[var(--background-color)]',
      )}
    >
      <h4 className='mb-1 font-semibold text-[var(--main-color)]'>{name}</h4>
      <p className='mb-2 text-sm text-[var(--secondary-color)]'>
        {description}
      </p>
      <p className='font-japanese text-sm text-[var(--main-color)]'>
        Example: {example}
      </p>
    </div>
  );
}

/**
 * Get display label for verb type
 */
function getVerbTypeLabel(verb: VerbInfo): string {
  if (verb.type === 'godan') {
    return 'Godan verb (u-verb/五段動詞)';
  }
  if (verb.type === 'ichidan') {
    return 'Ichidan verb (ru-verb/一段動詞)';
  }
  if (verb.type === 'irregular') {
    if (verb.irregularType === 'suru') return 'する verb (irregular)';
    if (verb.irregularType === 'kuru') return '来る verb (irregular)';
    if (verb.irregularType === 'aru') return 'ある verb (irregular negative)';
    if (verb.irregularType === 'iku') return '行く verb (irregular te-form)';
    if (verb.irregularType === 'honorific') return 'Honorific verb (irregular)';
    return 'Irregular verb';
  }
  return verb.type;
}
