import GauntletVocab from '@/features/Vocabulary/components/Gauntlet';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vocabulary Gauntlet - Master Every Word',
  description:
    'Challenge yourself to identify every selected Japanese vocabulary word multiple times. Three difficulty levels with lives system: Normal, Hard, and Instant Death.',
  keywords: [
    'vocabulary gauntlet',
    'japanese vocabulary challenge',
    'jlpt vocabulary',
    'japanese word mastery',
    'vocabulary practice'
  ],
  openGraph: {
    title: 'Vocabulary Gauntlet - Master Every Word',
    description:
      'Test your vocabulary mastery with the Gauntlet challenge. Can you survive?',
    url: 'https://kanadojo.com/vocabulary/gauntlet',
    type: 'website'
  },
  alternates: {
    canonical: 'https://kanadojo.com/vocabulary/gauntlet'
  }
};

export default function GauntletPage() {
  return <GauntletVocab />;
}
