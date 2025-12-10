import type { Metadata } from 'next';
import DojoMenu from '@/shared/components/Menu/DojoMenu';

export const metadata: Metadata = {
  title: 'Kanji Dojo - Learn Japanese Kanji Characters by JLPT Level',
  description:
    'Master Japanese Kanji with the Kanji Dojo. Practice essential kanji characters organized by JLPT levels (N5, N4, N3, N2) with interactive games and multiple training modes. Perfect for JLPT preparation.',
  keywords: [
    'learn kanji',
    'kanji practice',
    'JLPT kanji',
    'japanese kanji',
    'kanji N5',
    'kanji N4',
    'kanji N3',
    'kanji N2',
    'kanji learning',
    'kanji study',
    'japanese characters'
  ],
  openGraph: {
    title: 'Kanji Dojo - Learn Japanese Kanji by JLPT Level',
    description:
      'Master Japanese Kanji characters organized by JLPT levels. Practice with interactive games, multiple training modes, and track your progress.',
    url: 'https://kanadojo.com/kanji',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'Kanji Dojo - Learn Japanese Kanji',
    description:
      'Master Japanese Kanji by JLPT level with interactive practice games.'
  },
  alternates: {
    canonical: 'https://kanadojo.com/kanji'
  }
};

export default function KanjiPage() {
  return <DojoMenu />;
}
