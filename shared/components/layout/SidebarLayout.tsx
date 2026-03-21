'use client';
import clsx from 'clsx';
import Sidebar from '@/shared/components/Menu/Sidebar';
import Banner from '@/shared/components/Menu/Banner';

interface SidebarLayoutProps {
  children: React.ReactNode;
  showBanner?: boolean;
  className?: string;
}

/**
 * Shared layout component for pages that need the sidebar.
 * Provides consistent structure across the app.
 */
const SidebarLayout = ({
  children,
  showBanner = true,
  className,
}: SidebarLayoutProps) => {
  return (
    <div className='flex min-h-[100dvh] max-w-[100dvw] gap-4 lg:gap-4 lg:pr-6'>
      <Sidebar />
      <div
        className={clsx(
          'flex flex-col gap-4',
          'w-full px-4 md:px-8 lg:flex-1 lg:px-0',
          'pb-20',
          className,
        )}
      >
        {showBanner && <Banner />}
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;
