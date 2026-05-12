'use client';

import Link from 'next/link';
import { cn } from '@/shared/utils/utils';

const steps = [
  'Paste English or Japanese text into the main translator.',
  'Translate once for a quick answer and confirm the language direction.',
  'Open the direction-specific page if you need examples or extra guidance.',
  'Use romaji for pronunciation support, not as a substitute for kana or kanji.',
  'Double-check names, slang, and important wording before reusing the result.',
];

const faqItems = [
  {
    q: 'What is the main translator page for?',
    a: 'The hub is best for quick two-way translation and for sending users to the exact page that matches their intent.',
  },
  {
    q: 'Should I use the hub or a child page?',
    a: 'Use the hub for general translation. Use the direction-specific page when your exact task is English to Japanese, Japanese to English, or romaji support.',
  },
  {
    q: 'Can machine translation handle names and slang perfectly?',
    a: 'Not always. Proper names, slang, honorifics, and context-heavy lines still need manual review.',
  },
  {
    q: 'Why is romaji included?',
    a: 'Romaji helps with pronunciation and quick reading support, especially for beginners who are still learning kana.',
  },
];

const exampleRows = [
  {
    useCase: 'Travel phrase',
    route: '/translate/english-to-japanese',
    bestPage: 'English to Japanese',
    example: 'Where is the station?',
  },
  {
    useCase: 'Subtitle meaning',
    route: '/translate/japanese-to-english',
    bestPage: 'Japanese to English',
    example: 'アニメの字幕を読みたい',
  },
  {
    useCase: 'Pronunciation support',
    route: '/translate/romaji',
    bestPage: 'Romaji guide',
    example: 'こんにちは -> konnichiwa',
  },
];

export default function SEOContent() {

  return (
    <section
      className={cn(
        'mt-6 flex flex-col gap-6 rounded-2xl border border-(--border-color) bg-(--card-color) p-4 shadow-lg shadow-black/5 sm:mt-8 sm:p-6',
      )}
      aria-label='Japanese translation guide and educational content'
    >
      <header>
        <h2 className='text-2xl font-bold text-(--main-color)'>
          How to use this Japanese translator
        </h2>
        <p className='mt-2 text-sm text-(--secondary-color)'>
          The hub works best when you want a fast answer first and a
          direction-specific page second. Use it as the front door for English
          to Japanese, Japanese to English, and romaji-focused workflows.
        </p>
      </header>

      <div className='rounded-xl border border-(--border-color) bg-(--background-color) p-4'>
        <h3 className='mb-2 text-lg font-semibold text-(--main-color)'>
          Quick start
        </h3>
        <p className='mb-3 text-sm text-(--secondary-color)'>
          Use the main translator for fast checks, then switch to the most
          relevant route for better examples and more focused guidance.
        </p>
        <ol className='space-y-2 text-sm text-(--secondary-color)'>
          {steps.map((step, index) => (
            <li key={step} className='flex gap-3'>
              <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-(--main-color)/10 text-xs font-bold text-(--main-color)'>
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className='mt-3 text-sm text-(--secondary-color)'>
          Pro tip: if the wording matters, compare more than one phrasing and
          confirm the script before copying the final line.
        </p>
      </div>

      <div className='rounded-xl border border-(--border-color) bg-(--background-color) p-4'>
        <h3 className='mb-2 text-lg font-semibold text-(--main-color)'>
          Choose the best translator route
        </h3>
        <div className='grid gap-3 md:grid-cols-3'>
          {exampleRows.map(row => (
            <Link
              key={row.bestPage}
              href={row.route}
              className='rounded-lg border border-(--border-color) p-3 text-sm text-(--secondary-color) hover:bg-(--card-color)'
            >
              <span className='block font-medium text-(--main-color)'>
                {row.bestPage}
              </span>
              <span className='mt-1 block'>{row.useCase}</span>
              <span className='mt-2 block text-xs'>{row.example}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className='rounded-xl border border-(--border-color) bg-(--background-color) p-4'>
        <h3 className='mb-3 text-lg font-semibold text-(--main-color)'>
          Common translation tasks
        </h3>
        <div className='space-y-3 text-sm text-(--secondary-color)'>
          <p>
            Use the hub when you are not sure which translation direction is the
            right one yet. It is the fastest way to test a phrase, compare the
            two directions, and then move into the more specific page.
          </p>
          <p>
            It is especially useful for short notes, names, travel questions,
            study prompts, subtitle checks, and quick pronunciation support.
          </p>
        </div>
      </div>

      <div className='rounded-xl border border-(--border-color) bg-(--background-color) p-4'>
        <h3 className='mb-3 text-lg font-semibold text-(--main-color)'>
          FAQ
        </h3>
        <div className='space-y-3'>
          {faqItems.map(item => (
            <div key={item.q}>
              <h4 className='font-medium text-(--main-color)'>{item.q}</h4>
              <p className='text-sm text-(--secondary-color)'>{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='rounded-xl border border-(--border-color) bg-(--background-color) p-4'>
        <h3 className='mb-2 text-lg font-semibold text-(--main-color)'>
          Accuracy and limitations
        </h3>
        <ul className='list-disc space-y-1 pl-5 text-sm text-(--secondary-color)'>
          <li>
            Machine translation may miss nuance in humor, slang, honorifics, and
            context-heavy writing.
          </li>
          <li>
            Names, dialects, and anime-style expressions can have multiple valid
            readings.
          </li>
          <li>
            For important content, compare alternatives and verify key terms with
            kana/kanji study tools.
          </li>
          <li>
            Best practice: split long paragraphs into shorter sentences for
            cleaner results.
          </li>
        </ul>
      </div>

      <div className='grid gap-3 sm:grid-cols-3'>
        <Link href='/kana' className='rounded-xl border border-(--border-color) p-4 text-sm text-(--secondary-color) hover:bg-(--background-color)'>
          <span className='block font-semibold text-(--main-color)'>Hiragana & Katakana practice</span>
          Build reading speed and recognition.
        </Link>
        <Link href='/kanji' className='rounded-xl border border-(--border-color) p-4 text-sm text-(--secondary-color) hover:bg-(--background-color)'>
          <span className='block font-semibold text-(--main-color)'>Kanji study by JLPT level</span>
          Verify translation context and meaning.
        </Link>
        <Link href='/academy/japanese-pronunciation-guide-beginners' className='rounded-xl border border-(--border-color) p-4 text-sm text-(--secondary-color) hover:bg-(--background-color)'>
          <span className='block font-semibold text-(--main-color)'>Pronunciation guide</span>
          Pair romaji with better speaking habits.
        </Link>
      </div>
    </section>
  );
}

