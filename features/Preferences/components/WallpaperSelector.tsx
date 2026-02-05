'use client';
import { useState } from 'react';
import { CURATED_WALLPAPERS, type Wallpaper } from '../data/wallpapers';
import usePreferencesStore from '../store/usePreferencesStore';
import { useClick } from '@/shared/hooks/useAudio';
import { Plus, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { buttonBorderStyles } from '@/shared/lib/styles';

const WallpaperSelector = () => {
  const { playClick } = useClick();
  const {
    selectedWallpaperId,
    setSelectedWallpaper,
    customWallpapers,
    addCustomWallpaper,
    removeCustomWallpaper,
    clearWallpaper,
  } = usePreferencesStore();

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const allWallpapers = [...CURATED_WALLPAPERS, ...customWallpapers];

  const handleAddCustom = () => {
    const success = addCustomWallpaper(customName, customUrl);
    if (success) {
      setCustomName('');
      setCustomUrl('');
      setUrlError('');
      setIsAddingCustom(false);
      playClick();
    } else {
      setUrlError(
        'Invalid image URL. Please use a direct link ending in .jpg, .png, .webp, or .gif',
      );
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* Header with clear button */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-(--main-color)'>
          Background Wallpaper
        </h3>
        {selectedWallpaperId && (
          <button
            onClick={() => {
              clearWallpaper();
              playClick();
            }}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-sm hover:cursor-pointer',
              buttonBorderStyles,
            )}
          >
            Clear Wallpaper
          </button>
        )}
      </div>

      {/* Wallpaper grid */}
      <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>
        {allWallpapers.map(wallpaper => (
          <div
            key={wallpaper.id}
            className={clsx(
              'group relative cursor-pointer overflow-hidden rounded-lg border-2',
              selectedWallpaperId === wallpaper.id
                ? 'border-(--main-color)'
                : 'border-(--border-color)',
            )}
            onClick={() => {
              setSelectedWallpaper(wallpaper.id);
              playClick();
            }}
          >
            {/* Wallpaper preview */}
            <div
              className='aspect-video bg-cover bg-center'
              style={{ backgroundImage: `url('${wallpaper.url}')` }}
            />

            {/* Overlay with name and delete button */}
            <div className='absolute inset-0 flex flex-col justify-between bg-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100'>
              <div className='text-sm font-medium text-white'>
                {wallpaper.name}
              </div>
              {wallpaper.isUserAdded && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removeCustomWallpaper(wallpaper.id);
                    playClick();
                  }}
                  className='self-end rounded-md bg-red-500/80 p-1.5 hover:bg-red-500'
                >
                  <Trash2 size={16} className='text-white' />
                </button>
              )}
            </div>

            {/* Selected indicator */}
            {selectedWallpaperId === wallpaper.id && (
              <div className='absolute top-2 left-2 h-3 w-3 rounded-full bg-(--main-color)' />
            )}
          </div>
        ))}

        {/* Add custom wallpaper button */}
        <button
          onClick={() => {
            setIsAddingCustom(true);
            playClick();
          }}
          className={clsx(
            'flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed hover:cursor-pointer hover:bg-(--card-color)',
            buttonBorderStyles,
          )}
        >
          <Plus size={24} className='text-(--secondary-color)' />
          <span className='text-sm text-(--secondary-color)'>Add Custom</span>
        </button>
      </div>

      {/* Add custom wallpaper modal */}
      {isAddingCustom && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
          <div className='mx-4 w-full max-w-md rounded-xl border-2 border-(--border-color) bg-(--background-color) p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h4 className='text-xl font-semibold text-(--main-color)'>
                Add Custom Wallpaper
              </h4>
              <button
                onClick={() => {
                  setIsAddingCustom(false);
                  setUrlError('');
                  playClick();
                }}
                className='rounded-lg p-2 hover:bg-(--card-color)'
              >
                <X size={20} className='text-(--secondary-color)' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='mb-1.5 block text-sm text-(--secondary-color)'>
                  Name
                </label>
                <input
                  type='text'
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder='e.g., My Favorite Wallpaper'
                  className='w-full rounded-lg border-2 border-(--border-color) bg-(--card-color) px-3 py-2 text-(--main-color) placeholder:text-(--secondary-color)/50'
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm text-(--secondary-color)'>
                  Image URL *
                </label>
                <input
                  type='url'
                  value={customUrl}
                  onChange={e => {
                    setCustomUrl(e.target.value);
                    setUrlError('');
                  }}
                  placeholder='https://example.com/image.jpg'
                  className='w-full rounded-lg border-2 border-(--border-color) bg-(--card-color) px-3 py-2 text-(--main-color) placeholder:text-(--secondary-color)/50'
                />
                {urlError && (
                  <p className='mt-1 text-sm text-red-500'>{urlError}</p>
                )}
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={handleAddCustom}
                  disabled={!customUrl.trim()}
                  className={clsx(
                    'flex-1 rounded-lg px-4 py-2 font-medium',
                    customUrl.trim()
                      ? 'cursor-pointer bg-(--main-color) text-(--background-color) hover:opacity-90'
                      : 'cursor-not-allowed bg-(--border-color) text-(--secondary-color)',
                  )}
                >
                  Add Wallpaper
                </button>
                <button
                  onClick={() => {
                    setIsAddingCustom(false);
                    setUrlError('');
                    playClick();
                  }}
                  className={clsx(
                    'cursor-pointer rounded-lg border-2 border-(--border-color) px-4 py-2 hover:bg-(--card-color)',
                  )}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WallpaperSelector;
