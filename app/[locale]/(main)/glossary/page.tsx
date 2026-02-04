import Link from 'next/link';
import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title =
    'Japanese-English Glossary - Essential Learning Terms | KanaDojo';
  const description =
    'Comprehensive Japanese-English glossary of essential learning terms. Understand Hiragana, Katakana, Kanji, grammar, and Japanese language concepts with clear explanations.';
  const canonical = `https://kanadojo.com/${locale}/glossary`;

  return {
    title,
    description,
    keywords:
      'japanese glossary, japanese terms, hiragana definition, katakana definition, kanji meaning, japanese grammar terms, japanese language glossary, learn japanese vocabulary',
    alternates: {
      canonical,
      languages: {
        en: 'https://kanadojo.com/en/glossary',
        es: 'https://kanadojo.com/es/glossary',
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
  };
}

interface GlossaryTerm {
  term: string;
  reading?: string;
  definition: string;
  example?: string;
  relatedTerms?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Hiragana',
    reading: 'ひらがな',
    definition:
      'The first Japanese writing system, consisting of 46 basic phonetic characters representing syllables. Used for native Japanese words, grammatical elements, and when kanji is too difficult.',
    example: 'あ (a), い (i), う (u), え (e), お (o)',
    relatedTerms: ['Katakana', 'Kana', 'Romaji'],
  },
  {
    term: 'Katakana',
    reading: 'カタカナ',
    definition:
      'The second Japanese writing system, with 46 basic characters representing the same sounds as Hiragana. Primarily used for foreign words, names, technical terms, and emphasis.',
    example: 'ア (a), イ (i), ウ (u), エ (e), オ (o)',
    relatedTerms: ['Hiragana', 'Kana', 'Gairaigo'],
  },
  {
    term: 'Kanji',
    reading: '漢字',
    definition:
      'Chinese characters adopted into Japanese writing. Each character typically represents a concept or word and can have multiple readings (pronunciations).',
    example: '日 (sun/day), 本 (book/origin), 語 (language)',
    relatedTerms: ['Onyomi', 'Kunyomi', 'Jouyou Kanji'],
  },
  {
    term: 'Kana',
    reading: 'かな / カナ',
    definition:
      'Collective term for both Hiragana and Katakana, the two phonetic writing systems in Japanese.',
    relatedTerms: ['Hiragana', 'Katakana'],
  },
  {
    term: 'Romaji',
    reading: 'ローマ字',
    definition:
      'The romanization of Japanese, using Latin alphabet letters to represent Japanese sounds. Helpful for beginners but not used in native Japanese writing.',
    example: 'Konnichiwa (こんにちは)',
    relatedTerms: ['Hiragana', 'Katakana'],
  },
  {
    term: 'Onyomi',
    reading: 'おんよみ / 音読み',
    definition:
      'The Chinese-derived reading of a Kanji character. Usually used when kanji appear in compound words. Often written in Katakana in dictionaries.',
    example: '日 → ニチ (nichi) in 日本 (Nihon, Japan)',
    relatedTerms: ['Kunyomi', 'Kanji'],
  },
  {
    term: 'Kunyomi',
    reading: 'くんよみ / 訓読み',
    definition:
      'The native Japanese reading of a Kanji character. Usually used when kanji stand alone or with okurigana. Often written in Hiragana in dictionaries.',
    example: '日 → ひ (hi) in 日 (hi, day/sun)',
    relatedTerms: ['Onyomi', 'Kanji', 'Okurigana'],
  },
  {
    term: 'Okurigana',
    reading: 'おくりがな / 送り仮名',
    definition:
      'Hiragana characters that follow kanji to show grammatical function, verb conjugation, or adjective forms.',
    example: '食べる (taberu) - 食 is kanji, べる is okurigana',
    relatedTerms: ['Hiragana', 'Kanji'],
  },
  {
    term: 'Dakuten',
    reading: 'だくてん / 濁点',
    definition:
      'Two small marks (゛) added to certain kana to change their pronunciation, creating voiced consonants.',
    example: 'か (ka) → が (ga), は (ha) → ば (ba)',
    relatedTerms: ['Handakuten', 'Kana'],
  },
  {
    term: 'Handakuten',
    reading: 'はんだくてん / 半濁点',
    definition:
      'A small circle (゜) added to kana to change pronunciation. Only used with the は (ha) row.',
    example: 'は (ha) → ぱ (pa), ひ (hi) → ぴ (pi)',
    relatedTerms: ['Dakuten', 'Kana'],
  },
  {
    term: 'JLPT',
    reading: 'Japanese Language Proficiency Test',
    definition:
      'The Japanese Language Proficiency Test, an internationally recognized certification of Japanese language ability. Levels range from N5 (beginner) to N1 (advanced).',
    relatedTerms: ['N5', 'N4', 'N3', 'N2', 'N1'],
  },
  {
    term: 'Jouyou Kanji',
    reading: 'じょうようかんじ / 常用漢字',
    definition:
      'The official list of 2,136 kanji designated for daily use by the Japanese Ministry of Education. Required for basic literacy in Japan.',
    relatedTerms: ['Kanji', 'Kyouiku Kanji'],
  },
  {
    term: 'Kyouiku Kanji',
    reading: 'きょういくかんじ / 教育漢字',
    definition:
      'The 1,026 educational kanji taught in Japanese elementary schools (grades 1-6). A subset of Jouyou Kanji.',
    relatedTerms: ['Jouyou Kanji', 'Kanji'],
  },
  {
    term: 'Furigana',
    reading: 'ふりがな / 振り仮名',
    definition:
      "Small hiragana characters written above or beside kanji to show pronunciation. Commonly used in children's books and learning materials.",
    example: '日本 (にほん)',
    relatedTerms: ['Hiragana', 'Kanji'],
  },
  {
    term: 'Gairaigo',
    reading: 'がいらいご / 外来語',
    definition:
      'Loanwords from foreign languages, typically written in Katakana. Most commonly from English, but also Portuguese, Dutch, German, and French.',
    example: 'コンピューター (konpyuutaa, computer)',
    relatedTerms: ['Katakana'],
  },
  {
    term: 'Particle',
    reading: 'じょし / 助詞',
    definition:
      'Small grammatical words (usually one or two characters) that indicate the relationship between words in a sentence. Essential for Japanese grammar.',
    example: 'は (wa), が (ga), を (wo), に (ni), で (de)',
    relatedTerms: ['Grammar'],
  },
  {
    term: 'Stroke Order',
    reading: 'かきじゅん / 書き順',
    definition:
      'The correct sequence for writing each stroke of a kanji or kana character. Following proper stroke order improves handwriting and character recognition.',
    relatedTerms: ['Kanji', 'Kana'],
  },
  {
    term: 'Radical',
    reading: 'ぶしゅ / 部首',
    definition:
      'A component of a kanji character that often indicates meaning or categorization. There are 214 traditional radicals.',
    example: '氵(water radical) in 海 (sea), 河 (river)',
    relatedTerms: ['Kanji'],
  },
  {
    term: 'Compound Word',
    reading: 'じゅくご / 熟語',
    definition:
      'A word formed by combining two or more kanji characters. Most Japanese vocabulary consists of compound words.',
    example: '学校 (gakkou, school) = 学 (learn) + 校 (school)',
    relatedTerms: ['Kanji'],
  },
  {
    term: 'Honorific',
    reading: 'けいご / 敬語',
    definition:
      'Polite or respectful language used to show respect based on social hierarchy, age, or formality. Essential in Japanese communication.',
    example: 'です/ます form, お/ご prefix, さん/様 suffixes',
    relatedTerms: ['Grammar'],
  },
];

export default async function GlossaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Group terms alphabetically
  const groupedTerms = glossaryTerms.reduce(
    (acc, term) => {
      const firstLetter = term.term[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(term);
      return acc;
    },
    {} as Record<string, GlossaryTerm[]>,
  );

  const letters = Object.keys(groupedTerms).sort();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://kanadojo.com/${locale}` },
          { name: 'Glossary', url: `https://kanadojo.com/${locale}/glossary` },
        ]}
      />

      <div className='mx-auto max-w-6xl px-4 py-8'>
        <Breadcrumbs
          items={[
            { name: 'Home', url: `/${locale}` },
            { name: 'Glossary', url: `/${locale}/glossary` },
          ]}
        />

        <header className='mb-8 text-center'>
          <h1 className='mb-4 text-4xl font-bold text-(--main-color)'>
            Japanese-English Glossary
          </h1>
          <p className='text-lg text-(--secondary-color)'>
            Essential terms and concepts for learning Japanese
          </p>
        </header>

        {/* Quick Navigation */}
        <nav
          className='mb-8 rounded-lg border-2 border-(--border-color) bg-(--card-color) p-4'
          aria-label='Glossary quick navigation'
        >
          <div className='mb-2 font-semibold text-(--main-color)'>
            Jump to:
          </div>
          <div className='flex flex-wrap gap-2'>
            {letters.map(letter => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className='rounded bg-(--main-color) px-3 py-1 text-sm font-semibold text-(--background-color) transition-all hover:opacity-80'
              >
                {letter}
              </a>
            ))}
          </div>
        </nav>

        {/* Glossary Terms */}
        <main className='space-y-8'>
          {letters.map(letter => (
            <section
              key={letter}
              id={`letter-${letter}`}
              className='scroll-mt-4'
            >
              <h2 className='mb-4 border-b-2 border-(--border-color) pb-2 text-3xl font-bold text-(--main-color)'>
                {letter}
              </h2>
              <div className='space-y-4'>
                {groupedTerms[letter].map(term => (
                  <article
                    key={term.term}
                    className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-6'
                  >
                    <header className='mb-2'>
                      <h3 className='inline text-2xl font-bold text-(--main-color)'>
                        {term.term}
                      </h3>
                      {term.reading && (
                        <span className='ml-3 text-xl text-(--secondary-color)'>
                          {term.reading}
                        </span>
                      )}
                    </header>

                    <p className='mb-3 text-(--secondary-color)'>
                      {term.definition}
                    </p>

                    {term.example && (
                      <div className='mb-3 rounded bg-(--background-color) p-3'>
                        <strong className='text-(--main-color)'>
                          Example:
                        </strong>{' '}
                        <span className='text-(--secondary-color)'>
                          {term.example}
                        </span>
                      </div>
                    )}

                    {term.relatedTerms && term.relatedTerms.length > 0 && (
                      <div className='text-sm'>
                        <strong className='text-(--main-color)'>
                          Related:
                        </strong>{' '}
                        <span className='text-(--secondary-color)'>
                          {term.relatedTerms.join(', ')}
                        </span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </main>

        {/* Related Resources */}
        <aside className='mt-12 rounded-lg border-2 border-(--main-color) bg-(--card-color) p-6'>
          <h2 className='mb-4 text-2xl font-semibold text-(--main-color)'>
            Continue Learning
          </h2>
          <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-3'>
            <Link
              href={`/${locale}/kana/train`}
              className='rounded-lg border-2 border-(--border-color) px-4 py-3 font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
            >
              Practice Kana →
            </Link>
            <Link
              href={`/${locale}/kanji/train`}
              className='rounded-lg border-2 border-(--border-color) px-4 py-3 font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
            >
              Practice Kanji →
            </Link>
            <Link
              href={`/${locale}/vocabulary/train`}
              className='rounded-lg border-2 border-(--border-color) px-4 py-3 font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
            >
              Practice Vocabulary →
            </Link>
            <Link
              href={`/${locale}/academy`}
              className='rounded-lg border-2 border-(--border-color) px-4 py-3 font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
            >
              Visit Academy →
            </Link>
            <Link
              href={`/${locale}/faq`}
              className='rounded-lg border-2 border-(--border-color) px-4 py-3 font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
            >
              View FAQ →
            </Link>
            <Link
              href={`/${locale}/jlpt/n5`}
              className='rounded-lg border-2 border-(--border-color) px-4 py-3 font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
            >
              JLPT Guide →
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
