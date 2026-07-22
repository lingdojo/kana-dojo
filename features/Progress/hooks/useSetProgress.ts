'use client';

import { useEffect } from 'react';

import useSetProgressStore from '@/features/Progress/store/useSetProgressStore';

export function useSetProgressHydration(): boolean {
  const hydrate = useSetProgressStore(state => state.hydrate);
  const isHydrated = useSetProgressStore(state => state.isHydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return isHydrated;
}

export default useSetProgressHydration;
