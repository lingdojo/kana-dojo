'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronsUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';

const animationKeyframes = `
@keyframes explode-btt {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.6);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes fadeIn-btt {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
`;

type AnimState = 'idle' | 'exploding' | 'hidden' | 'fading-in';

export default function BackToTop() {
  const { playClick } = useClick();

  const [visible, setVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [stableVh, setStableVh] = useState('100dvh');
  const [animState, setAnimState] = useState<AnimState>('idle');

  const pathname = usePathname();
  const container = useRef<HTMLElement | null>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stableVhRef = useRef<number | null>(null);
  const isAnimating = useRef(false);

  const getViewportHeight = () => {
    if (typeof window === 'undefined') return null;
    return Math.round(window.visualViewport?.height ?? window.innerHeight);
  };

  const updateStableVh = useCallback((force = false) => {
    const nextHeight = getViewportHeight();
    if (!nextHeight) return;

    const previousHeight = stableVhRef.current;
    const largeResizeThreshold = 120;
    const shouldUpdate =
      force ||
      previousHeight === null ||
      Math.abs(nextHeight - previousHeight) >= largeResizeThreshold;

    if (!shouldUpdate) return;

    stableVhRef.current = nextHeight;
    setStableVh(`${nextHeight}px`);
  }, []);

  const onScroll = useCallback(() => {
    if (scrollTimeout.current) return;
    scrollTimeout.current = setTimeout(() => {
      if (container.current) {
        setVisible(container.current.scrollTop > 300);
      }
      scrollTimeout.current = null;
    }, 100);
  }, []);

  // Inject animation keyframes
  useEffect(() => {
    const styleId = 'btt-animation-keyframes';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = animationKeyframes;
      document.head.appendChild(styleElement);
    }
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
    updateStableVh(true);

    if (typeof document === 'undefined') return;

    container.current = document.querySelector(
      '[data-scroll-restoration-id="container"]',
    );

    if (!container.current) return;

    const handleResize = () => updateStableVh(false);
    const handleOrientationChange = () => updateStableVh(true);

    container.current.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, {
      passive: true,
    });
    onScroll();

    return () => {
      container.current?.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [onScroll, updateStableVh]);

  const isRootPath = pathname === '/' || pathname === '';

  if (!isMounted || !visible || isRootPath) return null;

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      if (isAnimating.current) return;
      isAnimating.current = true;

      playClick();
      container.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        (document.body as HTMLElement)?.focus?.();
      }, 300);

      setAnimState('exploding');

      setTimeout(() => {
        setAnimState('hidden');
        setTimeout(() => {
          setAnimState('fading-in');
          setTimeout(() => {
            setAnimState('idle');
            isAnimating.current = false;
          }, 500);
        }, 100); // Show back faster after explosion
      }, 300);
    }
  };

  const getAnimationStyle = (): CSSProperties => {
    switch (animState) {
      case 'exploding':
        return { animation: 'explode-btt 300ms ease-out forwards', pointerEvents: 'none' };
      case 'hidden':
        return { opacity: 0, pointerEvents: 'none' };
      case 'fading-in':
        return { animation: 'fadeIn-btt 500ms ease-in forwards', pointerEvents: 'none' };
      default:
        return {};
    }
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'fixed top-[calc(var(--stable-vh)/2)] right-2 z-[60] -translate-y-1/2 md:top-1/2 lg:right-3',
        'border-(--border-color) max-md:border-2',
        'inline-flex items-center justify-center rounded-full',
        'p-2 transition-all duration-200 md:p-3',
        'bg-(--card-color) text-(--main-color)',
        'hover:bg-(--main-color) hover:text-(--background-color)',
        animState === 'idle' && 'hover:cursor-pointer',
      )}
      style={{ '--stable-vh': stableVh, ...getAnimationStyle() } as CSSProperties}
    >
      <ChevronsUp size={32} strokeWidth={2.5} />
    </button>
  );
}
