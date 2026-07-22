'use client';

import TopBar from '@/shared/ui-composite/navigation/TopBar';

interface ConjugateLayoutProps {
  children: React.ReactNode;
}

export default function ConjugateLayout({ children }: ConjugateLayoutProps) {
  return (
    <div className='min-h-dvh bg-(--background-color)'>
      <TopBar />
      <main className='mx-auto max-w-7xl px-4 pt-24 pb-16 md:px-6'>
        {children}
      </main>
    </div>
  );
}

