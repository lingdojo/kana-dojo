import SidebarLayout from '@/shared/components/layout/SidebarLayout';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('experiments', {
    locale,
    pathname: '/experiments',
  });
}

export default function ExperimentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout showBanner={false}>{children}</SidebarLayout>;
}
