'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';

interface FuriganaTextProps {
  /** Japanese text (kanji) to display */
  kanji: string;
  /** Reading (hiragana/katakana) to display above the kanji */
  reading: string;
  /** Additional CSS classes for the ruby element */
  className?: string;
}

/**
 * FuriganaText Component for MDX
 * Renders Japanese text with furigana reading aids above kanji using ruby/rt elements.
 * This is a simplified version specifically for MDX blog content that always shows furigana.
 *
 * @example
 * <FuriganaText kanji="日本語" reading="にほんご" />
 */
export function FuriganaText({ kanji, reading, className }: FuriganaTextProps) {
  return (
    <ruby
      className={cn('inline-block', className)}
      lang='ja'
      data-testid='furigana-text'
    >
      <span data-testid='furigana-kanji'>{kanji}</span>
      <rt
        className='text-xs text-(--secondary-color)'
        data-testid='furigana-reading'
      >
        {reading}
      </rt>
    </ruby>
  );
}

export default FuriganaText;
