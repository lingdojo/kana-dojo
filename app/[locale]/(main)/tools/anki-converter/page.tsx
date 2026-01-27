import { ConverterInterface } from '@/features/AnkiConverter/components/ConverterInterface';
import { routing } from '@/core/i18n/routing';
import { FAQSchema, type FAQItem } from '@/shared/components/SEO/FAQSchema';
import {
  HowToSchema,
  type HowToStep,
} from '@/shared/components/SEO/HowToSchema';
import Script from 'next/script';
import type { Metadata } from 'next';
import Link from 'next/link';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

const BASE_URL = 'https://kanadojo.com';

export async function generateMetadata(): Promise<Metadata> {
  const title =
    'Free Anki Deck to JSON Converter | Convert APKG, TSV, SQLite Files Online';
  const description =
    'Convert Anki flashcard decks to JSON format instantly. Supports APKG, TSV, SQLite, and COLPKG files. Free, fast, and completely private - all processing happens in your browser.';

  return {
    title,
    description,
    keywords: [
      'anki converter',
      'anki to json',
      'convert anki deck',
      'apkg to json',
      'anki deck converter',
      'anki export json',
      'anki flashcards json',
      'convert apkg file',
      'anki database converter',
      'free anki converter online',
      'anki apkg to json converter',
      'export anki cards to json',
      'anki tsv converter',
      'anki sqlite converter',
      'colpkg to json',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}/en/tools/anki-converter`,
      siteName: 'KanaDojo',
      locale: 'en_US',
      images: [
        {
          url: `${BASE_URL}/api/og?title=${encodeURIComponent('Anki Deck to JSON Converter')}&description=${encodeURIComponent('Free, private, browser-based conversion')}`,
          width: 1200,
          height: 630,
          alt: 'Anki Deck to JSON Converter - KanaDojo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/en/tools/anki-converter`,
      languages: {
        en: `${BASE_URL}/en/tools/anki-converter`,
        es: `${BASE_URL}/es/tools/anki-converter`,
        ja: `${BASE_URL}/ja/tools/anki-converter`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// FAQ data for the page
const faqItems: FAQItem[] = [
  {
    question: 'Is my data safe when using the Anki Converter?',
    answer:
      'Yes! All conversion happens locally in your browser using Web Workers. Your files never leave your device, and no data is sent to any server. This ensures complete privacy and security for your flashcard content.',
  },
  {
    question: 'What happens to images and audio in my Anki deck?',
    answer:
      'Media files (images, audio, video) are not included in the JSON output. The converter extracts only text content, removing all media references while preserving the surrounding text. This keeps the output clean and focused on the textual data.',
  },
  {
    question: 'Can I convert large Anki decks?',
    answer:
      'Yes! The converter can handle decks with thousands of cards. For very large decks (100,000+ cards), we recommend using the command-line tool for better performance. The browser version supports files up to 500MB.',
  },
  {
    question: 'What JSON structure is produced?',
    answer:
      'The output is intelligently structured based on your deck type. Basic cards have front/back fields, cloze cards include all cloze variations, and custom note types preserve all field names and values. The JSON also includes metadata like card counts, tags, and deck hierarchy.',
  },
  {
    question: 'What Anki file formats are supported?',
    answer:
      'The converter supports all major Anki formats: APKG (Anki Package), COLPKG (Collection Package), ANKI2 (Anki Database), TSV (Tab-Separated Values), and SQLite database files (.db, .sqlite).',
  },
  {
    question: 'Can I use the converted JSON in other applications?',
    answer:
      'Absolutely! The JSON output is standard and can be used in any application that reads JSON. Common uses include building custom study apps, importing into other flashcard systems, data analysis, and creating backups in a portable format.',
  },
  {
    question: 'Is there a command-line version?',
    answer:
      'Yes! For developers and power users, we provide a CLI tool that can be run with npm. Use "npm run anki:convert -- --input deck.apkg --output deck.json" to convert files from the command line. This is ideal for batch processing and automation.',
  },
  {
    question: 'Does the converter preserve deck hierarchy?',
    answer:
      'Yes, the converter preserves nested deck structures. If your Anki collection has parent and child decks (using the :: separator), the JSON output will maintain this hierarchy with subdecks nested appropriately.',
  },
];

// How-to steps for the schema
const howToSteps: HowToStep[] = [
  {
    name: 'Export your Anki deck',
    text: 'Open Anki on your computer, select the deck you want to convert, go to File → Export, and save as .apkg or .colpkg format.',
  },
  {
    name: 'Upload the file',
    text: 'Drag and drop your exported Anki file into the converter drop zone above, or click to select the file from your computer.',
  },
  {
    name: 'Wait for conversion',
    text: 'The converter will process your file locally in your browser. You will see a progress indicator showing the conversion status.',
  },
  {
    name: 'Download your JSON',
    text: 'Once conversion is complete, click the Download JSON button to save your converted deck. The file will be named after your original deck.',
  },
];

// WebApplication structured data
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Anki Deck to JSON Converter',
  alternateName: 'Anki Converter',
  url: `${BASE_URL}/en/tools/anki-converter`,
  applicationCategory: 'UtilityApplication',
  applicationSubCategory: 'File Converter',
  operatingSystem: 'Any',
  browserRequirements:
    'Requires JavaScript. Works with Chrome, Firefox, Safari, Edge.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  description:
    'Convert Anki flashcard decks to JSON format. Supports APKG, TSV, SQLite, and COLPKG files. Free, fast, and completely private.',
  featureList: [
    'APKG file conversion',
    'TSV file conversion',
    'SQLite database conversion',
    'COLPKG file conversion',
    'Cloze deletion support',
    'Custom note type support',
    'Deck hierarchy preservation',
    'Tag preservation',
    'Local processing (100% private)',
    'No file size limits for CLI',
    'Command-line interface available',
  ],
  author: {
    '@type': 'Organization',
    name: 'KanaDojo',
    url: BASE_URL,
  },
  creator: {
    '@type': 'Organization',
    name: 'KanaDojo',
  },
  isAccessibleForFree: true,
  inLanguage: ['en', 'es', 'ja'],
};

// SoftwareApplication schema for additional SEO
const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Anki to JSON CLI Converter',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Windows, macOS, Linux',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Command-line tool for converting Anki decks to JSON format. Ideal for batch processing and automation.',
  downloadUrl: 'https://github.com/lingdojo/kanadojo',
  softwareVersion: '1.0.0',
  author: {
    '@type': 'Organization',
    name: 'KanaDojo',
  },
};

export default function AnkiConverterPage() {
  return (
    <>
      {/* Structured Data */}
      <Script
        id='anki-converter-webapp-schema'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />
      <Script
        id='anki-converter-software-schema'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <FAQSchema faqs={faqItems} />
      <HowToSchema
        name='How to Convert Anki Decks to JSON'
        description='Step-by-step guide to convert your Anki flashcard decks to JSON format using the free online converter.'
        totalTime='PT2M'
        estimatedCost='0'
        steps={howToSteps}
      />

      <article className='mx-auto max-w-7xl px-4 py-8'>
        {/* Main Heading */}
        <header className='mb-8 text-center'>
          <h1 className='mb-4 text-4xl font-bold text-[var(--main-color)]'>
            Anki Deck to JSON Converter
          </h1>
          <p className='mx-auto max-w-2xl text-lg text-[var(--secondary-color)]'>
            Convert your Anki flashcard decks to clean, structured JSON format.
            Free, fast, and completely private — all processing happens in your
            browser.
          </p>
        </header>

        {/* Converter Tool */}
        <section aria-label='Anki Converter Tool' className='mb-12'>
          <ConverterInterface />
        </section>

        {/* Content sections for SEO */}
        <div className='mt-12 space-y-10 text-[var(--secondary-color)]'>
          {/* Supported Formats Section */}
          <section aria-labelledby='supported-formats-heading'>
            <h2
              id='supported-formats-heading'
              className='mb-4 text-2xl font-semibold text-[var(--main-color)]'
            >
              Supported Anki Formats
            </h2>
            <p className='mb-4'>
              Our converter supports all major Anki file formats, making it easy
              to convert any deck regardless of how it was exported:
            </p>
            <ul className='space-y-3'>
              <li>
                <strong className='text-[var(--main-color)]'>
                  APKG files (.apkg)
                </strong>{' '}
                — The standard Anki package format containing deck data, note
                types, and metadata. This is the most common export format from
                Anki desktop and AnkiWeb.
              </li>
              <li>
                <strong className='text-[var(--main-color)]'>
                  TSV files (.tsv)
                </strong>{' '}
                — Tab-separated values format for simple deck imports and
                exports. Useful for decks created from spreadsheets or text
                files.
              </li>
              <li>
                <strong className='text-[var(--main-color)]'>
                  SQLite databases (.db, .sqlite, .anki2)
                </strong>{' '}
                — Direct Anki database files containing all deck information.
                Found in your Anki profile folder.
              </li>
              <li>
                <strong className='text-[var(--main-color)]'>
                  COLPKG files (.colpkg)
                </strong>{' '}
                — Collection packages that include your entire Anki collection
                with multiple decks, settings, and configurations.
              </li>
            </ul>
          </section>

          {/* How to Convert Section */}
          <section aria-labelledby='how-to-convert-heading'>
            <h2
              id='how-to-convert-heading'
              className='mb-4 text-2xl font-semibold text-[var(--main-color)]'
            >
              How to Convert Anki Decks to JSON
            </h2>
            <ol className='list-decimal space-y-3 pl-6'>
              <li>
                <strong>Export your deck from Anki</strong> — Open Anki, select
                your deck, go to File → Export, and save as .apkg or .colpkg
                format.
              </li>
              <li>
                <strong>Upload the file</strong> — Drag and drop your file into
                the converter above, or click to select it from your computer.
              </li>
              <li>
                <strong>Wait for conversion</strong> — The converter processes
                your file locally. Large decks may take a few seconds.
              </li>
              <li>
                <strong>Download your JSON</strong> — Click the download button
                to save your converted deck as a JSON file.
              </li>
            </ol>
          </section>

          {/* Features Section */}
          <section aria-labelledby='features-heading'>
            <h2
              id='features-heading'
              className='mb-4 text-2xl font-semibold text-[var(--main-color)]'
            >
              Features
            </h2>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  🔒 100% Private
                </h3>
                <p className='text-sm'>
                  All conversion happens locally in your browser. Your files
                  never leave your device — no data is sent to any server.
                </p>
              </div>
              <div className='rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  ⚡ Fast Conversion
                </h3>
                <p className='text-sm'>
                  Convert decks with thousands of cards in seconds. Web Workers
                  ensure the UI stays responsive during processing.
                </p>
              </div>
              <div className='rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  📁 All Formats Supported
                </h3>
                <p className='text-sm'>
                  Supports APKG, TSV, SQLite, COLPKG, and ANKI2 files. Convert
                  any Anki deck regardless of export format.
                </p>
              </div>
              <div className='rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  🎯 Smart Output
                </h3>
                <p className='text-sm'>
                  JSON output is optimized for each deck type. Basic, cloze, and
                  custom note types are all handled intelligently.
                </p>
              </div>
              <div className='rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  🏷️ Preserves Structure
                </h3>
                <p className='text-sm'>
                  Deck hierarchy, tags, field names, and cloze deletions are all
                  preserved in the JSON output.
                </p>
              </div>
              <div className='rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4'>
                <h3 className='mb-2 font-semibold text-[var(--main-color)]'>
                  💻 CLI Available
                </h3>
                <p className='text-sm'>
                  Command-line tool for developers. Perfect for batch
                  processing, automation, and handling very large files.
                </p>
              </div>
            </div>
          </section>

          {/* Why Convert Section */}
          <section aria-labelledby='why-convert-heading'>
            <h2
              id='why-convert-heading'
              className='mb-4 text-2xl font-semibold text-[var(--main-color)]'
            >
              Why Convert Anki Decks to JSON?
            </h2>
            <p className='mb-4'>
              Converting Anki decks to JSON format opens up many possibilities
              for working with your flashcard data:
            </p>
            <ul className='list-disc space-y-2 pl-6'>
              <li>
                <strong>Build custom applications</strong> — Integrate flashcard
                data into your own websites, apps, or learning tools.
              </li>
              <li>
                <strong>Data analysis</strong> — Analyze deck content
                programmatically using Python, JavaScript, or any language that
                reads JSON.
              </li>
              <li>
                <strong>Cross-platform compatibility</strong> — Use your Anki
                content in other flashcard systems or learning platforms.
              </li>
              <li>
                <strong>Portable backups</strong> — Create human-readable
                backups of your decks that can be easily inspected and modified.
              </li>
              <li>
                <strong>Content transformation</strong> — Process and transform
                deck content with scripts for bulk editing or format conversion.
              </li>
              <li>
                <strong>API integration</strong> — Feed flashcard data into
                APIs, databases, or machine learning models.
              </li>
            </ul>
          </section>

          {/* Command Line Tool Section */}
          <section aria-labelledby='cli-heading'>
            <h2
              id='cli-heading'
              className='mb-4 text-2xl font-semibold text-[var(--main-color)]'
            >
              Command Line Tool
            </h2>
            <p className='mb-4'>
              For developers and power users, we provide a command-line
              interface for batch processing and automation:
            </p>
            <div className='space-y-4'>
              <div>
                <h3 className='mb-2 font-medium text-[var(--main-color)]'>
                  Basic Usage
                </h3>
                <pre className='overflow-x-auto rounded-lg bg-[var(--card-color)] p-4'>
                  <code className='text-sm text-[var(--text-color)]'>
                    npm run anki:convert -- --input deck.apkg --output deck.json
                  </code>
                </pre>
              </div>
              <div>
                <h3 className='mb-2 font-medium text-[var(--main-color)]'>
                  With Options
                </h3>
                <pre className='overflow-x-auto rounded-lg bg-[var(--card-color)] p-4'>
                  <code className='text-sm text-[var(--text-color)]'>
                    {`# Include statistics and suspended cards
npm run anki:convert -- -i deck.apkg -o deck.json --include-stats --include-suspended

# Show help
npm run anki:convert -- --help`}
                  </code>
                </pre>
              </div>
              <div>
                <h3 className='mb-2 font-medium text-[var(--main-color)]'>
                  CLI Options
                </h3>
                <ul className='list-disc space-y-1 pl-6 text-sm'>
                  <li>
                    <code className='rounded bg-[var(--card-color)] px-1'>
                      -i, --input
                    </code>{' '}
                    — Input file path (required)
                  </li>
                  <li>
                    <code className='rounded bg-[var(--card-color)] px-1'>
                      -o, --output
                    </code>{' '}
                    — Output file path (required)
                  </li>
                  <li>
                    <code className='rounded bg-[var(--card-color)] px-1'>
                      --include-stats
                    </code>{' '}
                    — Include card statistics in output
                  </li>
                  <li>
                    <code className='rounded bg-[var(--card-color)] px-1'>
                      --include-suspended
                    </code>{' '}
                    — Include suspended cards
                  </li>
                  <li>
                    <code className='rounded bg-[var(--card-color)] px-1'>
                      -h, --help
                    </code>{' '}
                    — Show help documentation
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section aria-labelledby='faq-heading'>
            <h2
              id='faq-heading'
              className='mb-6 text-2xl font-semibold text-[var(--main-color)]'
            >
              Frequently Asked Questions
            </h2>
            <div className='space-y-6'>
              {faqItems.map((faq, index) => (
                <div
                  key={index}
                  className='border-b border-[var(--border-color)] pb-4 last:border-0'
                >
                  <h3 className='mb-2 text-lg font-medium text-[var(--main-color)]'>
                    {faq.question}
                  </h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Tools Section */}
          <section aria-labelledby='related-tools-heading'>
            <h2
              id='related-tools-heading'
              className='mb-4 text-2xl font-semibold text-[var(--main-color)]'
            >
              Related Japanese Learning Tools
            </h2>
            <p className='mb-4'>
              Explore more free tools on KanaDojo to enhance your Japanese
              learning:
            </p>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <Link
                href='/translate'
                className='block rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4 transition-colors hover:border-[var(--main-color)]'
              >
                <h3 className='mb-1 font-semibold text-[var(--main-color)]'>
                  Japanese Translator
                </h3>
                <p className='text-sm'>
                  Translate between English and Japanese with Hiragana,
                  Katakana, and Romaji output.
                </p>
              </Link>
              <Link
                href='/kana'
                className='block rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4 transition-colors hover:border-[var(--main-color)]'
              >
                <h3 className='mb-1 font-semibold text-[var(--main-color)]'>
                  Kana Practice
                </h3>
                <p className='text-sm'>
                  Learn Hiragana and Katakana with interactive games and
                  quizzes.
                </p>
              </Link>
              <Link
                href='/kanji'
                className='block rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4 transition-colors hover:border-[var(--main-color)]'
              >
                <h3 className='mb-1 font-semibold text-[var(--main-color)]'>
                  Kanji Study
                </h3>
                <p className='text-sm'>
                  Practice Kanji organized by JLPT levels from N5 to N1.
                </p>
              </Link>
              <Link
                href='/vocabulary'
                className='block rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4 transition-colors hover:border-[var(--main-color)]'
              >
                <h3 className='mb-1 font-semibold text-[var(--main-color)]'>
                  Vocabulary Builder
                </h3>
                <p className='text-sm'>
                  Build your Japanese vocabulary with thousands of words by JLPT
                  level.
                </p>
              </Link>
              <Link
                href='/conjugate'
                className='block rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4 transition-colors hover:border-[var(--main-color)]'
              >
                <h3 className='mb-1 font-semibold text-[var(--main-color)]'>
                  Verb Conjugator
                </h3>
                <p className='text-sm'>
                  Practice Japanese verb conjugations with all forms and tenses.
                </p>
              </Link>
              <Link
                href='/resources'
                className='block rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] p-4 transition-colors hover:border-[var(--main-color)]'
              >
                <h3 className='mb-1 font-semibold text-[var(--main-color)]'>
                  Learning Resources
                </h3>
                <p className='text-sm'>
                  Discover curated Japanese learning resources, apps, and
                  textbooks.
                </p>
              </Link>
            </div>
          </section>

          {/* Last Updated */}
          <footer className='border-t border-[var(--border-color)] pt-6 text-center text-sm text-[var(--secondary-color)]'>
            <p>
              Last updated: January 2025 •
              <Link
                href='/privacy'
                className='ml-1 underline hover:text-[var(--main-color)]'
              >
                Privacy Policy
              </Link>
            </p>
          </footer>
        </div>
      </article>
    </>
  );
}
