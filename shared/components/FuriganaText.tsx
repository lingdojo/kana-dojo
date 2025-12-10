'use client';
import { ReactNode } from 'react';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';

interface FuriganaTextProps {
  text: string;
  reading?: string;
  className?: string;
  furiganaClassName?: string;
  lang?: string;
  children?: ReactNode;
}

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
  children
}: FuriganaTextProps) => {
  const furiganaEnabled = usePreferencesStore(state => state.furiganaEnabled);

  // If children are provided, render them with optional furigana
  if (children) {
    if (furiganaEnabled && reading) {
      return (
        <ruby className={className} lang={lang}>
          {children}
          <rt
            className={`text-xs ${furiganaClassName} text-[var(--secondary-color)]`}
          >
            {reading}
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
    const hiraganaReading = reading.includes(' ')
      ? reading.split(' ')[1]
      : reading;

    return (
      <ruby className={className} lang={lang}>
        {text}
        <rt
          className={`text-xs ${furiganaClassName} text-[var(--secondary-color)]`}
        >
          {hiraganaReading}
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

export default FuriganaText;
