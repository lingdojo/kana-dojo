'use client';

import { useEffect, useRef } from 'react';

const ADSENSE_CLIENT_ID = 'ca-pub-5494430364707020';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, never>>;
  }
}

interface AdSenseDisplayProps {
  slot: string;
  className?: string;
}

const isAdSenseEnabled =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

export default function AdSenseDisplay({
  slot,
  className,
}: AdSenseDisplayProps) {
  const hasRequestedAd = useRef(false);

  useEffect(() => {
    if (!isAdSenseEnabled || !slot || hasRequestedAd.current) return;

    hasRequestedAd.current = true;
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  }, [slot]);

  if (!isAdSenseEnabled || !slot) return null;

  return (
    <ins
      className={`adsbygoogle block w-full ${className ?? ''}`}
      style={{ display: 'block' }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format='auto'
      data-full-width-responsive='true'
      aria-label='Advertisement'
    />
  );
}
