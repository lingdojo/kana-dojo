'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronsUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/generic/useAudio';

// Toggle between styles: true = floating Japanese char style, false = current style
const USE_FLOATING_STYLE = true;

// Toggle explosion animation on click: true = explosion effect, false = no explosion
const USE_EXPLOSION_ANIMATION = false;

type AnimState = 'idle' | 'exploding' | 'hidden' | 'fading-in';

const animationKeyframes = `
@keyframes scaleIn-btt {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scaleOut-btt {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

@keyframes explode-btt {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(2.4);
    opacity: 0.5;
  }
  100% {
    transform: scale(4);
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

export default function BackToTop() {
  const { playClick } = useClick();

  const [visible, setVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [stableVh, setStableVh] = useState('100dvh');
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
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

  const visibleRef = useRef(visible);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  const onScroll = useCallback(() => {
    if (scrollTimeout.current) return;
    scrollTimeout.current = setTimeout(() => {
      if (container.current) {
        const shouldBeVisible = container.current.scrollTop > 300;

        if (shouldBeVisible && !visibleRef.current) {
          // Entry - only if not animating explosion
          if (!isAnimating.current) {
            setVisible(true);
            setIsEntering(true);
            setTimeout(() => setIsEntering(false), 500);
          }
        } else if (!shouldBeVisible && visibleRef.current) {
          // Exit - only if not animating explosion
          if (!isAnimating.current) {
            setIsExiting(true);
            setTimeout(() => {
              setVisible(false);
              setIsExiting(false);
            }, 300);
          }
        }
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
    const mounted = true;
    setIsMounted(mounted);
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

  if (!isMounted || isRootPath) return null;
  if (!visible && !isExiting) return null;

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      if (isAnimating.current) return;

      playClick();
      container.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        (document.body as HTMLElement)?.focus?.();
      }, 300);

      if (USE_EXPLOSION_ANIMATION) {
        isAnimating.current = true;

        setAnimState('exploding');

        setTimeout(() => {
          setAnimState('hidden');
          setVisible(false); // Hide the button completely
          setTimeout(() => {
            setAnimState('idle');
            isAnimating.current = false;
          }, 100);
        }, 300);
      }
    }
  };

  // Floating style classes (like MainMenu Japanese char buttons)
  const floatingStyleClasses = clsx(
    'inline-flex h-12 w-12 items-center justify-center rounded-2xl',
    'bg-(--secondary-color) hover:bg-(--main-color) text-(--background-color)',
    'border-b-8 border-(--secondary-color-accent) hover:border-(--main-color-accent)',
    'transition-colors duration-200',
    'active:border-b-0',
    'hover:cursor-pointer',
    'animate-float [--float-distance:-7px]',
  );

  // Current style classes
  const currentStyleClasses = clsx(
    'inline-flex items-center justify-center rounded-full',
    'p-2 transition-colors duration-200 md:p-3',
    'bg-(--main-color) text-(--background-color) md:bg-(--secondary-color) md:hover:bg-(--main-color)',
    'hover:cursor-pointer',
  );

  const animationStyle = isEntering
    ? {
        animation:
          'scaleIn-btt 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }
    : isExiting
      ? {
          animation:
            'scaleOut-btt 300ms cubic-bezier(0.36, 0, 0.66, -0.56) forwards',
        }
      : {};

  const getExplosionStyle = (): React.CSSProperties => {
    if (!USE_EXPLOSION_ANIMATION) return {};

    switch (animState) {
      case 'exploding':
        return {
          animation: 'explode-btt 300ms ease-out forwards',
          pointerEvents: 'none',
        };
      case 'hidden':
        return { opacity: 0, pointerEvents: 'none' };
      case 'fading-in':
        return {
          animation: 'fadeIn-btt 500ms ease-in forwards',
          pointerEvents: 'none',
        };
      default:
        return {};
    }
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'fixed top-[calc(var(--stable-vh)/2)] right-2 z-60 -translate-y-1/2 md:top-1/2 lg:right-3',
        USE_FLOATING_STYLE ? floatingStyleClasses : currentStyleClasses,
        USE_EXPLOSION_ANIMATION &&
          animState === 'idle' &&
          'hover:cursor-pointer',
        !USE_EXPLOSION_ANIMATION && 'hover:cursor-pointer',
      )}
      style={
        {
          '--stable-vh': stableVh,
          ...animationStyle,
          ...getExplosionStyle(),
        } as unknown as React.CSSProperties
      }
    >
      <ChevronsUp size={USE_FLOATING_STYLE ? 24 : 32} strokeWidth={2.5} />
    </button>
  );
}
