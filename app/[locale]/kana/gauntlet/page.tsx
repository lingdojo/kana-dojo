import GauntletKana from '@/features/Kana/components/Gauntlet';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Gauntlet - Master Every Character',
  description:
    'Challenge yourself to identify every selected kana character multiple times. Three difficulty levels with lives system: Normal, Hard, and Instant Death.',
  keywords: [
    'kana gauntlet',
    'hiragana challenge',
    'katakana challenge',
    'kana mastery',
    'japanese practice'
  ],
  openGraph: {
    title: 'Kana Gauntlet - Master Every Character',
    description:
      'Test your kana mastery with the Gauntlet challenge. Can you survive?',
    url: 'https://kanadojo.com/kana/gauntlet',
    type: 'website'
  },
  alternates: {
    canonical: 'https://kanadojo.com/kana/gauntlet'
  }
};

export default function GauntletPage() {
  return <GauntletKana />;
}
