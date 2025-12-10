import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (hasSeenWelcome: boolean) => void;
}

const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenWelcome: false,
      setHasSeenWelcome: (hasSeenWelcome: boolean) => set({ hasSeenWelcome }),
    }),
    {
      name: 'welcome-storage',
      version: 0,
    }
  )
);

export default useOnboardingStore;