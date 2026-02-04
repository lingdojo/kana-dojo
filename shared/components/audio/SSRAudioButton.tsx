'use client';
import { useState, useEffect } from 'react';
import AudioButton from './AudioButton';
import { useAudioPreferences } from '@/features/Preferences';

interface SSRAudioButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'icon-only';
  disabled?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
}

const SSRAudioButton: React.FC<SSRAudioButtonProps> = props => {
  const [isClient, setIsClient] = useState(false);
  const { pronunciationEnabled } = useAudioPreferences();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render during SSR to prevent hydration mismatches
  if (!isClient) {
    return null;
  }

  // If pronunciation is disabled, show a placeholder
  if (!pronunciationEnabled) {
    return (
      <div className='rounded border p-2 text-xs text-(--border-color)'>
        Audio disabled
      </div>
    );
  }

  return <AudioButton {...props} />;
};

export default SSRAudioButton;
