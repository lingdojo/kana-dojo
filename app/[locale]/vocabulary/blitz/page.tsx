import TimedChallengeVocab from '@/features/Vocabulary/components/TimedChallenge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vocabulary Blitz - Test Your Japanese Vocabulary Speed',
  description:
    'Test your Japanese vocabulary knowledge with a timed challenge. Race against the clock to see how many words you can translate correctly. Perfect for JLPT preparation and vocabulary mastery.',
  keywords: [
    'vocabulary blitz',
    'japanese vocab speed test',
    'timed vocabulary practice',
    'JLPT vocabulary test',
    'japanese words quiz'
  ],
  openGraph: {
    title: 'Vocabulary Blitz - Test Your Speed',
    description:
      'Race against the clock to test your Japanese vocabulary mastery.',
    url: 'https://kanadojo.com/vocabulary/blitz',
    type: 'website'
  },
  alternates: {
    canonical: 'https://kanadojo.com/vocabulary/blitz'
  }
};

export default function BlitzPage() {
  return <TimedChallengeVocab />;
}
