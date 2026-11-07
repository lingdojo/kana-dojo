'use client';

import React from 'react';
import { cn } from '@/shared/utils/utils';
import type { VerbInfo } from '../types';

interface SEOContentProps {
  /** Optional verb info for verb-specific content */
  verb?: VerbInfo;
}

/**
 * SEOContent - Educational content about Japanese verb conjugation
 */
export default function SEOContent({ verb }: SEOContentProps) {
  return (
    <section
      aria-labelledby='seo-content-heading'
      className='flex flex-col gap-8 py-12'
    >
      <header className='flex flex-col gap-2'>
        <div className='flex items-center gap-2 text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
          <div className='h-[1px] w-4 bg-(--main-color)' />
          <span>Information</span>
        </div>
        <h2
          id='seo-content-heading'
          className='text-2xl font-bold tracking-tight text-(--main-color)'
        >
          Japanese Verb Conjugation
        </h2>
      </header>

      <div
        data-ai-content='true'
        className='max-w-3xl text-(--secondary-color)/70'
      >
        <p className='text-base font-medium'>
          Learn Japanese verb conjugation with KanaDojo. This free conjugator
          helps you practice the forms used in everyday conversation and prepare
          for JLPT grammar questions. Explore examples such as 食べる (taberu,
          to eat) and 書く (kaku, to write), then compare how each verb changes
          by form and politeness.
        </p>
        {verb && (
          <p className='mt-3 text-sm'>
            Study {verb.dictionaryForm} ({verb.romaji}) and review its
            conjugations with this Japanese verb conjugator.
          </p>
        )}
      </div>

      <section className='flex flex-col gap-4'>
        <h3 className='text-xl font-bold text-(--main-color)'>
          Japanese Verb Types
        </h3>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
          <article className='flex flex-col gap-2'>
            <h4 className='text-lg font-bold text-blue-500'>Godan Verbs</h4>
            <p className='text-sm text-(--secondary-color)/60'>
              Godan verbs end in a range of kana sounds and change their final
              sound across five vowel rows. For example, 書く (kaku) becomes
              書いて (kaite) in the te-form.
            </p>
          </article>
          <article className='flex flex-col gap-2'>
            <h4 className='text-lg font-bold text-green-500'>Ichidan Verbs</h4>
            <p className='text-sm text-(--secondary-color)/60'>
              Ichidan verbs commonly end in -iru or -eru. Remove the final る
              before adding an ending; 食べる (taberu) becomes 食べて (tabete).
            </p>
          </article>
          <article className='flex flex-col gap-2'>
            <h4 className='text-lg font-bold text-purple-500'>
              Irregular Verbs
            </h4>
            <p className='text-sm text-(--secondary-color)/60'>
              The verbs する (suru, to do) and 来る (kuru, to come) have
              irregular forms. Learn their patterns individually and practice
              them in context.
            </p>
          </article>
        </div>
      </section>

      <section className='flex flex-col gap-4'>
        <h3 className='text-xl font-bold text-(--main-color)'>
          Common Conjugation Forms
        </h3>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          <article className='flex flex-col gap-2'>
            <h4 className='text-lg font-bold text-(--main-color)'>Te-form</h4>
            <p className='text-sm text-(--secondary-color)/60'>
              Use the te-form to connect actions, make requests, and form
              progressive expressions. For example, 食べる becomes 食べて.
            </p>
          </article>
          <article className='flex flex-col gap-2'>
            <h4 className='text-lg font-bold text-(--main-color)'>Masu-form</h4>
            <p className='text-sm text-(--secondary-color)/60'>
              The masu-form expresses polite speech. Learning both dictionary
              and masu forms helps you choose language appropriate to context.
            </p>
          </article>
          <article className='flex flex-col gap-2'>
            <h4 className='text-lg font-bold text-(--main-color)'>Potential</h4>
            <p className='text-sm text-(--secondary-color)/60'>
              Potential forms describe ability, such as being able to read,
              write, or eat something.
            </p>
          </article>
          <article className='flex flex-col gap-2'>
            <h4 className='text-lg font-bold text-(--main-color)'>Passive</h4>
            <p className='text-sm text-(--secondary-color)/60'>
              Passive forms focus on the person or thing affected by an action
              and are common in written and spoken Japanese.
            </p>
          </article>
          <article className='flex flex-col gap-2'>
            <h4 className='text-lg font-bold text-(--main-color)'>Causative</h4>
            <p className='text-sm text-(--secondary-color)/60'>
              Causative forms express making or allowing someone to do
              something. Compare their endings across Godan and Ichidan verbs.
            </p>
          </article>
        </div>
      </section>

      <section className='flex flex-col gap-4'>
        <h3 className='text-xl font-bold text-(--main-color)'>
          Tips for Learning Japanese Verbs
        </h3>
        <ul
          className={cn(
            'list-disc space-y-2 pl-5 text-sm',
            'text-(--secondary-color)/60',
          )}
        >
          <li>Learn to identify Godan, Ichidan, and irregular verb groups.</li>
          <li>
            Practice one conjugation at a time, then use each form in a
            sentence.
          </li>
          <li>
            Review examples such as 食べる and 書く to compare different verb
            patterns.
          </li>
          <li>
            Use regular practice to build confidence with JLPT-level Japanese
            grammar.
          </li>
        </ul>
      </section>

      <footer className='border-t border-(--border-color)/10 pt-8'>
        <p className='text-xs text-(--secondary-color)/40'>
          KanaDojo provides accurate Japanese verb conjugations and learning
          resources for students and speakers.
        </p>
      </footer>
    </section>
  );
}
