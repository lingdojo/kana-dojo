import Link from 'next/link';
import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';
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

  const title = 'JLPT N3 Vocabulary Guide - Intermediate Japanese | KanaDojo';
  const description =
    'Complete JLPT N3 vocabulary and kanji guide for intermediate Japanese learners. Free interactive practice with ~370 kanji and 3,000+ vocabulary words. Master N3 efficiently!';
  const canonical = `https://kanadojo.com/${locale}/jlpt/n3`;

  return {
    title,
    description,
    keywords:
      'jlpt n3, jlpt n3 vocabulary, jlpt n3 kanji, n3 study guide, intermediate japanese, jlpt n3 preparation, n3 exam, japanese n3 words',
    alternates: {
      canonical,
      languages: {
        en: 'https://kanadojo.com/en/jlpt/n3',
        es: 'https://kanadojo.com/es/jlpt/n3',
        ja: 'https://kanadojo.com/ja/jlpt/n3',
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

export default async function JLPTN3Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://kanadojo.com/${locale}` },
          { name: 'JLPT', url: `https://kanadojo.com/${locale}/jlpt/n3` },
          { name: 'N3', url: `https://kanadojo.com/${locale}/jlpt/n3` },
        ]}
      />
      <div className='mx-auto max-w-4xl px-4 py-8'>
        <h1 className='mb-4 text-center text-4xl font-bold text-[var(--main-color)]'>
          JLPT N3 Vocabulary Guide
        </h1>
        <p className='mb-8 text-center text-xl text-[var(--secondary-color)]'>
          Master intermediate Japanese vocabulary and kanji for N3 success
        </p>

        <div className='space-y-8 text-[var(--secondary-color)]'>
          {/* Overview */}
          <section className='rounded-lg border-2 border-[var(--border-color)] bg-[var(--card-color)] p-6'>
            <h2 className='mb-4 text-2xl font-semibold text-[var(--main-color)]'>
              JLPT N3 Level Overview
            </h2>
            <p className='mb-4'>
              JLPT N3 is the intermediate level, bridging elementary and
              advanced Japanese. It tests your ability to understand Japanese
              used in everyday situations to a certain degree.
            </p>
            <div className='grid gap-4 md:grid-cols-3'>
              <div>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Kanji
                </h3>
                <p className='text-2xl font-bold text-[var(--main-color)]'>
                  ~370 new
                </p>
                <p className='text-sm'>(~620 total including N5+N4)</p>
              </div>
              <div>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Vocabulary
                </h3>
                <p className='text-2xl font-bold text-[var(--main-color)]'>
                  ~3,000
                </p>
                <p className='text-sm'>Total words needed</p>
              </div>
              <div>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Study Time
                </h3>
                <p className='text-2xl font-bold text-[var(--main-color)]'>
                  450-600h
                </p>
                <p className='text-sm'>From beginner level</p>
              </div>
            </div>
          </section>

          {/* Vocabulary Topics */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-[var(--main-color)]'>
              N3 Vocabulary Categories
            </h2>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 text-lg font-semibold text-[var(--main-color)]'>
                  📰 News & Current Events
                </h3>
                <p className='text-sm'>
                  Politics, economy, society, environment, technology
                </p>
              </div>
              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 text-lg font-semibold text-[var(--main-color)]'>
                  🎓 Academic Topics
                </h3>
                <p className='text-sm'>
                  Sciences, history, culture, abstract concepts
                </p>
              </div>
              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 text-lg font-semibold text-[var(--main-color)]'>
                  💼 Professional Context
                </h3>
                <p className='text-sm'>
                  Business terminology, workplace situations, formal language
                </p>
              </div>
              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 text-lg font-semibold text-[var(--main-color)]'>
                  🎨 Culture & Arts
                </h3>
                <p className='text-sm'>
                  Literature, music, traditional culture, entertainment
                </p>
              </div>
              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 text-lg font-semibold text-[var(--main-color)]'>
                  🗣️ Advanced Expressions
                </h3>
                <p className='text-sm'>
                  Idioms, proverbs, nuanced expressions, formal speech
                </p>
              </div>
              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 text-lg font-semibold text-[var(--main-color)]'>
                  🌐 International Topics
                </h3>
                <p className='text-sm'>
                  Global issues, cross-cultural communication, world affairs
                </p>
              </div>
            </div>
          </section>

          {/* Study Approach */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-[var(--main-color)]'>
              N3 Study Approach
            </h2>
            <div className='space-y-4'>
              <div className='rounded-lg bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  🎯 Focus on Compound Words
                </h3>
                <p>
                  Many N3 vocabulary words are compounds of N4/N5 kanji.
                  Learning patterns makes acquisition faster.
                </p>
                <p className='mt-2 text-sm italic'>
                  Example: 生活 (seikatsu - daily life) = 生 (life) + 活
                  (activity)
                </p>
              </div>

              <div className='rounded-lg bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  📖 Read Native Materials
                </h3>
                <p>
                  At N3 level, start reading manga, simple news articles, and
                  light novels to encounter vocabulary in context.
                </p>
              </div>

              <div className='rounded-lg bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  🔊 Context is King
                </h3>
                <p>
                  Don&apos;t just memorize word lists. Learn vocabulary through
                  sentences and real usage examples.
                </p>
              </div>

              <div className='rounded-lg bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  ⚡ Use Spaced Repetition
                </h3>
                <p>
                  With 3,000 words to learn, spaced repetition is essential.
                  KanaDojo&apos;s training modes help reinforce memory.
                </p>
              </div>
            </div>
          </section>

          {/* Challenge Areas */}
          <section className='rounded-lg border-2 border-[var(--main-color)] bg-[var(--card-color)] p-6'>
            <h2 className='mb-4 text-2xl font-semibold text-[var(--main-color)]'>
              ⚠️ N3 Challenge Areas
            </h2>
            <div className='space-y-3'>
              <div>
                <h4 className='mb-1 font-semibold text-[var(--main-color)]'>
                  Similar Meanings
                </h4>
                <p className='text-sm'>
                  Many words have subtle differences (見る vs 観る vs 診る vs
                  看る). Context determines usage.
                </p>
              </div>
              <div>
                <h4 className='mb-1 font-semibold text-[var(--main-color)]'>
                  Formal vs Casual
                </h4>
                <p className='text-sm'>
                  N3 introduces more formal vocabulary. Understanding register
                  is crucial.
                </p>
              </div>
              <div>
                <h4 className='mb-1 font-semibold text-[var(--main-color)]'>
                  Complex Kanji Compounds
                </h4>
                <p className='text-sm'>
                  Longer words with multiple kanji require systematic study of
                  component meanings.
                </p>
              </div>
            </div>
          </section>

          {/* Practice Tools */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-[var(--main-color)]'>
              Practice with KanaDojo
            </h2>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Vocabulary Training
                </h3>
                <ul className='mb-3 list-disc space-y-1 pl-6 text-sm'>
                  <li>All N3 vocabulary organized and ready</li>
                  <li>Multiple practice modes</li>
                  <li>Track mastery per word</li>
                  <li>Spaced repetition built-in</li>
                </ul>
                <Link
                  href={`/${locale}/vocabulary`}
                  className='inline-block rounded bg-[var(--main-color)] px-4 py-2 text-sm font-semibold text-[var(--background-color)] transition-all hover:opacity-90'
                >
                  Practice Vocabulary →
                </Link>
              </div>

              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Kanji Review
                </h3>
                <ul className='mb-3 list-disc space-y-1 pl-6 text-sm'>
                  <li>Review N5+N4 kanji</li>
                  <li>Learn 370 new N3 kanji</li>
                  <li>Multiple reading practice</li>
                  <li>Compound word patterns</li>
                </ul>
                <Link
                  href={`/${locale}/kanji`}
                  className='inline-block rounded bg-[var(--main-color)] px-4 py-2 text-sm font-semibold text-[var(--background-color)] transition-all hover:opacity-90'
                >
                  Practice Kanji →
                </Link>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className='rounded-lg bg-[var(--main-color)] p-8 text-center text-[var(--background-color)]'>
            <h2 className='mb-4 text-3xl font-bold'>
              Start Your N3 Journey Today
            </h2>
            <p className='mb-6 text-lg'>
              Build intermediate Japanese proficiency with systematic vocabulary
              and kanji practice!
            </p>
            <Link
              href={`/${locale}/vocabulary`}
              className='inline-block rounded-lg border-2 border-[var(--background-color)] bg-[var(--background-color)] px-8 py-4 text-lg font-semibold text-[var(--main-color)] transition-all hover:opacity-90'
            >
              Practice N3 Vocabulary Now →
            </Link>

            <div className='mt-6 space-x-4'>
              <Link
                href={`/${locale}/jlpt/n4`}
                className='text-sm underline hover:opacity-80'
              >
                ← Back to N4
              </Link>
              <Link
                href={`/${locale}/kanji`}
                className='text-sm underline hover:opacity-80'
              >
                View All Kanji →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
