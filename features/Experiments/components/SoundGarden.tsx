'use client';
import { useEffect, useState, useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import clsx from 'clsx';
import { useCorrect } from '@/shared/hooks/useAudio';
import { hiraganaOnly } from '../data/kanaData';

interface GardenTile {
  kana: string;
  romanji: string;
  isActive: boolean;
}

const SoundGarden = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [tiles, setTiles] = useState<GardenTile[]>([]);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const { playCorrect } = useCorrect();

  useEffect(() => {
    setIsMounted(true);
    // Use first 20 hiragana for the garden
    const gardenKana = hiraganaOnly.slice(0, 20).map(k => ({
      kana: k.kana,
      romanji: k.romanji,
      isActive: false,
    }));
    setTiles(gardenKana);
  }, []);

  const handleTileClick = useCallback(
    (index: number) => {
      playCorrect();
      setLastPlayed(tiles[index]?.romanji || null);

      setTiles(prev =>
        prev.map((tile, i) => ({
          ...tile,
          isActive: i === index,
        })),
      );

      // Reset active state after animation
      setTimeout(() => {
        setTiles(prev =>
          prev.map(tile => ({
            ...tile,
            isActive: false,
          })),
        );
      }, 300);
    },
    [tiles, playCorrect],
  );

  if (!isMounted) return null;

  return (
    <div className='flex min-h-[80vh] flex-1 flex-col items-center justify-center gap-8'>
      {/* Header */}
      <div className='text-center'>
        <h1 className='flex items-center justify-center gap-2 text-2xl text-(--main-color) md:text-3xl'>
          <Volume2 size={28} />
          Sound Garden
        </h1>
        <p className='mt-2 text-(--secondary-color)'>
          Tap the kana to hear their sounds
        </p>
      </div>

      {/* Last played indicator */}
      {lastPlayed && (
        <div className='text-lg text-(--secondary-color)'>
          Last: <span className='text-(--main-color)'>{lastPlayed}</span>
        </div>
      )}

      {/* Kana grid */}
      <div className='grid grid-cols-5 gap-3 md:gap-4'>
        {tiles.map((tile, index) => (
          <button
            key={tile.kana}
            onClick={() => handleTileClick(index)}
            className={clsx(
              'h-14 w-14 rounded-xl md:h-16 md:w-16',
              'border-2 border-(--border-color) bg-(--card-color)',
              'flex flex-col items-center justify-center',
              'transition-all duration-150 hover:cursor-pointer',
              'hover:scale-105 hover:border-(--main-color)',
              'active:scale-95',
              tile.isActive &&
                'scale-110 border-(--main-color) bg-(--main-color)',
            )}
          >
            <span
              lang='ja'
              className={clsx(
                'text-2xl transition-colors md:text-3xl',
                tile.isActive
                  ? 'text-(--background-color)'
                  : 'text-(--main-color)',
              )}
            >
              {tile.kana}
            </span>
            <span
              className={clsx(
                'text-xs transition-colors',
                tile.isActive
                  ? 'text-(--background-color)'
                  : 'text-(--secondary-color)',
              )}
            >
              {tile.romanji}
            </span>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <p className='text-center text-sm text-(--secondary-color)'>
        Create melodies by tapping different kana in sequence
      </p>
    </div>
  );
};

export default SoundGarden;
