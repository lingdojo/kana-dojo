'use client';
import { useAudioPreferences } from '@/features/Preferences';

interface SSRAudioButtonProps {
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

const SSRAudioButton: React.FC<SSRAudioButtonProps> = _props => {
  const { pronunciationEnabled } = useAudioPreferences();

  if (!pronunciationEnabled) {
    return null;
  }

  // TODO: Re-enable by rendering AudioButton once pronunciation UX is finalized.
  return null;
};

export default SSRAudioButton;
