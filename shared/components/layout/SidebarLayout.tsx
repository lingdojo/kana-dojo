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
  className
}: SidebarLayoutProps) => {
  return (
    <div className='min-h-[100dvh] max-w-[100dvw] lg:pr-20 flex gap-4'>
      <Sidebar />
      <div
        className={clsx(
          'flex flex-col gap-4',
          'w-full lg:w-4/5 lg:px-0 px-4 md:px-8',
          'pb-20',
          className
        )}
      >
        {showBanner && <Banner />}
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;
