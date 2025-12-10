import TimedChallengeKanji from '@/features/Kanji/components/TimedChallenge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kanji Blitz - Test Your Kanji Recognition Speed',
  description:
    'Test your Kanji knowledge with a timed challenge. Race against the clock to see how many kanji characters you can identify correctly. Perfect for JLPT preparation and speed practice.',
  keywords: [
    'kanji blitz',
    'kanji speed test',
    'timed kanji practice',
    'JLPT speed test',
    'kanji recognition'
  ],
  openGraph: {
    title: 'Kanji Blitz - Test Your Speed',
    description:
      'Race against the clock to test your Kanji mastery and recognition speed.',
    url: 'https://kanadojo.com/kanji/blitz',
    type: 'website'
  },
  alternates: {
    canonical: 'https://kanadojo.com/kanji/blitz'
  }
};

export default function BlitzPage() {
  return <TimedChallengeKanji />;
}
