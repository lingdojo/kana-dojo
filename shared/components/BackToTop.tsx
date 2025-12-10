'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronsUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';

export default function BackToTop() {
  const { playClick } = useClick();

  const [visible, setVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const container = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Only run on client side
    setIsMounted(true);

    if (typeof document === 'undefined') return;

    container.current = document.querySelector(
      '[data-scroll-restoration-id="container"]'
    );

    if (!container.current) return;

    const onScroll = () => {
      // Show after user scrolls down 300px
      setVisible(container.current!.scrollTop > 300);
    };

    // attach scroll listener to the container, not window
    container.current.addEventListener('scroll', onScroll, { passive: true });
    // Initial check
    onScroll();

    return () => container.current?.removeEventListener('scroll', onScroll);
  }, []);

  // Hide on root path only
  const isRootPath = pathname === '/' || pathname === '';

  // Don't render during SSR or if not visible or on root path
  if (!isMounted || !visible || isRootPath) return null;

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      playClick();
      container.current?.scrollTo({ top: 0, behavior: 'smooth' });
      // Move focus to body for keyboard users after scroll
      // (give the browser a tick so scrolling starts)
      setTimeout(() => {
        (document.body as HTMLElement)?.focus?.();
      }, 300);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'fixed z-[60] top-20 right-2 lg:right-3',
        'max-md:border-2 border-[var(--border-color)]',
        'inline-flex items-center justify-center rounded-full ',
        'p-2 md:p-3 shadow-lg transition-all duration-200 ',
        'bg-[var(--card-color)] text-[var(--main-color)] ',
        'hover:bg-[var(--main-color)] hover:text-[var(--background-color)]',
        'hover:cursor-pointer'
      )}
    >
      <ChevronsUp size={32} strokeWidth={2.5} />
    </button>
  );
}
