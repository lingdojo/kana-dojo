'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onScroll = useCallback(() => {
    if (scrollTimeout.current) return;
    scrollTimeout.current = setTimeout(() => {
      if (container.current) {
        setVisible(container.current.scrollTop > 300);
      }
      scrollTimeout.current = null;
    }, 100);
  }, []);

  useEffect(() => {
    setIsMounted(true);

    if (typeof document === 'undefined') return;

    container.current = document.querySelector(
      '[data-scroll-restoration-id="container"]',
    );

    if (!container.current) return;

    container.current.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      container.current?.removeEventListener('scroll', onScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [onScroll]);

  const isRootPath = pathname === '/' || pathname === '';

  if (!isMounted || !visible || isRootPath) return null;

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      playClick();
      container.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        (document.body as HTMLElement)?.focus?.();
      }, 300);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'fixed top-1/2 right-2 z-[60] -translate-y-1/2 lg:right-3',
        'border-(--border-color) max-md:border-2',
        'inline-flex items-center justify-center rounded-full',
        'p-2 transition-all duration-200 md:p-3',
        'bg-(--card-color) text-(--main-color)',
        'hover:bg-(--main-color) hover:text-(--background-color)',
        'hover:cursor-pointer',
      )}
    >
      <ChevronsUp size={32} strokeWidth={2.5} />
    </button>
  );
}
