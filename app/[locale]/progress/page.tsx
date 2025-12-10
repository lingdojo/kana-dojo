import ProgressWithSidebar from '@/features/Progress/components/ProgressWithSidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progress - Track Your Japanese Learning Statistics',
  description:
    'Monitor your Japanese learning journey with detailed progress statistics. Track your mastery of Hiragana, Katakana, Kanji, and Vocabulary with comprehensive analytics and performance metrics.',
  openGraph: {
    title: 'Progress - Track Your Japanese Learning Statistics',
    description:
      'Monitor your Japanese learning with detailed statistics and performance analytics.',
    url: 'https://kanadojo.com/progress',
    type: 'website'
  },
  alternates: {
    canonical: 'https://kanadojo.com/progress'
  }
};

export default function ProgressPage() {
  return <ProgressWithSidebar />;
}
