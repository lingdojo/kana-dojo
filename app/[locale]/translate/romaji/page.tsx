import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildTranslatorMetadata,
  buildTranslatorSchema,
  type TranslatorFaqEntry,
} from '@/features/Translator/lib/seo';
import { StructuredData } from '@/shared/components/SEO/StructuredData';

export function generateStaticParams() {
  return [{ locale: 'en' }];
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

const metadataConfig = {
  pathname: '/translate/romaji',
  title: 'Japanese to Romaji Guide',
  description:
    'Learn how to use Japanese to romaji output for pronunciation support, reading checks, and beginner-friendly verification without treating romaji as a full replacement for kana.',
  keywords: [
    'romaji translator',
    'japanese to romaji',
    'japanese romaji guide',
    'romaji pronunciation',
    'kana to romaji',
  ],
  schemaName: 'Japanese to Romaji Guide',
  breadcrumbName: 'Romaji Guide',
};

const faqItems: TranslatorFaqEntry[] = [
  {
    question: 'What is romaji useful for?',
    answer:
      'Romaji is useful for pronunciation support, quick reading checks, and helping beginners bridge into kana.',
  },
  {
    question: 'Should I rely on romaji alone?',
    answer:
      'No. Romaji is a bridge, not a replacement for learning hiragana, katakana, and eventually kanji.',
  },
  {
    question: 'When should I use this page instead of the translator pages?',
    answer:
      'Use this page when pronunciation help is the main goal rather than translating meaning between English and Japanese.',
  },
];

export async function generateMetadata(_: PageProps): Promise<Metadata> {
  return buildTranslatorMetadata({
    ...metadataConfig,
    faq: faqItems,
  });
}

export default async function RomajiPage(_: PageProps) {
  const examples = [
    ['こんにちは', 'konnichiwa', 'Hello'],
    ['ありがとう', 'arigatou', 'Thank you'],
    ['駅はどこですか', 'eki wa doko desu ka', 'Where is the station?'],
    ['漢字', 'kanji', 'Chinese character / kanji'],
    [
      '日本語を勉強しています',
      'nihongo o benkyou shite imasu',
      'I am studying Japanese',
    ],
    ['大丈夫です', 'daijoubu desu', 'It is okay'],
  ];

  return (
    <>
      <StructuredData
        data={buildTranslatorSchema({
          ...metadataConfig,
          faq: faqItems,
        })}
      />
      <main className='mx-auto max-w-4xl px-4 py-10'>
        <h1 className='text-3xl font-bold text-(--main-color)'>
          Japanese to Romaji Guide
        </h1>
        <p className='mt-4 text-(--secondary-color)'>
          Romaji writes Japanese sounds with the Latin alphabet. It is helpful
          for pronunciation support and quick reading checks, but it works best
          when you use it as a bridge into kana rather than a replacement.
        </p>
        <h2 className='mt-6 text-xl font-semibold text-(--main-color)'>
          How to use romaji correctly
        </h2>
        <ul className='mt-3 list-disc space-y-2 pl-5 text-(--secondary-color)'>
          <li>Use it to pronounce new words and confirm readings quickly.</li>
          <li>Cross-check against hiragana or katakana whenever possible.</li>
          <li>Do not treat it as a replacement for Japanese script study.</li>
        </ul>
        <section className='mt-8 rounded-xl border border-(--border-color) bg-(--card-color) p-4'>
          <h2 className='text-xl font-semibold text-(--main-color)'>
            Japanese to romaji examples
          </h2>
          <div className='mt-3 overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-(--border-color) text-(--main-color)'>
                  <th className='px-2 py-2'>Japanese</th>
                  <th className='px-2 py-2'>Romaji</th>
                  <th className='px-2 py-2'>Meaning</th>
                </tr>
              </thead>
              <tbody className='text-(--secondary-color)'>
                {examples.map(row => (
                  <tr
                    key={row[0]}
                    className='border-b border-(--border-color)/60'
                  >
                    <td className='px-2 py-2'>{row[0]}</td>
                    <td className='px-2 py-2 italic'>{row[1]}</td>
                    <td className='px-2 py-2'>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className='mt-8 rounded-xl border border-(--border-color) bg-(--card-color) p-4'>
          <h2 className='text-xl font-semibold text-(--main-color)'>
            When romaji helps and when it does not
          </h2>
          <div className='mt-3 space-y-3 text-sm text-(--secondary-color)'>
            <p>
              Romaji is useful when you need a pronunciation prompt or a quick
              sanity check on a Japanese line you cannot read fluently yet.
            </p>
            <p>
              It is much less useful when you need to understand nuance,
              spelling, or word boundaries. For that, pair romaji with kana,
              kanji, and a meaning-focused translation page.
            </p>
          </div>
        </section>
        <div className='mt-8 flex flex-wrap gap-3'>
          <Link
            href='/translate'
            className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color)'
          >
            Open translator hub
          </Link>
          <Link
            href='/kana'
            className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color)'
          >
            Practice kana
          </Link>
        </div>
      </main>
    </>
  );
}
