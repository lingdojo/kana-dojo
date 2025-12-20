import GauntletKanji from '@/features/Kanji/components/Gauntlet';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kanji Gauntlet - Master Every Character',
  description:
    'Challenge yourself to identify every selected kanji character multiple times. Three difficulty levels with lives system: Normal, Hard, and Instant Death.',
  keywords: [
    'kanji gauntlet',
    'kanji challenge',
    'kanji mastery',
    'japanese kanji practice',
    'jlpt kanji'
  ],
  openGraph: {
    title: 'Kanji Gauntlet - Master Every Character',
    description:
      'Test your kanji mastery with the Gauntlet challenge. Can you survive?',
    url: 'https://kanadojo.com/kanji/gauntlet',
    type: 'website'
  },
  alternates: {
    canonical: 'https://kanadojo.com/kanji/gauntlet'
  }
};

export default function GauntletPage() {
  return <GauntletKanji />;
}
