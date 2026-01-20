import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import GoogleAnalytics from '@/core/analytics/GoogleAnalytics';
import MSClarity from '@/core/analytics/MSClarity';
import {
  StructuredData,
  kanaDojoSchema,
} from '@/shared/components/SEO/StructuredData';
import { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';

const googleVerificationToken = process.env.GOOGLE_VERIFICATION_TOKEN || '';
const msVerificationToken = process.env.MS_VERIFICATION_TOKEN || '';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://kanadojo.com'),
  manifest: '/manifest.json',
  title: {
    default:
      'KanaDojo - Learn Japanese Hiragana, Katakana, Kanji & Vocabulary Online',
    template: '%s | KanaDojo',
  },
  description:
    'Master Japanese with KanaDojo - a fun, aesthetic, minimalist platform for learning Hiragana, Katakana, Kanji, and Vocabulary. Practice with interactive games, track progress, and customize your learning experience.',
  icons: {
    icon: [
      { url: '/favicon.ico?v=2' },
      { url: '/favicon.ico?v=2', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.ico?v=2', sizes: '32x32', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: '/favicon.ico?v=2',
  },
  verification: {
    google: googleVerificationToken,
    other: { 'msvalidate.01': msVerificationToken },
  },
  keywords: [
    'learn japanese',
    'learn hiragana',
    'learn katakana',
    'learn kana',
    'learn kanji',
    'japanese vocabulary',
    'hiragana practice',
    'katakana practice',
    'kanji practice',
    'japanese learning app',
    'japanese online lessons',
    'japanese writing system',
    'JLPT preparation',
    'japanese language learning',
    'kana dojo',
    'japanese study tool',
    'free japanese lessons',
  ],
  authors: [{ name: 'LingDojo', url: 'https://kanadojo.com' }],
  creator: 'LingDojo',
  publisher: 'LingDojo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'KanaDojo - Learn Japanese Hiragana, Katakana, Kanji & Vocabulary',
    description:
      'Master Japanese with KanaDojo - an aesthetic, minimalist platform for learning Hiragana, Katakana, Kanji, and Vocabulary. Interactive games, progress tracking, and 100+ themes.',
    url: 'https://kanadojo.com',
    siteName: 'KanaDojo',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_ES', 'ja_JP'],
  },
  twitter: {
    card: 'summary',
    title: 'KanaDojo - Learn Japanese Online',
    description:
      'Master Japanese Hiragana, Katakana, Kanji & Vocabulary with interactive games and beautiful themes.',
    creator: '@kanadojo',
  },
  alternates: {
    canonical: 'https://kanadojo.com',
    languages: {
      en: 'https://kanadojo.com/en',
      es: 'https://kanadojo.com/es',
      ja: 'https://kanadojo.com/ja',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'education',
};

// Move analytics condition to a constant to avoid repeated evaluation
const isAnalyticsEnabled =
  process.env.NODE_ENV === 'production' &&
  process.env.ANALYTICS_DISABLED !== 'true';

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Trigger rebuild: 2025-12-31
  // Get locale from middleware header
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'en';

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <StructuredData data={kanaDojoSchema} />
        <Script id='audio-sw-migration' strategy='beforeInteractive'>
          {`try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then(function (registrations) {
        return Promise.all(
          registrations
            .filter(function (reg) {
              return (
                reg.active &&
                reg.active.scriptURL.endsWith('/sw.js') &&
                new URL(reg.scope).pathname === '/'
              );
            })
            .map(function (reg) {
              return reg.unregister();
            })
        );
      })
      .catch(function () {});
  }
} catch (_) {}`}
        </Script>
        {/* DNS prefetch for external domains - resolve DNS early */}
        <link rel='dns-prefetch' href='https://www.googletagmanager.com' />
        <link rel='dns-prefetch' href='https://www.clarity.ms' />
        <link rel='dns-prefetch' href='https://vercel-analytics.com' />
        <link rel='dns-prefetch' href='https://vitals.vercel-insights.com' />
        <link rel='dns-prefetch' href='https://translation.googleapis.com' />
        {/* Preconnect to critical domains - establish early connections */}
        <link
          rel='preconnect'
          href='https://www.googletagmanager.com'
          crossOrigin='anonymous'
        />
        <link
          rel='preconnect'
          href='https://vercel-analytics.com'
          crossOrigin='anonymous'
        />
        <link
          rel='preconnect'
          href='https://translation.googleapis.com'
          crossOrigin='anonymous'
        />
        {/* Prefetch critical JSON data for faster navigation */}
        <link rel='prefetch' href='/data-kanji/decorations.json' as='fetch' />
        <link rel='prefetch' href='/data-kanji/N5.json' as='fetch' />
        <link rel='prefetch' href='/data-vocab/n5.json' as='fetch' />
        <link rel='prefetch' href='/japan-facts.json' as='fetch' />
      </head>
      <body>
        {isAnalyticsEnabled && (
          <>
            <GoogleAnalytics />
            <MSClarity />
            <Analytics />
            <SpeedInsights />
          </>
        )}
        {children}
      </body>
    </html>
  );
}
