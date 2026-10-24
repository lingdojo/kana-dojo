'use client';

import { create } from 'zustand';

interface ContinueRequestState {
  requestCount: number;
  requestContinue: () => void;
}

const useContinueRequestStore = create<ContinueRequestState>(set => ({
  requestCount: 0,
  requestContinue: () =>
    set(state => ({ requestCount: state.requestCount + 1 })),
}));

export default useContinueRequestStore;
