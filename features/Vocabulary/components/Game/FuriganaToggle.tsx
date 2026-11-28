'use client';
import { useThemePreferences } from '@/features/Preferences';
import { cn } from '@/shared/utils/utils';

interface FuriganaToggleProps {
  className?: string;
}

/**
 * Inline switch for the existing "Show furigana" preference, so learners can
 * turn kana readings on or off without leaving the vocabulary trainer.
 *
 * It reads and writes the same persisted setting as Preferences > Behavior,
 * so the choice carries over to every vocabulary mode and to the settings page.
 */
const FuriganaToggle = ({ className }: FuriganaToggleProps) => {
  const { furiganaEnabled, setFuriganaEnabled } = useThemePreferences();

  return (
    <button
      type='button'
      aria-pressed={furiganaEnabled}
      aria-label={furiganaEnabled ? 'Hide furigana' : 'Show furigana'}
      title={
        furiganaEnabled
          ? 'Hide the kana reading above the word'
          : 'Show the kana reading above the word'
      }
      // Keep focus on the answer input / game so typing and keyboard
      // shortcuts keep working after a mouse click on the toggle.
      onMouseDown={event => event.preventDefault()}
      onClick={() => setFuriganaEnabled(!furiganaEnabled)}
      className={cn(
        'cursor-pointer rounded-lg border px-2 py-0.5 text-xs transition-colors',
        furiganaEnabled
          ? 'border-(--main-color) text-(--main-color)'
          : 'border-(--border-color) text-(--secondary-color)',
        className,
      )}
    >
      <span lang='ja'>ふりがな</span> {furiganaEnabled ? 'on' : 'off'}
    </button>
  );
};

export default FuriganaToggle;
