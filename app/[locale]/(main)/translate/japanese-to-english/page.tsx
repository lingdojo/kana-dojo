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
  pathname: '/translate/japanese-to-english',
  title: 'Japanese to English Translator | with Romaji Support | KanaDojo',
  description:
    'Translate Japanese to English online for free. Use this page to understand hiragana, katakana, kanji, subtitles, messages, and mixed Japanese text more clearly.',
  keywords: [
    'japanese to english translator',
    'translate japanese to english',
    'hiragana to english',
    'kanji to english translator',
    'japanese text translator online',
  ],
  schemaName: 'Japanese to English Translator',
  breadcrumbName: 'Japanese to English',
};

const faqItems: TranslatorFaqEntry[] = [
  {
    question: 'What is this page best for?',
    answer:
      'This page is best for understanding Japanese text, subtitles, notes, names, and mixed script input that includes hiragana, katakana, and kanji.',
  },
  {
    question: 'Can it handle mixed Japanese scripts?',
    answer:
      'Yes. It works with hiragana, katakana, kanji, and combinations of all three in one request.',
  },
  {
    question: 'What should I double-check after translating?',
    answer:
      'Double-check names, slang, honorifics, and context-heavy lines because machine translation can miss nuance.',
  },
];

export async function generateMetadata(_: PageProps): Promise<Metadata> {
  return buildTranslatorMetadata({
    ...metadataConfig,
    faq: faqItems,
  });
}

export default async function JapaneseToEnglishPage(_: PageProps) {
  const examples = [
    ['おはようございます', 'Good morning', 'Ohayo gozaimasu'],
    ['よろしくお願いします', 'Please treat me favorably', 'Yoroshiku onegaishimasu'],
    ['本日は晴天なり', 'Today is clear weather', 'Honjitsu wa seiten nari'],
    ['この漢字は難しい', 'This kanji is difficult', 'Kono kanji wa muzukashii'],
    ['電車が遅れています', 'The train is delayed', 'Densha ga okurete imasu'],
    ['明日の予定を教えてください', 'Please tell me tomorrow’s plan', 'Ashita no yotei o oshiete kudasai'],
    ['今何時ですか', 'What time is it now?', 'Ima nanji desu ka'],
    ['ここで写真を撮ってもいいですか', 'May I take a photo here?', 'Koko de shashin o totte mo ii desu ka'],
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
          Japanese → English
        </h1>
        <p className='mt-4 text-(--secondary-color)'>
          Use this page when your goal is to understand Japanese input. It is
          ideal for hiragana, katakana, kanji, subtitle checks, messages, short
          notes, and quick reading support when you want meaning first.
        </p>
        <ul className='mt-6 list-disc space-y-2 pl-5 text-(--secondary-color)'>
          <li>Useful for subtitles, study notes, names, and reading practice.</li>
          <li>Handles mixed Japanese scripts in one request.</li>
          <li>Best when you want comprehension support, not polished Japanese output.</li>
        </ul>
        <section className='mt-8 rounded-xl border border-(--border-color) bg-(--card-color) p-4'>
          <h2 className='text-xl font-semibold text-(--main-color)'>
            How to use this page well
          </h2>
          <div className='mt-3 space-y-3 text-sm text-(--secondary-color)'>
            <p>
              This route is built for interpretation. If you are reading
              Japanese and want to check the meaning quickly, paste the line
              here first before you decide whether you need a deeper dictionary
              or grammar breakdown.
            </p>
            <p>
              Translation quality drops when a line depends heavily on tone,
              omitted subjects, jokes, or cultural references, so treat tricky
              lines as a first-pass explanation rather than a final answer.
            </p>
          </div>
        </section>
        <section className='mt-8 rounded-xl border border-(--border-color) bg-(--card-color) p-4'>
          <h2 className='text-xl font-semibold text-(--main-color)'>
            Example phrases (Japanese to English)
          </h2>
          <div className='mt-3 overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-(--border-color) text-(--main-color)'>
                  <th className='px-2 py-2'>Japanese</th>
                  <th className='px-2 py-2'>English</th>
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
            Common limitations to keep in mind
          </h2>
          <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-(--secondary-color)'>
            <li>Names can have multiple valid readings and translations.</li>
            <li>Anime-style phrasing and slang often need extra context.</li>
            <li>Honorific nuance and omitted subjects may not translate cleanly.</li>
          </ul>
        </section>
        <div className='mt-8 flex flex-wrap gap-3'>
          <Link href='/translate' className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color)'>
            Open translator hub
          </Link>
          <Link href='/translate/english-to-japanese' className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color)'>
            English to Japanese
          </Link>
          <Link href='/translate/romaji' className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color)'>
            Romaji guide
          </Link>
        </div>
      </main>
    </>
  );
}
