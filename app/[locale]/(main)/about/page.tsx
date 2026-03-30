import type { Metadata } from 'next';
import Link from 'next/link';
import { routing } from '@/core/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = 'About KanaDojo | Japanese Learning Platform';
  const description =
    'Learn about KanaDojo - a free, modern Japanese learning platform focused on making Hiragana, Katakana, Kanji, and vocabulary training effective and engaging.';

  return {
    title,
    description,
    keywords: [
      'about kanadojo',
      'japanese learning platform',
      'learn japanese online',
      'japanese education',
      'language learning tools',
    ],
    alternates: {
      canonical: 'https://kanadojo.com/about',
    },
    openGraph: {
      title,
      description,
      url: 'https://kanadojo.com/about',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function AboutPage() {
  return (
    <main className='mx-auto max-w-4xl px-4 py-10'>
      <header className='mb-8'>
        <h1 className='mb-4 text-4xl font-bold text-(--main-color)'>
          About KanaDojo
        </h1>
        <p className='text-xl text-(--secondary-color)'>
          A modern, free platform for learning Japanese characters and
          vocabulary
        </p>
      </header>

      {/* Mission */}
      <section className='mb-12 rounded-xl border border-(--border-color) bg-(--card-color) p-8'>
        <h2 className='mb-4 text-2xl font-semibold text-(--main-color)'>
          Our Mission
        </h2>
        <p className='text-lg leading-relaxed text-(--secondary-color)'>
          KanaDojo was created to make learning Japanese writing systems and
          vocabulary accessible, effective, and free for everyone. We believe
          that mastering Hiragana, Katakana, and Kanji shouldn&apos;t be a
          frustrating experience, but an engaging journey supported by modern
          technology and proven learning techniques.
        </p>
      </section>

      {/* What We Offer */}
      <section className='mb-12'>
        <h2 className='mb-6 text-2xl font-semibold text-(--main-color)'>
          What We Offer
        </h2>
        <div className='grid gap-6 sm:grid-cols-2'>
          <article className='rounded-lg border border-(--border-color) bg-(--card-color) p-6'>
            <h3 className='mb-3 text-xl font-semibold text-(--main-color)'>
              🔤 Kana Training
            </h3>
            <p className='text-(--secondary-color)'>
              Interactive games and exercises for mastering Hiragana and
              Katakana through spaced repetition and active recall.
            </p>
          </article>

          <article className='rounded-lg border border-(--border-color) bg-(--card-color) p-6'>
            <h3 className='mb-3 text-xl font-semibold text-(--main-color)'>
              漢 Kanji Study
            </h3>
            <p className='text-(--secondary-color)'>
              Comprehensive kanji learning organized by JLPT levels with
              readings, meanings, and example words.
            </p>
          </article>

          <article className='rounded-lg border border-(--border-color) bg-(--card-color) p-6'>
            <h3 className='mb-3 text-xl font-semibold text-(--main-color)'>
              📚 Vocabulary Builder
            </h3>
            <p className='text-(--secondary-color)'>
              Thousands of Japanese words organized by JLPT level and difficulty
              with audio, examples, and practice modes.
            </p>
          </article>

          <article className='rounded-lg border border-(--border-color) bg-(--card-color) p-6'>
            <h3 className='mb-3 text-xl font-semibold text-(--main-color)'>
              🛠️ Learning Tools
            </h3>
            <p className='text-(--secondary-color)'>
              Japanese translator with romaji support, verb conjugator, kana
              chart, and Anki converter for flexible learning.
            </p>
          </article>
        </div>
      </section>

      {/* Our Approach */}
      <section className='mb-12'>
        <h2 className='mb-6 text-2xl font-semibold text-(--main-color)'>
          Our Approach
        </h2>
        <div className='space-y-4 rounded-lg border border-(--border-color) bg-(--card-color) p-6 text-(--secondary-color)'>
          <div>
            <h3 className='mb-2 font-semibold text-(--main-color)'>
              Evidence-Based Learning
            </h3>
            <p>
              We incorporate proven learning techniques like spaced repetition,
              active recall, and progressive difficulty to maximize retention
              and minimize study time.
            </p>
          </div>

          <div>
            <h3 className='mb-2 font-semibold text-(--main-color)'>
              Gamification & Engagement
            </h3>
            <p>
              Learning should be engaging, not boring. Our gamified approach
              with achievements, streaks, and progress tracking keeps you
              motivated.
            </p>
          </div>

          <div>
            <h3 className='mb-2 font-semibold text-(--main-color)'>
              Always Free
            </h3>
            <p>
              We believe quality Japanese learning resources should be
              accessible to everyone. All core features are free and always will
              be.
            </p>
          </div>

          <div>
            <h3 className='mb-2 font-semibold text-(--main-color)'>
              Modern Technology
            </h3>
            <p>
              Built with cutting-edge web technologies for fast performance,
              offline support, and cross-device synchronization via browser
              storage.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className='mb-12 rounded-xl border border-(--border-color) bg-(--card-color) p-6'>
        <h2 className='mb-4 text-2xl font-semibold text-(--main-color)'>
          Trusted Data Sources
        </h2>
        <p className='mb-4 text-(--secondary-color)'>
          KanaDojo is built on authoritative Japanese language data maintained
          by experts:
        </p>
        <ul className='list-disc space-y-2 pl-6 text-(--secondary-color)'>
          <li>
            <strong>JMdict</strong> - Japanese-English dictionary by the
            Electronic Dictionary Research and Development Group
          </li>
          <li>
            <strong>KANJIDIC</strong> - Comprehensive kanji character database
          </li>
          <li>
            <strong>JLPT Vocabulary Lists</strong> - Community-maintained lists
            organized by test level
          </li>
        </ul>
        <p className='mt-4'>
          <Link
            href='/credits'
            className='inline-flex items-center font-medium text-(--main-color) hover:underline'
          >
            View full credits and data sources →
          </Link>
        </p>
      </section>

      {/* Technology Stack */}
      <section className='mb-12'>
        <h2 className='mb-6 text-2xl font-semibold text-(--main-color)'>
          Built With Modern Technology
        </h2>
        <p className='mb-4 text-(--secondary-color)'>
          KanaDojo is built with production-grade web technologies to ensure
          fast performance, reliability, and a great user experience:
        </p>
        <div className='grid gap-3 sm:grid-cols-3'>
          <div className='rounded-lg border border-(--border-color) bg-(--card-color) p-4 text-center'>
            <div className='font-semibold text-(--main-color)'>Next.js 15</div>
            <div className='text-sm text-(--secondary-color)'>
              React Framework
            </div>
          </div>
          <div className='rounded-lg border border-(--border-color) bg-(--card-color) p-4 text-center'>
            <div className='font-semibold text-(--main-color)'>TypeScript</div>
            <div className='text-sm text-(--secondary-color)'>Type Safety</div>
          </div>
          <div className='rounded-lg border border-(--border-color) bg-(--card-color) p-4 text-center'>
            <div className='font-semibold text-(--main-color)'>
              Tailwind CSS
            </div>
            <div className='text-sm text-(--secondary-color)'>Styling</div>
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className='mb-12 rounded-xl border-2 border-(--main-color) bg-(--card-color) p-6'>
        <h2 className='mb-4 text-2xl font-semibold text-(--main-color)'>
          Open Source
        </h2>
        <p className='text-(--secondary-color)'>
          KanaDojo is open source and available on GitHub. We welcome
          contributions, feedback, and suggestions from the community.
        </p>
        <a
          href='https://github.com/lingdojo/kanadojo'
          target='_blank'
          rel='noopener noreferrer'
          className='mt-4 inline-flex items-center gap-2 rounded-lg bg-(--main-color) px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90'
        >
          View on GitHub →
        </a>
      </section>

      {/* Contact & Links */}
      <footer className='border-t border-(--border-color) pt-6'>
        <h2 className='mb-4 text-lg font-semibold text-(--main-color)'>
          Learn More
        </h2>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/credits'
            className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color) transition-colors hover:bg-(--main-color) hover:text-white'
          >
            Credits & Data Sources
          </Link>
          <Link
            href='/privacy'
            className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color) transition-colors hover:bg-(--main-color) hover:text-white'
          >
            Privacy Policy
          </Link>
          <Link
            href='/terms'
            className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color) transition-colors hover:bg-(--main-color) hover:text-white'
          >
            Terms of Service
          </Link>
          <Link
            href='/faq'
            className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color) transition-colors hover:bg-(--main-color) hover:text-white'
          >
            FAQ
          </Link>
        </div>
      </footer>
    </main>
  );
}
