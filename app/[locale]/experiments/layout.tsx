import SidebarLayout from '@/shared/components/layout/SidebarLayout';

export default function ExperimentsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout showBanner={false}>{children}</SidebarLayout>;
}
