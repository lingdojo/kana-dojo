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
    <section className='flex flex-col gap-8 py-12'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2 text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
          <div className='h-[1px] w-4 bg-(--main-color)' />
          <span>Information</span>
        </div>
        <h2 className='text-2xl font-bold tracking-tight text-(--main-color)'>
          Japanese Verb Conjugation
        </h2>
      </div>

      <div className='max-w-3xl text-(--secondary-color)/70'>
        <p className='text-base font-medium'>
          Japanese verbs are conjugated based on their classification: Godan,
          Ichidan, or Irregular. Use this tool to quickly find the correct form
          for any verb.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
        <div className='flex flex-col gap-2'>
          <h3 className='text-lg font-bold text-blue-500'>Godan Verbs</h3>
          <p className='text-sm text-(--secondary-color)/60'>
            Verbs that end in -u and conjugate across five vowel sounds.
          </p>
        </div>
        <div className='flex flex-col gap-2'>
          <h3 className='text-lg font-bold text-green-500'>Ichidan Verbs</h3>
          <p className='text-sm text-(--secondary-color)/60'>
            Verbs that end in -iru or -eru and drop the る to conjugate.
          </p>
        </div>
        <div className='flex flex-col gap-2'>
          <h3 className='text-lg font-bold text-purple-500'>Irregular Verbs</h3>
          <p className='text-sm text-(--secondary-color)/60'>
            Verbs like する and 来る that follow unique patterns.
          </p>
        </div>
      </div>

      <div className='border-t border-(--border-color)/10 pt-8'>
        <p className='text-xs text-(--secondary-color)/40'>
          KanaDojo provides accurate Japanese verb conjugations for students and
          speakers.
        </p>
      </div>
    </section>
  );
}

