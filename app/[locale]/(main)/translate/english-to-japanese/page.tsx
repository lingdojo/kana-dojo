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
  pathname: '/translate/english-to-japanese',
  title: 'English to Japanese Translator | with Romaji Support | KanaDojo',
  description:
    'Translate English to Japanese online for free. Get Japanese output, romaji support, and practical guidance for travel phrases, messages, and study examples.',
  keywords: [
    'english to japanese translator',
    'translate english to japanese',
    'english japanese translator online',
    'english to japanese with romaji',
    'free english to japanese translator',
  ],
  schemaName: 'English to Japanese Translator',
  breadcrumbName: 'English to Japanese',
};

const faqItems: TranslatorFaqEntry[] = [
  {
    question: 'What is this page best for?',
    answer:
      'This page is best for turning English phrases and short paragraphs into Japanese while reviewing output and pronunciation support.',
  },
  {
    question: 'Does it include romaji?',
    answer:
      'Yes. Romaji is available as pronunciation support when the output is Japanese.',
  },
  {
    question: 'How do I get more natural Japanese output?',
    answer:
      'Write short, direct English sentences and avoid vague pronouns or missing context when precision matters.',
  },
];

export async function generateMetadata(_: PageProps): Promise<Metadata> {
  return buildTranslatorMetadata({
    ...metadataConfig,
    faq: faqItems,
  });
}

export default async function EnglishToJapanesePage(_: PageProps) {
  const examples = [
    ['Where is the station?', '駅はどこですか？', 'Eki wa doko desu ka?'],
    ['I need help', '助けが必要です', 'Tasuke ga hitsuyo desu'],
    ['How much is this?', 'これはいくらですか？', 'Kore wa ikura desu ka?'],
    ['Please speak slowly', 'ゆっくり話してください', 'Yukkuri hanashite kudasai'],
    ['Can I pay by card?', 'カードで払えますか？', 'Kaado de haraemasu ka?'],
    ['I am learning Japanese', '日本語を勉強しています', 'Nihongo o benkyo shite imasu'],
    ['Nice to meet you', 'はじめまして', 'Hajimemashite'],
    ['What does this kanji mean?', 'この漢字はどういう意味ですか？', 'Kono kanji wa do iu imi desu ka?'],
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
          English → Japanese
        </h1>
        <p className='mt-4 text-(--secondary-color)'>
          Use this page when your goal is to produce Japanese text from English.
          It is strongest for everyday phrases, quick writing checks, travel
          questions, study prompts, and short messages where you want readable
          Japanese plus romaji support.
        </p>
        <ul className='mt-6 list-disc space-y-2 pl-5 text-(--secondary-color)'>
          <li>Best for everyday phrases, study prompts, and quick writing help.</li>
          <li>Output includes Japanese text and romaji for pronunciation support.</li>
          <li>Keep English input short and specific for cleaner results.</li>
        </ul>
        <section className='mt-8 rounded-xl border border-(--border-color) bg-(--card-color) p-4'>
          <h2 className='text-xl font-semibold text-(--main-color)'>
            When to use this page
          </h2>
          <div className='mt-3 space-y-3 text-sm text-(--secondary-color)'>
            <p>
              Use this route when the final output matters. If you are drafting a
              travel phrase, checking a sentence for study, or turning an English
              note into Japanese, this page should be the primary destination.
            </p>
            <p>
              For best results, keep the subject clear, avoid idioms when you can,
              and double-check names, honorifics, and slang before reusing the
              output in something important.
            </p>
          </div>
        </section>
        <section className='mt-8 rounded-xl border border-(--border-color) bg-(--card-color) p-4'>
          <h2 className='text-xl font-semibold text-(--main-color)'>
            Example phrases (English to Japanese)
          </h2>
          <div className='mt-3 overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-(--border-color) text-(--main-color)'>
                  <th className='px-2 py-2'>English</th>
                  <th className='px-2 py-2'>Japanese</th>
                  <th className='px-2 py-2'>Romaji</th>
                </tr>
              </thead>
              <tbody className='text-(--secondary-color)'>
                {examples.map(row => (
                  <tr key={row[0]} className='border-b border-(--border-color)/60'>
                    <td className='px-2 py-2'>{row[0]}</td>
                    <td className='px-2 py-2'>{row[1]}</td>
                    <td className='px-2 py-2 italic'>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className='mt-8 rounded-xl border border-(--border-color) bg-(--card-color) p-4'>
          <h2 className='text-xl font-semibold text-(--main-color)'>
            Translation tips for better Japanese output
          </h2>
          <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-(--secondary-color)'>
            <li>Prefer short, direct English over long paragraphs with mixed ideas.</li>
            <li>Replace vague words like &quot;it&quot; or &quot;that&quot; with the actual noun when possible.</li>
            <li>Review the Japanese script, not just the romaji, before you copy the result.</li>
          </ul>
        </section>
        <div className='mt-8 flex flex-wrap gap-3'>
          <Link href='/translate' className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color)'>
            Open translator hub
          </Link>
          <Link href='/translate/japanese-to-english' className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color)'>
            Japanese to English
          </Link>
          <Link href='/translate/romaji' className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color)'>
            Romaji guide
          </Link>
        </div>
      </main>
    </>
  );
}
