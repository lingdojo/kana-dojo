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

  const title = 'JLPT N4 Kanji List - Complete Study Resource | KanaDojo';
  const description =
    'Complete JLPT N4 Kanji list with all ~170 characters, meanings, and readings. Free interactive practice for JLPT N4 exam preparation. Master N4 Kanji efficiently!';
  const canonical = `https://kanadojo.com/${locale}/jlpt/n4`;

  return {
    title,
    description,
    keywords:
      'jlpt n4 kanji, jlpt n4 kanji list, jlpt n4 study guide, n4 kanji practice, jlpt n4 preparation, n4 exam, intermediate japanese kanji',
    alternates: {
      canonical,
      languages: {
        en: 'https://kanadojo.com/en/jlpt/n4',
        es: 'https://kanadojo.com/es/jlpt/n4',
        ja: 'https://kanadojo.com/ja/jlpt/n4',
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

export default async function JLPTN4Page({
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
          { name: 'JLPT', url: `https://kanadojo.com/${locale}/jlpt/n4` },
          { name: 'N4', url: `https://kanadojo.com/${locale}/jlpt/n4` },
        ]}
      />
      <div className='mx-auto max-w-4xl px-4 py-8'>
        <h1 className='mb-4 text-center text-4xl font-bold text-[var(--main-color)]'>
          JLPT N4 Kanji List
        </h1>
        <p className='mb-8 text-center text-xl text-[var(--secondary-color)]'>
          Master ~170 intermediate Kanji for JLPT N4 success
        </p>

        <div className='space-y-8 text-[var(--secondary-color)]'>
          {/* Overview */}
          <section className='rounded-lg border-2 border-[var(--border-color)] bg-[var(--card-color)] p-6'>
            <h2 className='mb-4 text-2xl font-semibold text-[var(--main-color)]'>
              JLPT N4 Requirements
            </h2>
            <p className='mb-4'>
              JLPT N4 is the elementary level, testing your ability to
              understand basic Japanese in everyday situations.
            </p>
            <div className='grid gap-4 md:grid-cols-3'>
              <div>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Kanji
                </h3>
                <p className='text-2xl font-bold text-[var(--main-color)]'>
                  ~170 new
                </p>
                <p className='text-sm'>(Plus all N5 kanji)</p>
              </div>
              <div>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Vocabulary
                </h3>
                <p className='text-2xl font-bold text-[var(--main-color)]'>
                  ~1,500
                </p>
                <p className='text-sm'>Total words needed</p>
              </div>
              <div>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Study Time
                </h3>
                <p className='text-2xl font-bold text-[var(--main-color)]'>
                  300-400h
                </p>
                <p className='text-sm'>From beginner level</p>
              </div>
            </div>
          </section>

          {/* Key Kanji Topics */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-[var(--main-color)]'>
              N4 Kanji Topics
            </h2>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 text-lg font-semibold text-[var(--main-color)]'>
                  🏠 Daily Life
                </h3>
                <p className='text-sm'>
                  Family, housing, shopping, transportation, common activities
                </p>
              </div>
              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 text-lg font-semibold text-[var(--main-color)]'>
                  📚 Education & Work
                </h3>
                <p className='text-sm'>
                  School subjects, workplace, job-related terms
                </p>
              </div>
              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 text-lg font-semibold text-[var(--main-color)]'>
                  🌏 Nature & Places
                </h3>
                <p className='text-sm'>
                  Geography, nature, weather, locations, countries
                </p>
              </div>
              <div className='rounded-lg border-2 border-[var(--border-color)] p-4'>
                <h3 className='mb-2 text-lg font-semibold text-[var(--main-color)]'>
                  💬 Communication
                </h3>
                <p className='text-sm'>
                  Expressions, emotions, opinions, social interactions
                </p>
              </div>
            </div>
          </section>

          {/* Study Strategy */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-[var(--main-color)]'>
              Effective Study Strategy
            </h2>
            <div className='space-y-4'>
              <div className='rounded-lg bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  1️⃣ Build on N5 Foundation
                </h3>
                <p>
                  Ensure you&apos;ve mastered all N5 kanji first. N4 kanji build
                  on N5 knowledge.
                </p>
              </div>

              <div className='rounded-lg bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  2️⃣ Learn in Context
                </h3>
                <p>
                  Study kanji within vocabulary words. Use example sentences to
                  see how they&apos;re used.
                </p>
              </div>

              <div className='rounded-lg bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  3️⃣ Practice Multiple Readings
                </h3>
                <p>
                  N4 kanji often have multiple readings. Learn both on&apos;yomi
                  and kun&apos;yomi systematically.
                </p>
              </div>

              <div className='rounded-lg bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  4️⃣ Use KanaDojo&apos;s Training Modes
                </h3>
                <p>
                  Vary your practice with Pick, Input, and Blitz modes for
                  better retention.
                </p>
              </div>
            </div>
          </section>

          {/* Progress Tracking */}
          <section className='rounded-lg border-2 border-[var(--main-color)] bg-[var(--card-color)] p-6'>
            <h2 className='mb-4 text-2xl font-semibold text-[var(--main-color)]'>
              📊 Track Your N4 Progress
            </h2>
            <p className='mb-4'>
              KanaDojo automatically tracks your progress through N4 kanji:
            </p>
            <ul className='mb-4 list-disc space-y-2 pl-6'>
              <li>
                See which kanji you&apos;ve mastered vs need more practice
              </li>
              <li>Identify your weak areas with detailed analytics</li>
              <li>Monitor speed and accuracy improvements over time</li>
              <li>Set goals and track study streaks</li>
            </ul>
            <Link
              href={`/${locale}/progress`}
              className='inline-block rounded-lg bg-[var(--main-color)] px-6 py-3 font-semibold text-[var(--background-color)] transition-all hover:opacity-90'
            >
              View Your Progress →
            </Link>
          </section>

          {/* Start Practicing CTA */}
          <section className='rounded-lg bg-[var(--main-color)] p-8 text-center text-[var(--background-color)]'>
            <h2 className='mb-4 text-3xl font-bold'>
              Start Practicing N4 Kanji Today
            </h2>
            <p className='mb-6 text-lg'>
              All 170 N4 Kanji characters available for free practice with
              multiple training modes!
            </p>
            <Link
              href={`/${locale}/kanji`}
              className='inline-block rounded-lg border-2 border-[var(--background-color)] bg-[var(--background-color)] px-8 py-4 text-lg font-semibold text-[var(--main-color)] transition-all hover:opacity-90'
            >
              Practice N4 Kanji Now →
            </Link>

            <div className='mt-6 space-x-4'>
              <Link
                href={`/${locale}/jlpt/n5`}
                className='text-sm underline hover:opacity-80'
              >
                ← Back to N5
              </Link>
              <Link
                href={`/${locale}/jlpt/n3`}
                className='text-sm underline hover:opacity-80'
              >
                Continue to N3 →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
