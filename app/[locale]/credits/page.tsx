import type { Metadata } from 'next';
import Link from 'next/link';
import { routing } from '@/core/i18n/routing';
import { ExternalLink, Sparkle } from 'lucide-react';
import LegalLayout from '@/shared/components/layout/LegalLayout';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Credits & Data Sources | KanaDojo';
  const description =
    'KanaDojo uses trusted Japanese language data sources including JMdict, KANJIDIC, and open-source libraries to provide accurate learning tools.';

  return {
    title,
    description,
    keywords: [
      'japanese learning data sources',
      'jmdict',
      'kanjidic',
      'japanese dictionary',
      'open source japanese',
    ],
    alternates: {
      canonical: 'https://kanadojo.com/credits',
    },
    openGraph: {
      title,
      description,
      url: 'https://kanadojo.com/credits',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function CreditsPage() {
  const dataSources = [
    {
      name: 'JMdict',
      description:
        'Japanese-English dictionary database maintained by the Electronic Dictionary Research and Development Group. Powers our translation features.',
      url: 'https://www.edrdg.org/jmdict/j_jmdict.html',
      license: 'Creative Commons Attribution-ShareAlike 4.0',
    },
    {
      name: 'KANJIDIC',
      description:
        'Comprehensive kanji character database with readings, meanings, and metadata. Used in our kanji learning features.',
      url: 'http://www.edrdg.org/wiki/index.php/KANJIDIC_Project',
      license: 'Creative Commons Attribution-ShareAlike 4.0',
    },
    {
      name: 'Kuroshiro',
      description:
        'Japanese language utility library for converting between Japanese scripts and romaji. Enables our pronunciation support.',
      url: 'https://github.com/hexenq/kuroshiro',
      license: 'MIT License',
    },
    {
      name: 'SQL.js',
      description:
        'SQLite compiled to JavaScript via Emscripten. Powers our Anki deck converter for client-side database processing.',
      url: 'https://github.com/sql-js/sql.js',
      license: 'MIT License',
    },
    {
      name: 'JLPT Vocabulary Lists',
      description:
        'Curated vocabulary lists organized by JLPT levels (N5-N1) from community-maintained sources.',
      url: 'https://jlptstudy.net/',
      license: 'Public Domain / Community Maintained',
    },
    {
      name: 'Wanakana',
      description:
        'JavaScript library for detecting and transliterating Hiragana, Katakana, and Romaji. Used in our text input processing.',
      url: 'https://github.com/WaniKani/WanaKana',
      license: 'MIT License',
    },
  ];

  const technologies = [
    {
      name: 'Next.js',
      description: 'React framework for production-grade web applications',
      url: 'https://nextjs.org',
    },
    {
      name: 'TypeScript',
      description: 'Typed JavaScript for enhanced code quality',
      url: 'https://www.typescriptlang.org',
    },
    {
      name: 'Tailwind CSS',
      description: 'Utility-first CSS framework',
      url: 'https://tailwindcss.com',
    },
    {
      name: 'Zustand',
      description: 'State management for React applications',
      url: 'https://github.com/pmndrs/zustand',
    },
    {
      name: 'Vercel',
      description: 'Deployment and hosting platform',
      url: 'https://vercel.com',
    },
  ];

  return (
    <LegalLayout
      icon={<Sparkle className='size-6' />}
      title='Credits & Data Sources'
      lastUpdated='April 8, 2026'
    >
      <p className='mb-8 text-lg text-(--secondary-color)'>
        KanaDojo is built on trusted Japanese language data sources and
        open-source technologies. We&apos;re grateful to the maintainers and
        contributors who make these resources available.
      </p>

      <h2 className='mb-6 text-2xl font-semibold text-(--main-color)'>
        Japanese Language Data Sources
      </h2>
      <div className='mb-12 space-y-6'>
        {dataSources.map(source => (
          <div key={source.name}>
            <div className='mb-2 flex items-start justify-between'>
              <h3 className='text-xl font-semibold text-(--main-color)'>
                {source.name}
              </h3>
              <a
                href={source.url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-sm text-(--main-color) hover:underline'
                aria-label={`Visit ${source.name} website`}
              >
                Visit <ExternalLink className='h-4 w-4' />
              </a>
            </div>
            <p className='mb-3 text-(--secondary-color)'>
              {source.description}
            </p>
            <div className='text-sm text-(--secondary-color)/80'>
              <strong>License:</strong> {source.license}
            </div>
            <hr className='mt-6 border-(--border-color) opacity-50' />
          </div>
        ))}
      </div>

      <h2 className='mb-6 text-2xl font-semibold text-(--main-color)'>
        Technologies & Frameworks
      </h2>
      <div className='mb-12 space-y-4'>
        {technologies.map(tech => (
          <div key={tech.name}>
            <h3 className='mb-2 font-semibold text-(--main-color)'>
              {tech.name}
            </h3>
            <p className='mb-2 text-sm text-(--secondary-color)'>
              {tech.description}
            </p>
            <a
              href={tech.url}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 text-sm text-(--main-color) hover:underline'
            >
              Learn more <ExternalLink className='h-3 w-3' />
            </a>
            <hr className='mt-4 border-(--border-color) opacity-50' />
          </div>
        ))}
      </div>

      <h2 className='mb-4 text-2xl font-semibold text-(--main-color)'>
        Acknowledgments
      </h2>
      <div className='mb-12 space-y-4 text-(--secondary-color)'>
        <p>
          Special thanks to the{' '}
          <a
            href='https://www.edrdg.org/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-(--main-color) hover:underline'
          >
            Electronic Dictionary Research and Development Group
          </a>{' '}
          (EDRDG) led by Jim Breen, whose decades of work creating and
          maintaining Japanese language databases has enabled countless learning
          tools and applications.
        </p>
        <p>
          We also thank the broader open-source community for creating and
          maintaining the libraries and tools that power modern web
          applications. Without their contributions, projects like KanaDojo
          wouldn&apos;t be possible.
        </p>
      </div>

      <h2 className='mb-4 text-2xl font-semibold text-(--main-color)'>
        License & Attribution
      </h2>
      <div className='mb-12 space-y-4 text-(--secondary-color)'>
        <p>
          KanaDojo respects the licenses of all data sources and libraries used.
          Where required by license terms, we provide proper attribution:
        </p>
        <ul className='list-disc space-y-2 pl-6'>
          <li>
            JMdict and KANJIDIC data are used under the Creative Commons
            Attribution-ShareAlike 4.0 International License.
          </li>
          <li>
            All open-source libraries are used in accordance with their
            respective licenses (MIT, Apache 2.0, etc.).
          </li>
          <li>
            KanaDojo&apos;s original code and content are created by the
            development team and released under our own license terms.
          </li>
        </ul>
        <p className='mt-4'>
          If you have questions about our use of any data source or library,
          please contact us through our{' '}
          <Link href='/about' className='text-(--main-color) hover:underline'>
            About page
          </Link>
          .
        </p>
      </div>

      <div className='border-t border-(--border-color) pt-6'>
        <h2 className='mb-4 text-lg font-semibold text-(--main-color)'>
          Related Pages
        </h2>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/about'
            className='rounded-lg border border-(--border-color) px-4 py-2 font-medium text-(--main-color) transition-colors hover:bg-(--main-color) hover:text-white'
          >
            About KanaDojo
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
        </div>
      </div>
    </LegalLayout>
  );
}
