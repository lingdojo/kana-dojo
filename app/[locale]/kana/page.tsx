import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import DojoMenu from '@/shared/components/Menu/DojoMenu';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('kana.metadata');

  return {
    title: t('title'),
    description: t('description'),
    keywords: [
      'learn hiragana',
      'learn katakana',
      'hiragana practice',
      'katakana practice',
      'japanese kana',
      'kana learning',
      'hiragana chart',
      'katakana chart',
      'japanese syllabary',
      'kana quiz'
    ],
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://kanadojo.com/kana',
      type: 'website'
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('description')
    },
    alternates: {
      canonical: 'https://kanadojo.com/kana'
    }
  };
}

export default function KanaPage() {
  return <DojoMenu />;
}
