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

  const title =
    'JLPT N5 Study Guide - Complete Preparation Resource | KanaDojo';
  const description =
    'Complete JLPT N5 study guide with all essential Kanji, vocabulary, and study tips. Free interactive practice for JLPT N5 exam success. Start preparing today!';
  const canonical = `https://kanadojo.com/${locale}/jlpt/n5`;

  return {
    title,
    description,
    keywords:
      'jlpt n5, jlpt n5 study guide, jlpt n5 kanji, jlpt n5 vocabulary, jlpt n5 preparation, japanese proficiency test n5, jlpt beginner level, n5 exam prep',
    alternates: {
      canonical,
      languages: {
        en: 'https://kanadojo.com/en/jlpt/n5',
        es: 'https://kanadojo.com/es/jlpt/n5',
        ja: 'https://kanadojo.com/ja/jlpt/n5',
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

export default async function JLPTN5Page({
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
          { name: 'JLPT', url: `https://kanadojo.com/${locale}/jlpt/n5` },
          { name: 'N5', url: `https://kanadojo.com/${locale}/jlpt/n5` },
        ]}
      />
      <div className='mx-auto max-w-4xl px-4 py-8'>
        <h1 className='mb-4 text-center text-4xl font-bold text-[var(--main-color)]'>
          JLPT N5 Study Guide
        </h1>
        <p className='mb-8 text-center text-xl text-[var(--secondary-color)]'>
          Everything you need to pass the JLPT N5 exam
        </p>

        <div className='space-y-8 text-[var(--secondary-color)]'>
          {/* Overview */}
          <section className='rounded-lg border-2 border-[var(--border-color)] bg-[var(--card-color)] p-6'>
            <h2 className='mb-4 text-2xl font-semibold text-[var(--main-color)]'>
              What is JLPT N5?
            </h2>
            <p className='mb-4'>
              JLPT N5 is the beginner level of the Japanese Language Proficiency
              Test. It tests your ability to understand basic Japanese used in
              everyday situations.
            </p>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  What You Need to Know:
                </h3>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>~80 Kanji characters</li>
                  <li>~800 vocabulary words</li>
                  <li>Basic grammar patterns</li>
                  <li>All Hiragana and Katakana</li>
                </ul>
              </div>
              <div>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Study Time Needed:
                </h3>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>150-300 hours total</li>
                  <li>3-6 months with daily study</li>
                  <li>Faster if you know kana already</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Kanji Section */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-[var(--main-color)]'>
              JLPT N5 Kanji (~80 Characters)
            </h2>
            <p className='mb-4'>
              Master the fundamental 80 Kanji characters required for N5. These
              form the foundation for all future Japanese study.
            </p>
            <div className='rounded-lg border-2 border-[var(--border-color)] bg-[var(--card-color)] p-6'>
              <h3 className='mb-3 text-xl font-semibold text-[var(--main-color)]'>
                Essential Kanji Groups:
              </h3>
              <ul className='mb-4 space-y-2'>
                <li className='flex items-start gap-2'>
                  <span className='text-xl'>🔢</span>
                  <div>
                    <strong>Numbers & Time (23 kanji):</strong>{' '}
                    一二三四五六七八九十、日月火水木金土、年時分
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-xl'>👥</span>
                  <div>
                    <strong>People (8 kanji):</strong> 人男女子母父友先生
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-xl'>📍</span>
                  <div>
                    <strong>Directions (12 kanji):</strong>{' '}
                    上下中外左右前後東西南北
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-xl'>🏃</span>
                  <div>
                    <strong>Actions (10 kanji):</strong> 見聞食飲行来出入立休
                  </div>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-xl'>🏫</span>
                  <div>
                    <strong>School & Daily Life (27+ kanji):</strong>{' '}
                    学校本語文字、大小高安新古長白赤青円車駅店買物天気山
                  </div>
                </li>
              </ul>
              <Link
                href={`/${locale}/kanji`}
                className='inline-block rounded-lg bg-[var(--main-color)] px-6 py-3 font-semibold text-[var(--background-color)] transition-all hover:opacity-90'
              >
                Practice N5 Kanji Now →
              </Link>
            </div>

            <div className='mt-4'>
              <Link
                href={`/${locale}/academy/jlpt-n5-kanji-list`}
                className='text-[var(--main-color)] underline hover:opacity-80'
              >
                📖 Read Complete N5 Kanji Guide with All Characters →
              </Link>
            </div>
          </section>

          {/* Vocabulary Section */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-[var(--main-color)]'>
              JLPT N5 Vocabulary (~800 Words)
            </h2>
            <p className='mb-4'>
              Build a foundation of essential Japanese vocabulary for everyday
              conversations and basic reading.
            </p>
            <div className='rounded-lg border-2 border-[var(--border-color)] bg-[var(--card-color)] p-6'>
              <h3 className='mb-3 text-xl font-semibold text-[var(--main-color)]'>
                Key Vocabulary Categories:
              </h3>
              <div className='mb-4 grid gap-3 md:grid-cols-2'>
                <div>
                  <strong>Essential Topics:</strong>
                  <ul className='mt-1 ml-4 list-disc'>
                    <li>Greetings & introductions</li>
                    <li>Numbers & counting</li>
                    <li>Time & dates</li>
                    <li>Family members</li>
                    <li>Food & drinks</li>
                  </ul>
                </div>
                <div>
                  <strong>Common Areas:</strong>
                  <ul className='mt-1 ml-4 list-disc'>
                    <li>School & work</li>
                    <li>Directions & places</li>
                    <li>Weather & seasons</li>
                    <li>Colors & descriptions</li>
                    <li>Basic verbs & adjectives</li>
                  </ul>
                </div>
              </div>
              <Link
                href={`/${locale}/vocabulary`}
                className='inline-block rounded-lg bg-[var(--main-color)] px-6 py-3 font-semibold text-[var(--background-color)] transition-all hover:opacity-90'
              >
                Practice N5 Vocabulary Now →
              </Link>
            </div>
          </section>

          {/* Study Plan */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-[var(--main-color)]'>
              3-Month Study Plan
            </h2>
            <div className='space-y-4'>
              <div className='rounded-lg border-l-4 border-[var(--main-color)] bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Month 1: Foundation
                </h3>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>Master all Hiragana and Katakana</li>
                  <li>Learn first 20 N5 Kanji (numbers + basic)</li>
                  <li>Build 200-word vocabulary</li>
                  <li>Study basic particles (は、が、を、に、で)</li>
                </ul>
              </div>

              <div className='rounded-lg border-l-4 border-[var(--main-color)] bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Month 2: Building
                </h3>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>Learn remaining 60 N5 Kanji</li>
                  <li>Expand vocabulary to 500 words</li>
                  <li>Study verb conjugations (ます-form)</li>
                  <li>Practice simple sentence structures</li>
                </ul>
              </div>

              <div className='rounded-lg border-l-4 border-[var(--main-color)] bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Month 3: Mastery
                </h3>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>Complete all 800 vocabulary words</li>
                  <li>Review all Kanji with KanaDojo</li>
                  <li>Take practice tests</li>
                  <li>Focus on weak areas</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Exam Tips */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-[var(--main-color)]'>
              N5 Exam Tips
            </h2>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-lg bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  ✅ Do This:
                </h3>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>Practice daily with KanaDojo</li>
                  <li>Learn kanji in context, not isolation</li>
                  <li>Review vocabulary regularly</li>
                  <li>Take timed practice tests</li>
                  <li>Focus on particles and grammar</li>
                </ul>
              </div>

              <div className='rounded-lg bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  ❌ Avoid This:
                </h3>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>Cramming the night before</li>
                  <li>Neglecting kana mastery</li>
                  <li>Only studying with romaji</li>
                  <li>Skipping handwriting practice</li>
                  <li>Ignoring listening practice</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Start Now CTA */}
          <section className='rounded-lg bg-[var(--main-color)] p-8 text-center text-[var(--background-color)]'>
            <h2 className='mb-4 text-3xl font-bold'>
              Start Your N5 Preparation Today
            </h2>
            <p className='mb-6 text-lg'>
              Everything you need to pass JLPT N5 is available for free on
              KanaDojo!
            </p>
            <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Link
                href={`/${locale}/kana`}
                className='rounded-lg border-2 border-[var(--background-color)] bg-[var(--background-color)] px-6 py-3 font-semibold text-[var(--main-color)] transition-all hover:opacity-90'
              >
                Start with Kana
              </Link>
              <Link
                href={`/${locale}/kanji`}
                className='rounded-lg border-2 border-[var(--background-color)] px-6 py-3 font-semibold transition-all hover:bg-[var(--background-color)] hover:text-[var(--main-color)]'
              >
                Practice N5 Kanji
              </Link>
              <Link
                href={`/${locale}/vocabulary`}
                className='rounded-lg border-2 border-[var(--background-color)] px-6 py-3 font-semibold transition-all hover:bg-[var(--background-color)] hover:text-[var(--main-color)]'
              >
                Learn N5 Vocabulary
              </Link>
            </div>

            <div className='mt-6'>
              <Link
                href={`/${locale}/faq`}
                className='text-sm underline hover:opacity-80'
              >
                Have questions? Check our FAQ →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
