import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/core/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ClientLayout from '../ClientLayout';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  // Await params in Next.js
  const { locale } = await params;

  // Validate that the locale is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client with explicit locale
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ClientLayout>{children}</ClientLayout>
    </NextIntlClientProvider>
  );
}
