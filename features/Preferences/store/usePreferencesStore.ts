import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Wallpaper, WallpaperCategory } from '../data/wallpapers';
import { generateWallpaperId, isValidImageUrl } from '../data/wallpapers';

interface PreferencesState {
  displayKana: boolean;
  setDisplayKana: (displayKana: boolean) => void;

  theme: string;
  setTheme: (theme: string) => void;

  isGlassMode: boolean;
  setGlassMode: (isGlassMode: boolean) => void;

  font: string;
  setFont: (fontName: string) => void;

  silentMode: boolean;
  setSilentMode: (silent: boolean) => void;

  hotkeysOn: boolean;
  setHotkeys: (hotkeys: boolean) => void;

  // Pronunciation settings
  pronunciationEnabled: boolean;
  setPronunciationEnabled: (enabled: boolean) => void;

  pronunciationSpeed: number;
  setPronunciationSpeed: (speed: number) => void;

  pronunciationPitch: number;
  setPronunciationPitch: (pitch: number) => void;

  // Voice selection
  pronunciationVoiceName: string | null;
  setPronunciationVoiceName: (name: string | null) => void;

  furiganaEnabled: boolean;
  setFuriganaEnabled: (enabled: boolean) => void;

  //Theme preview
  themePreview: boolean;
  setThemePreview: (enabled: boolean) => void;

  // Wallpaper settings
  selectedWallpaperId: string | null; // Currently active wallpaper
  customWallpapers: Wallpaper[]; // User-added wallpapers
  setSelectedWallpaper: (id: string | null) => void;
  addCustomWallpaper: (
    name: string,
    url: string,
    category?: WallpaperCategory,
  ) => boolean;
  removeCustomWallpaper: (id: string) => void;
  clearWallpaper: () => void;
}

const usePreferencesStore = create<PreferencesState>()(
  persist(
    set => ({
      displayKana: false,
      setDisplayKana: displayKana => set({ displayKana }),
      theme: 'light',
      setTheme: theme => set({ theme }),
      isGlassMode: false,
      setGlassMode: isGlassMode => set({ isGlassMode }),
      font: 'Zen Maru Gothic',
      setFont: fontName => set({ font: fontName }),
      silentMode: false,
      setSilentMode: silent => set({ silentMode: silent }),
      hotkeysOn: true,
      setHotkeys: hotkeys => set({ hotkeysOn: hotkeys }),

      // Pronunciation settings
      pronunciationEnabled: true,
      setPronunciationEnabled: enabled =>
        set({ pronunciationEnabled: enabled }),
      pronunciationSpeed: 1.0,
      setPronunciationSpeed: speed => set({ pronunciationSpeed: speed }),
      pronunciationPitch: 1.0,
      setPronunciationPitch: pitch => set({ pronunciationPitch: pitch }),
      pronunciationVoiceName: null,
      setPronunciationVoiceName: name => set({ pronunciationVoiceName: name }),
      furiganaEnabled: false,
      setFuriganaEnabled: enabled => set({ furiganaEnabled: enabled }),

      // Theme preview
      themePreview: false,
      setThemePreview: enabled => set({ themePreview: enabled }),

      // Wallpaper settings
      selectedWallpaperId: null,
      customWallpapers: [],

      setSelectedWallpaper: id => set({ selectedWallpaperId: id }),

      addCustomWallpaper: (name, url, category = 'custom') => {
        // Validate URL
        if (!isValidImageUrl(url)) {
          console.error('Invalid image URL:', url);
          return false;
        }

        const newWallpaper: Wallpaper = {
          id: generateWallpaperId(),
          name: name.trim() || 'Custom Wallpaper',
          url,
          category,
          isUserAdded: true,
          createdAt: Date.now(),
        };

        set(state => ({
          customWallpapers: [...state.customWallpapers, newWallpaper],
        }));
        return true;
      },

      removeCustomWallpaper: id => {
        set(state => {
          const wallpaper = state.customWallpapers.find(w => w.id === id);

          // Only allow deletion of user-added wallpapers
          if (!wallpaper || !wallpaper.isUserAdded) {
            console.warn('Cannot delete base wallpaper');
            return state;
          }

          // If deleted wallpaper is currently selected, clear selection
          const updates: Partial<PreferencesState> = {
            customWallpapers: state.customWallpapers.filter(w => w.id !== id),
          };

          if (state.selectedWallpaperId === id) {
            updates.selectedWallpaperId = null;
          }

          return updates;
        });
      },

      clearWallpaper: () => set({ selectedWallpaperId: null }),
    }),

    {
      name: 'theme-storage',
    },
  ),
);

export default usePreferencesStore;
