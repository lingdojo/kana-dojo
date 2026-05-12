'use client';
import { useState, useEffect } from 'react';

/**
 * Computes the fixed/sticky layout for elements that should span
 * from the sidebar's right edge to the viewport's right edge on desktop,
 * or full viewport width on mobile.
 *
 * Mirrors the approach used in SelectionStatusBar and ProgressTabs.
 */
export interface SidebarLayout {
  /** Left offset in pixels (0 on mobile, sidebar right edge on desktop) */
  left: number;
  /** Width in pixels */
  width: number;
  /** Whether we're in desktop mode (>= 1024px) */
  isDesktop: boolean;
}

export function useSidebarLayout(): SidebarLayout {
  const [layout, setLayout] = useState<SidebarLayout>({
    left: 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isDesktop: false,
  });

  useEffect(() => {
    const updateLayout = () => {
      const sidebar = document.getElementById('main-sidebar');
      const viewportWidth = window.innerWidth;

      if (viewportWidth >= 1024 && sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        setLayout({
          left: sidebarRect.right,
          width: viewportWidth - sidebarRect.right,
          isDesktop: true,
        });
      } else {
        setLayout({
          left: 0,
          width: viewportWidth,
          isDesktop: false,
        });
      }
    };

    updateLayout();

    const sidebar = document.getElementById('main-sidebar');
    let observer: ResizeObserver | null = null;

    if (sidebar) {
      observer = new ResizeObserver(updateLayout);
      observer.observe(sidebar);
    }

    window.addEventListener('resize', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      if (observer) observer.disconnect();
    };
  }, []);

  return layout;
}
