'use client';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';
import { Volume2, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { buttonBorderStyles } from '@/shared/utils/styles';
import { useAudioPreferences } from '@/features/Preferences';

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'icon-only';
  disabled?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
  autoPlay?: boolean;
  autoPlayTrigger?: string | number;
}

const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  className,
  size = 'md',
  variant = 'default',
  disabled = false,
  onPlay,
  onStop,
  autoPlay = false,
  autoPlayTrigger,
}) => {
  const { speak, stop, isPlaying, isSupported, refreshVoices } =
    useJapaneseTTS();

  // Get pronunciation settings from theme store
  const {
    pronunciationEnabled,
    pronunciationSpeed,
    pronunciationPitch,
    pronunciationAutoPlay,
  } = useAudioPreferences();

  const playPronunciation = useCallback(async () => {
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
      volume: 0.8,
    });
  }, [
    onPlay,
    pronunciationPitch,
    pronunciationSpeed,
    refreshVoices,
    speak,
    text,
  ]);

  const handleClick = useCallback(async () => {
    if (disabled || !pronunciationEnabled) return;

    if (isPlaying) {
      stop();
      onStop?.();
    } else {
      await playPronunciation();
    }
  }, [
    disabled,
    isPlaying,
    onStop,
    playPronunciation,
    pronunciationEnabled,
    stop,
  ]);

  const hasAutoPlayedRef = useRef(false);

  useEffect(() => {
    hasAutoPlayedRef.current = false;
  }, [autoPlayTrigger, text]);

  useEffect(() => {
    if (
      !autoPlay ||
      !pronunciationAutoPlay ||
      !isSupported ||
      hasAutoPlayedRef.current
    ) {
      return;
    }

    hasAutoPlayedRef.current = true;

    const runAutoPlay = async () => {
      if (disabled || !pronunciationEnabled) return;
      if (isPlaying) {
        stop();
      }
      await playPronunciation();
    };

    void runAutoPlay();
  }, [
    autoPlay,
    autoPlayTrigger,
    disabled,
    isPlaying,
    isSupported,
    playPronunciation,
    pronunciationAutoPlay,
    pronunciationEnabled,
    stop,
    text,
  ]);

  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg',
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 24,
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
          'active:scale-95',
          'flex items-center justify-center',
          sizeClasses[size],
          className,
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
          'hover:cursor-pointer hover:bg-(--border-color) active:scale-95',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'flex items-center justify-center',
          sizeClasses[size],
          className,
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
          'disabled:cursor-not-allowed disabled:opacity-50',
          sizeClasses[size],
          className,
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
        'disabled:cursor-not-allowed disabled:opacity-50',
        'text-(--secondary-color)',
        'flex-1 overflow-hidden',
        sizeClasses[size],
        className,
      )}
      title={`${isPlaying ? 'Stop' : 'Play'} pronunciation: ${text}`}
    >
      {getIcon()}
      <span>{isPlaying ? 'Stop' : 'Play'} Audio</span>
    </button>
  );
};

export default AudioButton;

