'use client';

import { useEffect, useRef } from 'react';
import useVisitStore from '../store/useVisitStore';

/**
 * Hook that tracks user visits to the website.
 * Should be used in the root layout to record visits once per session.
 *
 * - Runs once per app session
 * - Checks if today is already recorded
 * - Records today's date if not present
 */
export function useVisitTracker(): void {
  const hasTracked = useRef(false);
  const { loadVisits, recordVisit, isLoaded } = useVisitStore();

  useEffect(() => {
    // Only run once per session
    if (hasTracked.current) return;

    const trackVisit = async () => {
      // Load existing visits first
      await loadVisits();
      // Record today's visit (idempotent - won't duplicate)
      await recordVisit();
      hasTracked.current = true;
    };

    trackVisit();
  }, [loadVisits, recordVisit]);
}

export default useVisitTracker;
