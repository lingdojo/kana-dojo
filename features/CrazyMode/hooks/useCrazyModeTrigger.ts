import useCrazyModeStore, { KYOKI_THEME_ID } from '../store/useCrazyModeStore';
import { usePreferencesStore } from '@/features/Preferences';

export const useCrazyModeTrigger = () => {
  const selectedTheme = usePreferencesStore(state => state.theme);
  const isCrazyMode = selectedTheme === KYOKI_THEME_ID;
  const randomize = useCrazyModeStore(state => state.randomize);

  const trigger = () => {
    if (isCrazyMode) {
      randomize();
    }
  };

  return { trigger };
};
