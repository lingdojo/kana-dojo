import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseTrainingKeyboardShortcutsOptions {
  mode: 'input' | 'mcq' | 'tiles' | 'reverse-input';
  isActive: boolean;
  canSubmit: boolean;
  canSkip: boolean;
  onSubmit: () => void;
  onSkip?: () => void;
  onContinue?: () => void;
  mcqOptions?: Array<{ id: string; value: string }>;
  onSelectOption?: (index: number) => void;
  disableNumberKeys?: boolean;
}

/**
 * Centralized keyboard shortcuts for training modes.
 * Mirrors Monkeytype behavior for muscle-memory practice.
 */
export const useTrainingKeyboardShortcuts = ({
  mode,
  isActive,
  canSubmit,
  canSkip,
  onSubmit,
  onSkip,
  onContinue,
  mcqOptions = [],
  onSelectOption,
  disableNumberKeys = false,
}: UseTrainingKeyboardShortcutsOptions) => {
  const router = useRouter();
  const isTypingRef = useRef(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea (except Escape)
      const target = event.target as HTMLElement;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable;

      isTypingRef.current = isTyping;

      // Escape always returns home
      if (event.key === 'Escape') {
        event.preventDefault();
        router.push('/');
        return;
      }

      // Input mode shortcuts
      if (mode === 'input' || mode === 'reverse-input') {
        // Enter or Space to submit
        if ((event.key === 'Enter' || event.key === ' ') && canSubmit && !isTyping) {
          event.preventDefault();
          onSubmit();
          return;
        }

        // Tab to skip
        if (event.key === 'Tab' && canSkip && onSkip && !isTyping) {
          event.preventDefault();
          onSkip();
          return;
        }

        // Enter to continue after correct answer
        if (event.key === 'Enter' && onContinue && !isTyping) {
          event.preventDefault();
          onContinue();
          return;
        }
      }

      // MCQ/Tiles mode shortcuts
      if ((mode === 'mcq' || mode === 'tiles') && !disableNumberKeys) {
        // Number keys 1-4 to select option
        if (event.key >= '1' && event.key <= '4') {
          const index = parseInt(event.key, 10) - 1;
          if (index < mcqOptions.length && onSelectOption && !isTyping) {
            event.preventDefault();
            onSelectOption(index);
            return;
          }
        }

        // Enter to submit selected option (if applicable)
        if (event.key === 'Enter' && canSubmit && !isTyping) {
          event.preventDefault();
          onSubmit();
          return;
        }

        // Tab to skip
        if (event.key === 'Tab' && canSkip && onSkip && !isTyping) {
          event.preventDefault();
          onSkip();
          return;
        }
      }
    },
    [
      mode,
      isActive,
      canSubmit,
      canSkip,
      onSubmit,
      onSkip,
      onContinue,
      mcqOptions,
      onSelectOption,
      disableNumberKeys,
      router,
    ]
  );

  useEffect(() => {
    if (!isActive) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleKeyDown]);

  return { isTypingRef };
};

export default useTrainingKeyboardShortcuts;