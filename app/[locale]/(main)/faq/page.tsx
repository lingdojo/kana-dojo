import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing, type Locale } from '@/core/i18n/routing';
import { Breadcrumbs } from '@/shared/ui-composite/Breadcrumbs';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import FAQSection from './FAQSection';
import { StructuredData } from '@/shared/ui-composite/SEO/StructuredData';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return await generatePageMetadata('faq', {
    locale: locale as Locale,
    pathname: '/faq',
  });
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' as const });

  const groups = [
    {
      id: 'getting-started',
      title: t('sections.gettingStarted.title'),
      description: t('sections.gettingStarted.description'),
      faqs: [
        {
          question
