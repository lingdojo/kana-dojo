'use client';
import { ReactNode, memo } from 'react';
import { useThemePreferences } from '@/features/Preferences';

interface FuriganaTextProps {
  text: string;
  reading?: string;
  className?: string;
  furiganaClassName?: string;
  lang?: string;
  children?: ReactNode;
}

/**
 * Extracts the kana (hiragana/katakana) part from a reading string.
 *
 * Reading strings in the kanji data follow the format "romaji kana"
 * (e.g. "otoko おとこ", "dan ダン"). This helper reliably extracts only
 * the kana portion so furigana is never shown with the romaji prefix.
 *
 * Examples:
 *   "otoko おとこ" → "おとこ"
 *   "dan ダン"     → "ダン"
 *   "おとこ"       → "おとこ"  (kana-only, returned as-is)
 */
const extractKanaFromReading = (reading: string): string => {
  if (!reading) return reading;
  const spaceIndex = reading.indexOf(' ');
  if (spaceIndex !== -1) {
    return reading.slice(spaceIndex + 1).trim();
  }
  return reading;
};

/**
 * Component for displaying Japanese text with optional furigana (reading annotations)
 * When furigana is enabled in settings, displays reading above the main text
 * When disabled, displays only the main text
 */
const FuriganaText = ({
  text,
  reading,
  className = '',
  furiganaClassName = '',
  lang = 'ja',
  children,
}: FuriganaTextProps) => {
  const { furiganaEnabled } = useThemePreferences();

  // If children are provided, render them with optional furigana
  if (children) {
    if (furiganaEnabled && reading) {
      return (
        <ruby className={className} lang={lang}>
          {children}
          <rt
            className={`text-xs ${furiganaClassName} text-(--secondary-color)`}
          >
            {extractKanaFromReading(reading)}
          </rt>
        </ruby>
      );
    }
    return (
      <span className={className} lang={lang}>
        {children}
      </span>
    );
  }

  if (furiganaEnabled && reading) {
    return (
      <ruby className={className} lang={lang}>
        {text}
        <rt
          className={`text-xs ${furiganaClassName} text-(--secondary-color)`}
        >
          {extractKanaFromReading(reading)}
        </rt>
      </ruby>
    );
  }
  return (
    <span className={className} lang={lang}>
      {text}
    </span>
  );
};

export default memo(FuriganaText);
