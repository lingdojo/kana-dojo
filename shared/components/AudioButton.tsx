'use client';
import { useJapaneseTTS } from '@/shared/hooks/useJapaneseTTS';
import { Volume2, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { buttonBorderStyles } from '@/shared/lib/styles';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'icon-only';
  disabled?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
}

const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  className,
  size = 'md',
  variant = 'default',
  disabled = false,
  onPlay,
  onStop
}) => {
  const { speak, stop, isPlaying, isSupported, refreshVoices } =
    useJapaneseTTS();

  // Get pronunciation settings from theme store
  const pronunciationEnabled = usePreferencesStore(
    state => state.pronunciationEnabled
  );
  const pronunciationSpeed = usePreferencesStore(
    state => state.pronunciationSpeed
  );
  const pronunciationPitch = usePreferencesStore(
    state => state.pronunciationPitch
  );

  const handleClick = async () => {
    if (disabled || !pronunciationEnabled) return;

    if (isPlaying) {
      stop();
      onStop?.();
    } else {
      onPlay?.();

      // Refresh voices before speaking
      if (typeof window !== 'undefined') {
        refreshVoices();
        // Firefox needs longer delay to ensure voices are loaded
        const isFirefox = /Firefox/i.test(navigator.userAgent);
        const delay = isFirefox ? 300 : 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await speak(text, {
        rate: pronunciationSpeed,
        pitch: pronunciationPitch,
        volume: 0.8
      });
    }
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  // Don't render if pronunciation is disabled
  if (!pronunciationEnabled) {
    return null;
  }

  // Show working button even if TTS support is not detected
  if (!isSupported) {
    return (
      <button
        onClick={handleClick}
        className={clsx(
          'rounded-full transition-all duration-200',
          ' active:scale-95',
          'flex items-center justify-center',
          sizeClasses[size],
          className
        )}
        title='Try pronunciation (may work in some browsers)'
      >
        <Volume2 size={iconSizes[size]} />
      </button>
    );
  }

  const getIcon = () => {
    if (isPlaying) {
      return <Loader2 size={iconSizes[size]} className='animate-spin' />;
    }
    return <Volume2 size={iconSizes[size]} />;
  };

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={clsx(
          'rounded-full transition-all duration-275',
          'active:scale-95 hover:cursor-pointer hover:bg-[var(--border-color)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center',
          sizeClasses[size],
          className
        )}
        title={`${isPlaying ? 'Stop' : 'Play'} pronunciation: ${text}`}
      >
        {getIcon()}
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={clsx(
          'flex items-center gap-2 transition-all duration-200',
          'hover:opacity-80 active:opacity-60',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        title={`${isPlaying ? 'Stop' : 'Play'} pronunciation: ${text}`}
      >
        {getIcon()}
        <span>{isPlaying ? 'Stop' : 'Play'}</span>
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        buttonBorderStyles,
        'flex items-center gap-2 transition-all duration-200',
        'hover:scale-105 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'text-[var(--secondary-color)]',
        'flex-1 overflow-hidden',
        sizeClasses[size],
        className
      )}
      title={`${isPlaying ? 'Stop' : 'Play'} pronunciation: ${text}`}
    >
      {getIcon()}
      <span>{isPlaying ? 'Stop' : 'Play'} Audio</span>
    </button>
  );
};

export default AudioButton;
