'use client';

import TopBar from '@/shared/ui-composite/navigation/TopBar';

interface TranslateLayoutProps {
  children: React.ReactNode;
}

export default function TranslateLayout({ children }: TranslateLayoutProps) {
  return (
    <div className='min-h-dvh bg-(--background-color)'>
      <TopBar />
      <main className='mx-auto max-w-7xl px-4 pt-24 pb-16 md:px-6'>
        {children}
      </main>
    </div>
  );
}

