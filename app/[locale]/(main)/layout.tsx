'use client';

import SidebarLayout from '@/shared/ui-composite/layout/SidebarLayout';

// Keep the main application shell explicit so production deployments include it.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}

