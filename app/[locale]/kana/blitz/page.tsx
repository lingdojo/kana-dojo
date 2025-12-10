import TimedChallengeKana from '@/features/Kana/components/TimedChallenge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Blitz - Test Your Hiragana & Katakana Speed',
  description:
    'Test your Hiragana and Katakana knowledge with a timed challenge. Race against the clock to see how many kana characters you can identify correctly. Perfect for speed practice and mastery testing.',
  keywords: [
    'kana blitz',
    'hiragana speed test',
    'katakana speed test',
    'timed kana practice',
    'japanese speed test'
  ],
  openGraph: {
    title: 'Kana Blitz - Test Your Speed',
    description:
      'Race against the clock to test your Hiragana and Katakana mastery.',
    url: 'https://kanadojo.com/kana/blitz',
    type: 'website'
  },
  alternates: {
    canonical: 'https://kanadojo.com/kana/blitz'
  }
};

export default function BlitzPage() {
  return <TimedChallengeKana />;
}
