'use client';

import { useEffect, useRef, useState } from 'react';

type UseScrollVisibilityOptions = {
  topShowThreshold?: number;
  hideAfterScrollY?: number;
  minScrollDelta?: number;
  debounceMs?: number;
};

export const useScrollVisibility = ({
  topShowThreshold = 10,
  hideAfterScrollY = 80,
  minScrollDelta = 8,
  debounceMs = 180,
}: UseScrollVisibilityOptions = {}) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const lastToggleAt = useRef(0);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>(
      '[data-scroll-restoration-id="container"]',
    );

    if (!scrollContainer) {
      console.warn('Scroll container not found, scroll visibility disabled');
      return;
    }

    const setVisibility = (nextVisible: boolean) => {
      if (nextVisible === isVisibleRef.current) return;

      const now = Date.now();
      if (now - lastToggleAt.current < debounceMs) return;

      isVisibleRef.current = nextVisible;
      lastToggleAt.current = now;
      setIsVisible(nextVisible);
    };

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;
      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY <= topShowThreshold) {
        setVisibility(true);
      } else if (Math.abs(delta) >= minScrollDelta) {
        if (delta > 0 && currentScrollY > hideAfterScrollY) {
          setVisibility(false);
        } else if (delta < 0) {
          setVisibility(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [debounceMs, hideAfterScrollY, minScrollDelta, topShowThreshold]);

  return isVisible;
};
