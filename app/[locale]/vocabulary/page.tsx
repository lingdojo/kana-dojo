import type { Metadata } from 'next';
import DojoMenu from '@/shared/components/Menu/DojoMenu';

export const metadata: Metadata = {
  title: 'Vocabulary Dojo - Learn Japanese Words & Vocabulary by JLPT Level',
  description:
    'Build your Japanese vocabulary with the Vocabulary Dojo. Learn essential Japanese words organized by JLPT levels with interactive games and multiple training modes. Perfect for daily conversation and JLPT preparation.',
  keywords: [
    'japanese vocabulary',
    'learn japanese words',
    'JLPT vocabulary',
    'japanese vocab practice',
    'japanese words',
    'vocabulary N5',
    'vocabulary N4',
    'vocabulary N3',
    'vocabulary N2',
    'japanese language learning'
  ],
  openGraph: {
    title: 'Vocabulary Dojo - Learn Japanese Vocabulary by JLPT Level',
    description:
      'Build your Japanese vocabulary with words organized by JLPT levels. Practice with interactive games and track your progress.',
    url: 'https://kanadojo.com/vocabulary',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'Vocabulary Dojo - Learn Japanese Words',
    description:
      'Build Japanese vocabulary by JLPT level with interactive practice.'
  },
  alternates: {
    canonical: 'https://kanadojo.com/vocabulary'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function VocabPage() {
  return <DojoMenu />;
}
