import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Theme Template - Predefined or custom theme
 */
export interface ThemeTemplate {
  id: string;
  backgroundColor: string;
  cardColor: string;
  borderColor: string;
  mainColor: string;
  secondaryColor: string;
}

/**
 * Theme Store State
 */
interface ThemeStore {
  // Themes
  themes: ThemeTemplate[];

  // Themes Actions
  addTheme: (themes: ThemeTemplate) => string;
  removeTheme: (id: string) => void;
  getTheme: (id: string) => ThemeTemplate | undefined;
}

/**
 * Default templates that come with the app
 */
const DEFAULT_THEMES: ThemeTemplate[] = [];

/**
 * Zustand store for themes with persistence
 */
export const useCustomThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      themes: DEFAULT_THEMES,

      // Themes Actions
      addTheme: (template) => {
        const id = template.id;
        const newTemplate: ThemeTemplate = {
          ...template,
          id,
        };

        set((state) => ({
          themes: [...state.themes, newTemplate],
        }));

        return id;
      },

      removeTheme: (id) => {
        set((state) => ({
          themes: state.themes.filter((t) => t.id !== id),
        }));
      },

      getTheme: (id) => {
        return get().themes.find((t) => t.id === id);
      },
    }),
    {
      name: 'kanadojo-custom-themes', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist themes
      partialize: (state) => ({
        themes: state.themes,
      }),
    }
  )
);
