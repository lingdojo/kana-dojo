import SubsetDictionary from '@/features/Kana/components/SubsetDictionary';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

const subsets = [
  'hiragana-base',
  'hiragana-dakuon',
  'hiragana-yoon',
  'katakana-base',
  'katakana-dakuon',
  'katakana-yoon',
  'katakana-foreign',
] as const;

export function generateStaticParams() {
  return subsets.map(subset => ({ subset }));
}

interface PageProps {
  params: Promise<{ subset: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subset, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  // Convert subset to key (e.g., hiragana-base -> hiraganaBase)
  const subsetKey = subset.replace(/-([a-z])/g, (_, letter) =>
    letter.toUpperCase(),
  );

  const title = t(`kanaSubset.${subsetKey}.title`);
  const titleShort = t(`kanaSubset.${subsetKey}.titleShort`);
  const description = t(`kanaSubset.${subsetKey}.description`);
  const keywords = t(`kanaSubset.${subsetKey}.keywords`).split(',');

  const ogImageUrl = `https://kanadojo.com/api/og?title=${encodeURIComponent(titleShort)}&description=${encodeURIComponent(description.slice(0, 100))}&type=kana`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: titleShort,
      description,
      url: `https://kanadojo.com/${locale}/kana/${subset}`,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: titleShort,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleShort,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `https://kanadojo.com/${locale}/kana/${subset}`,
      languages: {
        en: `https://kanadojo.com/en/kana/${subset}`,
        es: `https://kanadojo.com/es/kana/${subset}`,
      },
    },
  };
}

export default function KanaSubsetDictionaryPage() {
  return <SubsetDictionary />;
}
