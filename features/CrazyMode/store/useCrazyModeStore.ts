import { create } from 'zustand';
import themeSets from '@/features/Preferences/data/themes';
import fonts from '@/features/Preferences/data/fonts';
import { Random } from 'random-js';
import { persist } from 'zustand/middleware';

interface CrazyModeState {
  isCrazyMode: boolean;
  activeThemeId: string | null;
  activeFontName: string | null;
  toggleCrazyMode: () => void;
  randomize: () => void;
}

const random = new Random();

const useCrazyModeStore = create<CrazyModeState>()(
  persist(
    (set, get) => ({
      isCrazyMode: false,
      activeThemeId: null,
      activeFontName: null,

      toggleCrazyMode: () => {
        const wasActive = get().isCrazyMode;
        if (!wasActive) {
          // Turning ON: Trigger immediate randomization
          get().randomize();
          set({ isCrazyMode: true });
        } else {
          // Turning OFF: Reset active values
          set({
            isCrazyMode: false,
            activeThemeId: null,
            activeFontName: null
          });
        }
      },

      randomize: () => {
        // Flatten themes to get all available theme IDs
        const allThemes = themeSets.flatMap(group => group.themes);
        const randomTheme = allThemes[random.integer(0, allThemes.length - 1)];

        const randomFont =
          fonts.length > 0 ? fonts[random.integer(0, fonts.length - 1)] : null;

        set({
          activeThemeId: randomTheme.id,
          activeFontName: randomFont?.name ?? null
        });
      }
    }),
    {
      name: 'kanadojo-crazy-mode'
    }
  )
);

export default useCrazyModeStore;
