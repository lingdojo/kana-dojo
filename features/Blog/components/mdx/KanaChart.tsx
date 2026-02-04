'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';

/**
 * Base hiragana characters (46 characters)
 */
const HIRAGANA_BASE = [
  { kana: 'あ', romaji: 'a' },
  { kana: 'い', romaji: 'i' },
  { kana: 'う', romaji: 'u' },
  { kana: 'え', romaji: 'e' },
  { kana: 'お', romaji: 'o' },
  { kana: 'か', romaji: 'ka' },
  { kana: 'き', romaji: 'ki' },
  { kana: 'く', romaji: 'ku' },
  { kana: 'け', romaji: 'ke' },
  { kana: 'こ', romaji: 'ko' },
  { kana: 'さ', romaji: 'sa' },
  { kana: 'し', romaji: 'shi' },
  { kana: 'す', romaji: 'su' },
  { kana: 'せ', romaji: 'se' },
  { kana: 'そ', romaji: 'so' },
  { kana: 'た', romaji: 'ta' },
  { kana: 'ち', romaji: 'chi' },
  { kana: 'つ', romaji: 'tsu' },
  { kana: 'て', romaji: 'te' },
  { kana: 'と', romaji: 'to' },
  { kana: 'な', romaji: 'na' },
  { kana: 'に', romaji: 'ni' },
  { kana: 'ぬ', romaji: 'nu' },
  { kana: 'ね', romaji: 'ne' },
  { kana: 'の', romaji: 'no' },
  { kana: 'は', romaji: 'ha' },
  { kana: 'ひ', romaji: 'hi' },
  { kana: 'ふ', romaji: 'fu' },
  { kana: 'へ', romaji: 'he' },
  { kana: 'ほ', romaji: 'ho' },
  { kana: 'ま', romaji: 'ma' },
  { kana: 'み', romaji: 'mi' },
  { kana: 'む', romaji: 'mu' },
  { kana: 'め', romaji: 'me' },
  { kana: 'も', romaji: 'mo' },
  { kana: 'や', romaji: 'ya' },
  { kana: 'ゆ', romaji: 'yu' },
  { kana: 'よ', romaji: 'yo' },
  { kana: 'ら', romaji: 'ra' },
  { kana: 'り', romaji: 'ri' },
  { kana: 'る', romaji: 'ru' },
  { kana: 'れ', romaji: 're' },
  { kana: 'ろ', romaji: 'ro' },
  { kana: 'わ', romaji: 'wa' },
  { kana: 'を', romaji: 'wo' },
  { kana: 'ん', romaji: 'n' },
];

/**
 * Hiragana dakuten/handakuten characters (25 characters)
 */
const HIRAGANA_DAKUTEN = [
  { kana: 'が', romaji: 'ga' },
  { kana: 'ぎ', romaji: 'gi' },
  { kana: 'ぐ', romaji: 'gu' },
  { kana: 'げ', romaji: 'ge' },
  { kana: 'ご', romaji: 'go' },
  { kana: 'ざ', romaji: 'za' },
  { kana: 'じ', romaji: 'ji' },
  { kana: 'ず', romaji: 'zu' },
  { kana: 'ぜ', romaji: 'ze' },
  { kana: 'ぞ', romaji: 'zo' },
  { kana: 'だ', romaji: 'da' },
  { kana: 'ぢ', romaji: 'ji' },
  { kana: 'づ', romaji: 'zu' },
  { kana: 'で', romaji: 'de' },
  { kana: 'ど', romaji: 'do' },
  { kana: 'ば', romaji: 'ba' },
  { kana: 'び', romaji: 'bi' },
  { kana: 'ぶ', romaji: 'bu' },
  { kana: 'べ', romaji: 'be' },
  { kana: 'ぼ', romaji: 'bo' },
  { kana: 'ぱ', romaji: 'pa' },
  { kana: 'ぴ', romaji: 'pi' },
  { kana: 'ぷ', romaji: 'pu' },
  { kana: 'ぺ', romaji: 'pe' },
  { kana: 'ぽ', romaji: 'po' },
];

/**
 * Base katakana characters (46 characters)
 */
const KATAKANA_BASE = [
  { kana: 'ア', romaji: 'a' },
  { kana: 'イ', romaji: 'i' },
  { kana: 'ウ', romaji: 'u' },
  { kana: 'エ', romaji: 'e' },
  { kana: 'オ', romaji: 'o' },
  { kana: 'カ', romaji: 'ka' },
  { kana: 'キ', romaji: 'ki' },
  { kana: 'ク', romaji: 'ku' },
  { kana: 'ケ', romaji: 'ke' },
  { kana: 'コ', romaji: 'ko' },
  { kana: 'サ', romaji: 'sa' },
  { kana: 'シ', romaji: 'shi' },
  { kana: 'ス', romaji: 'su' },
  { kana: 'セ', romaji: 'se' },
  { kana: 'ソ', romaji: 'so' },
  { kana: 'タ', romaji: 'ta' },
  { kana: 'チ', romaji: 'chi' },
  { kana: 'ツ', romaji: 'tsu' },
  { kana: 'テ', romaji: 'te' },
  { kana: 'ト', romaji: 'to' },
  { kana: 'ナ', romaji: 'na' },
  { kana: 'ニ', romaji: 'ni' },
  { kana: 'ヌ', romaji: 'nu' },
  { kana: 'ネ', romaji: 'ne' },
  { kana: 'ノ', romaji: 'no' },
  { kana: 'ハ', romaji: 'ha' },
  { kana: 'ヒ', romaji: 'hi' },
  { kana: 'フ', romaji: 'fu' },
  { kana: 'ヘ', romaji: 'he' },
  { kana: 'ホ', romaji: 'ho' },
  { kana: 'マ', romaji: 'ma' },
  { kana: 'ミ', romaji: 'mi' },
  { kana: 'ム', romaji: 'mu' },
  { kana: 'メ', romaji: 'me' },
  { kana: 'モ', romaji: 'mo' },
  { kana: 'ヤ', romaji: 'ya' },
  { kana: 'ユ', romaji: 'yu' },
  { kana: 'ヨ', romaji: 'yo' },
  { kana: 'ラ', romaji: 'ra' },
  { kana: 'リ', romaji: 'ri' },
  { kana: 'ル', romaji: 'ru' },
  { kana: 'レ', romaji: 're' },
  { kana: 'ロ', romaji: 'ro' },
  { kana: 'ワ', romaji: 'wa' },
  { kana: 'ヲ', romaji: 'wo' },
  { kana: 'ン', romaji: 'n' },
];

/**
 * Katakana dakuten/handakuten characters (25 characters)
 */
const KATAKANA_DAKUTEN = [
  { kana: 'ガ', romaji: 'ga' },
  { kana: 'ギ', romaji: 'gi' },
  { kana: 'グ', romaji: 'gu' },
  { kana: 'ゲ', romaji: 'ge' },
  { kana: 'ゴ', romaji: 'go' },
  { kana: 'ザ', romaji: 'za' },
  { kana: 'ジ', romaji: 'ji' },
  { kana: 'ズ', romaji: 'zu' },
  { kana: 'ゼ', romaji: 'ze' },
  { kana: 'ゾ', romaji: 'zo' },
  { kana: 'ダ', romaji: 'da' },
  { kana: 'ヂ', romaji: 'ji' },
  { kana: 'ヅ', romaji: 'zu' },
  { kana: 'デ', romaji: 'de' },
  { kana: 'ド', romaji: 'do' },
  { kana: 'バ', romaji: 'ba' },
  { kana: 'ビ', romaji: 'bi' },
  { kana: 'ブ', romaji: 'bu' },
  { kana: 'ベ', romaji: 'be' },
  { kana: 'ボ', romaji: 'bo' },
  { kana: 'パ', romaji: 'pa' },
  { kana: 'ピ', romaji: 'pi' },
  { kana: 'プ', romaji: 'pu' },
  { kana: 'ペ', romaji: 'pe' },
  { kana: 'ポ', romaji: 'po' },
];

/** Number of base characters */
export const BASE_CHARACTER_COUNT = 46;

/** Number of dakuten/handakuten characters */
export const DAKUTEN_CHARACTER_COUNT = 25;

/** Total characters in extended mode */
export const EXTENDED_CHARACTER_COUNT =
  BASE_CHARACTER_COUNT + DAKUTEN_CHARACTER_COUNT;

interface KanaChartProps {
  /** Type of kana to display */
  type: 'hiragana' | 'katakana';
  /** Whether to show romaji below each character */
  showRomaji?: boolean;
  /** Whether to include dakuten/handakuten characters */
  extended?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * KanaChart Component for MDX
 * Renders an interactive hiragana or katakana chart.
 * Supports extended mode for dakuten/handakuten characters.
 *
 * @example
 * <KanaChart type="hiragana" showRomaji={true} />
 * <KanaChart type="katakana" extended={true} />
 */
export function KanaChart({
  type,
  showRomaji = true,
  extended = false,
  className,
}: KanaChartProps) {
  const baseChars = type === 'hiragana' ? HIRAGANA_BASE : KATAKANA_BASE;
  const dakutenChars =
    type === 'hiragana' ? HIRAGANA_DAKUTEN : KATAKANA_DAKUTEN;
  const characters = extended ? [...baseChars, ...dakutenChars] : baseChars;

  return (
    <div
      className={cn('my-6', className)}
      data-testid='kana-chart'
      data-type={type}
      data-extended={extended}
    >
      <div
        className='grid grid-cols-5 gap-2 sm:grid-cols-10'
        data-testid='kana-chart-grid'
      >
        {characters.map((char, index) => (
          <div
            key={`${char.kana}-${index}`}
            className='flex flex-col items-center justify-center rounded-lg border border-(--border-color) bg-(--card-color) p-2 transition-colors hover:border-(--main-color)'
            data-testid='kana-chart-cell'
          >
            <span
              className='text-2xl font-medium text-(--main-color)'
              lang='ja'
              data-testid='kana-character'
            >
              {char.kana}
            </span>
            {showRomaji && (
              <span
                className='mt-1 text-xs text-(--secondary-color)'
                data-testid='kana-romaji'
              >
                {char.romaji}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default KanaChart;
