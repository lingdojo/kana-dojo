import { routing } from '@/core/i18n/routing';
import { Link } from '@/core/i18n/routing';
import { FileJson, Grid3x3 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'Japanese Learning Tools - Free Online Utilities | KanaDojo',
    description:
      'Free Japanese learning tools including Anki converter, kana charts, and more. Helpful utilities for Japanese language learners.',
    keywords:
      'japanese tools, japanese learning tools, anki converter, kana chart, japanese utilities, language learning tools',
  };
}

interface Tool {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tools: Tool[] = [
  {
    name: 'Anki Converter',
    description:
      'Convert Anki flashcard decks to JSON format. Supports APKG, TSV, SQLite, and COLPKG files. Free, fast, and completely private.',
    href: '/tools/anki-converter',
    icon: FileJson,
  },
  {
    name: 'Kana Chart',
    description:
      'Complete Hiragana and Katakana reference chart with romanization and pronunciation guide. Interactive and easy to use.',
    href: '/tools/kana-chart',
    icon: Grid3x3,
  },
];

export default async function ToolsPage({
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
          { name: 'Tools', url: `https://kanadojo.com/${locale}/tools` },
        ]}
      />
      <div className='mx-auto max-w-7xl px-4 py-8'>
        <h1 className='mb-4 text-center text-4xl font-bold text-(--main-color)'>
          Japanese Learning Tools
        </h1>
        <p className='mb-8 text-center text-lg text-(--secondary-color)'>
          Free utilities and tools to support your Japanese learning journey
        </p>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {tools.map((tool, index) => (
            <Link
              key={index}
              href={tool.href}
              className={cn(
                'group flex flex-col rounded-lg border-2 border-(--border-color) bg-(--card-color) p-6 transition-all hover:border-(--main-color) hover:shadow-lg',
              )}
            >
              <div className='mb-4 flex items-center gap-3'>
                <div className='rounded-lg bg-(--main-color)/10 p-3'>
                  <tool.icon className='size-6 text-(--main-color)' />
                </div>
                <h2 className='text-xl font-semibold text-(--main-color)'>
                  {tool.name}
                </h2>
              </div>
              <p className='text-(--secondary-color)'>{tool.description}</p>
            </Link>
          ))}
        </div>

        <div className='mt-12 space-y-6 text-(--secondary-color)'>
          <section>
            <h2 className='mb-3 text-2xl font-semibold text-(--main-color)'>
              About These Tools
            </h2>
            <p className='mb-4'>
              KanaDojo provides free, open-source tools to help Japanese
              learners study more effectively. All tools are designed with
              privacy in mind - your data stays on your device and is never sent
              to external servers.
            </p>
          </section>

          <section>
            <h2 className='mb-3 text-2xl font-semibold text-(--main-color)'>
              More Tools Coming Soon
            </h2>
            <p>
              We&apos;re constantly working on new tools to support Japanese
              learners. Have a suggestion? Let us know on our{' '}
              <a
                href='https://github.com/lingdojo/kana-dojo'
                target='_blank'
                rel='noopener noreferrer'
                className='text-(--main-color) underline hover:no-underline'
              >
                GitHub repository
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
