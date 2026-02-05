'use client';
import { createElement, useEffect, useRef } from 'react';
import themeSets, {
  applyTheme,
  getWallpaperStyles,
  getThemeDefaultWallpaperId,
  // hexToHsl
} from '@/features/Preferences/data/themes';
import { getWallpaperById } from '@/features/Preferences/data/wallpapers';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import clsx from 'clsx';
import { useClick, useLong } from '@/shared/hooks/useAudio';
import { buttonBorderStyles } from '@/shared/lib/styles';
import { useState } from 'react';
import { Dice5 } from 'lucide-react';
import { Random } from 'random-js';
import { useCustomThemeStore } from '@/features/Preferences/store/useCustomThemeStore';
import CollapsibleSection from './CollapsibleSection';

const random = new Random();

const Themes = () => {
  const { playClick } = useClick();
  const { playLong } = useLong();
  const {
    addTheme: _addTheme,
    removeTheme: _removeTheme,
    themes: _themes,
  } = useCustomThemeStore();

  const [isAdding, _setIsAdding] = useState(true);
  const [_customTheme, _setCustomTheme] = useState({
    id: '',
    backgroundColor: '#240d2f',
    cardColor: '#321441',
    borderColor: '#49215e',
    mainColor: '#ea70ad',
    secondaryColor: '#ce89e6',
  });

  const selectedTheme = usePreferencesStore(state => state.theme);
  const setSelectedTheme = usePreferencesStore(state => state.setTheme);
  const themePreview = usePreferencesStore(state => state.themePreview);
  const selectedWallpaperId = usePreferencesStore(
    state => state.selectedWallpaperId,
  );
  const customWallpapers = usePreferencesStore(state => state.customWallpapers);

  // Initialize with first theme to avoid hydration mismatch
  const [randomTheme, setRandomTheme] = useState(themeSets[2].themes[0]);

  // Set random theme only on client side after mount
  const [_isMounted, setIsMounted] = useState(false);

  const [isHovered, setIsHovered] = useState('');

  // useRef is used to keep the value persistent without triggering re-renders
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  /* handleHover acts as a debouncer, so it applies the theme when the user stops on top of it.
   Without it, the theme would apply on every hover, causing lag.
 */
  const handleHover = (themeId: string) => {
    if (isAdding) return;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      applyTheme(themeId);
    }, 150);
  };
  /* 
  const handleCustomTheme = () => {
    // To keep the id same as the others themes (default)
    const themeId = customTheme.id.replaceAll(' ', '-').toLowerCase();

    if (themeId !== '') {
      addTheme({
        id: themeId,

        backgroundColor: hexToHsl(customTheme.backgroundColor),
        cardColor: hexToHsl(customTheme.cardColor),
        borderColor: hexToHsl(customTheme.borderColor),
        mainColor: hexToHsl(customTheme.mainColor),
        secondaryColor: hexToHsl(customTheme.secondaryColor)

      });

      // setSelectedTheme(themeId);

      // reset
      customTheme.id = '';
      customTheme.backgroundColor = '#240d2f';
      customTheme.cardColor = '#321441';
      customTheme.borderColor = '#49215e';
      customTheme.mainColor = '#ea70ad';
      customTheme.secondaryColor = '#ce89e6';

      setIsAdding(false);
    }
  };
 */
  useEffect(() => {
    setIsMounted(true);
    setRandomTheme(
      themeSets[2].themes[random.integer(0, themeSets[2].themes.length - 1)],
    );
  }, []);

  return (
    <div className='flex flex-col gap-6'>
      {/* <div className='flex gap-2'>
        <button
          className={clsx(
            'flex w-full flex-1 items-center justify-center gap-2 overflow-hidden p-6 md:w-1/2',
            buttonBorderStyles,
          )}
          onMouseEnter={() => setIsHovered(randomTheme.id)}
          onMouseLeave={() => setIsHovered('')}
          style={{
            color: randomTheme.mainColor,
            backgroundColor:
              isHovered === randomTheme.id
                ? randomTheme.borderColor
                : randomTheme.cardColor,
            borderWidth:
              process.env.NODE_ENV === 'development' ? '2px' : undefined,
            borderColor: randomTheme.borderColor,
          }}
          onClick={() => {
            playClick();
            const randomTheme =
              themeSets[2].themes[
                random.integer(0, themeSets[2].themes.length - 1)
              ];
            setRandomTheme(randomTheme);
            setSelectedTheme(randomTheme.id);
          }}
        >
          <span className='mb-0.5'>
            {randomTheme.id === selectedTheme ? '\u2B24 ' : ''}
          </span>
          <Dice5
            style={{
              color: randomTheme.secondaryColor,
            }}
          />
          Random Theme
        </button>
      </div> */}
      {themeSets.map((themeSet, i) => (
        <CollapsibleSection
          key={i}
          title={themeSet.name}
          icon={createElement(themeSet.icon, { size: 18 })}
          level='subsubsection'
          defaultOpen={true}
          storageKey={`prefs-theme-group-${themeSet.name.toLowerCase()}`}
        >
          {/* <span className='text-sm font-normal text-(--secondary-color)'>
              ({themeSet.themes.length})
            </span> */}
          <fieldset
            className={clsx(
              'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4',
            )}
          >
            {themeSet.themes.map(currentTheme => (
              <label
                key={currentTheme.id}
                className={clsx(
                  currentTheme.id === 'long' && 'col-span-full',
                  'flex items-center justify-center rounded-xl py-4 duration-275 hover:cursor-pointer',
                  'flex-1 overflow-hidden',
                  currentTheme.id === selectedTheme &&
                    'border-0 border-(--main-color)',
                )}
                style={{
                  color: currentTheme.mainColor,
                  ...(() => {
                    // Check if theme has a default wallpaper (premium themes)
                    const themeWallpaperId = getThemeDefaultWallpaperId(
                      currentTheme.id,
                    );
                    const wallpaperIdToUse =
                      themeWallpaperId || selectedWallpaperId;

                    if (wallpaperIdToUse) {
                      const wallpaper = getWallpaperById(
                        wallpaperIdToUse,
                        customWallpapers,
                      );
                      if (wallpaper) {
                        return getWallpaperStyles(
                          wallpaper.url,
                          isHovered === currentTheme.id,
                        );
                      }
                    }

                    // No wallpaper - use regular theme background
                    return {
                      background:
                        currentTheme.id === '?'
                          ? `linear-gradient(
                                142deg,
                                oklch(66.0% 0.18 25.0 / 1) 0%,
                                oklch(72.0% 0.22 80.0 / 1) 12%,
                                oklch(68.0% 0.20 145.0 / 1) 24%,
                                oklch(70.0% 0.19 200.0 / 1) 36%,
                                oklch(67.0% 0.18 235.0 / 1) 48%,
                                oklch(73.0% 0.22 290.0 / 1) 60%,
                                oklch(69.0% 0.21 330.0 / 1) 74%,
                                oklch(74.0% 0.20 355.0 / 1) 88%,
                                oklch(66.0% 0.18 25.0 / 1) 100%
                              )`
                          : isHovered === currentTheme.id
                            ? currentTheme.cardColor
                            : currentTheme.backgroundColor,
                    };
                  })(),
                  borderColor: currentTheme.borderColor,
                }}
                onMouseEnter={() => {
                  if (isAdding) return;
                  setIsHovered(currentTheme.id);
                  if (themePreview) handleHover(currentTheme.id);
                }}
                onMouseLeave={() => {
                  if (isAdding) return;
                  if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                  hoverTimeout.current = setTimeout(() => {
                    applyTheme(selectedTheme);
                  }, 150);
                  setIsHovered('');
                }}
                onClick={() => {
                  playClick();
                  if (currentTheme.id === 'long') playLong();
                }}
              >
                <input
                  type='radio'
                  name='selectedTheme'
                  onChange={() => {
                    setSelectedTheme(currentTheme.id);
                    // @ts-expect-error gtag fix
                    if (typeof window.gtag === 'function') {
                      // @ts-expect-error gtag fix
                      window.gtag(
                        'event',
                        process.env.NODE_ENV === 'production'
                          ? '(REAL USERS) Theme Button Clicks'
                          : '(Me Testing) Testing Theme Button Clicks',
                        {
                          event_category: 'Theme Change',
                          event_label: currentTheme.id,
                          value: 1,
                        },
                      );
                    }
                  }}
                  className='hidden'
                />
                {currentTheme.id === '?' ? (
                  <span className='relative flex w-full items-center justify-center text-center text-lg'>
                    <span
                      className={clsx(
                        'absolute left-1/2 -translate-x-1/2',
                        currentTheme.id === selectedTheme
                          ? 'text-black'
                          : 'text-transparent',
                      )}
                    >
                      {'\u2B24'}
                    </span>
                    <span className='opacity-0'>?</span>
                  </span>
                ) : (
                  <span className='flex items-center gap-1.5 text-center text-lg'>
                    <span className='text-(--secondary-color)'>
                      {currentTheme.id === selectedTheme ? '\u2B24 ' : ''}
                    </span>
                    {currentTheme.id === 'long'
                      ? 'long loooooooong theme'
                      : currentTheme.id.split('-').map((themeNamePart, i) => (
                          <span
                            key={`${currentTheme.id}-${i}`}
                            style={{
                              color:
                                process.env.NODE_ENV !== 'production'
                                  ? i === 0
                                    ? currentTheme.mainColor
                                    : currentTheme.secondaryColor
                                  : undefined,
                            }}
                          >
                            {i > 0 && ' '}
                            {themeNamePart}
                          </span>
                        ))}
                  </span>
                )}
              </label>
            ))}
          </fieldset>
        </CollapsibleSection>
      ))}

      {/* Custom Themes */}

      {/* <div>
        <div className='flex items-center justify-between mb-3'>
          <h4 className='text-lg font-semibold'>Your Custom Themes</h4>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className={clsx(
                'px-3 py-1.5 rounded-lg border-2 transition-colors hover:cursor-pointer',
                'border-(--border-color)',
                'hover:bg-(--border-color)',
                'flex items-center gap-2'
              )}
            >
              <Plus className='w-4 h-4' />
              New Theme
            </button>
          )}
        </div>
        {/* Add theme form */}
      {/* {isAdding && (
          <div
            className={clsx(
              'mb-4 p-4 rounded-xl border-2',
              'bg-(--card-color) border-(--border-color)'
            )}
          >
            <div className='space-y-3'>
              <div className='flex gap-3'>
                <input
                  type='text'
                  placeholder='* Theme name eg., Red Velvet or red-velvet'
                  value={customTheme.id}
                  onChange={e =>
                    setCustomTheme(prev => ({
                      ...prev,
                      id: e.target.value
                    }))
                  }
                  className={clsx(
                    'flex-1 px-3 py-2 rounded-lg border-2',
                    'bg-(--card-color) border-(--border-color)',
                    'text-(--main-color)'
                  )}
                />
              </div>
              <div className='flex flex-wrap justify-around gap-3 items-center'>
                <div className='flex items-center gap-2 flex-col'>
                  <input
                    type='color'
                    value={customTheme.backgroundColor}
                    onChange={e => {
                      const value = e.target.value;
                      setCustomTheme(prev => {
                        const updated = { ...prev, backgroundColor: value };
                        applyThemeObject(updated);
                        return updated;
                      });
                    }}
                    className={clsx(
                      'w-24 px-1.5 rounded-lg border-2',
                      'bg-(--card-color) border-(--border-color)',
                      'text-(--main-color)'
                    )}
                  />
                  <span className='text-sm text-(--secondary-color)'>
                    Background Color
                  </span>
                </div>
                <div className='flex items-center gap-2  flex-col'>
                  <input
                    type='color'
                    value={customTheme.cardColor}
                    onChange={e => {
                      const value = e.target.value;
                      setCustomTheme(prev => {
                        const updated = { ...prev, cardColor: value };
                        applyThemeObject(updated);
                        return updated;
                      });
                    }}
                    className={clsx(
                      'w-24 px-1.5 rounded-lg border-2',
                      'bg-(--card-color) border-(--border-color)',
                      'text-(--main-color)'
                    )}
                  />
                  <span className='text-sm text-(--secondary-color)'>
                    Card Color
                  </span>
                </div>
                <div className='flex items-center gap-2  flex-col'>
                  <input
                    type='color'
                    value={customTheme.borderColor}
                    onChange={e => {
                      const value = e.target.value;
                      setCustomTheme(prev => {
                        const updated = { ...prev, borderColor: value };
                        applyThemeObject(updated);
                        return updated;
                      });
                    }}
                    className={clsx(
                      'w-24 px-1.5 rounded-lg border-2',
                      'bg-(--card-color) border-(--border-color)',
                      'text-(--main-color)'
                    )}
                  />
                  <span className='text-sm text-(--secondary-color)'>
                    Border Color
                  </span>
                </div>
                <div className='flex items-center gap-2  flex-col'>
                  <input
                    type='color'
                    value={customTheme.mainColor}
                    onChange={e => {
                      const value = e.target.value;
                      setCustomTheme(prev => {
                        const updated = { ...prev, mainColor: value };
                        applyThemeObject(updated);
                        return updated;
                      });
                    }}
                    className={clsx(
                      'w-24 px-1.5 rounded-lg border-2',
                      'bg-(--card-color) border-(--border-color)',
                      'text-(--main-color)'
                    )}
                  />
                  <span className='text-sm text-(--secondary-color)'>
                    Main Color
                  </span>
                </div>
                <div className='flex items-center gap-2  flex-col'>
                  <input
                    type='color'
                    value={customTheme.secondaryColor}
                    onChange={e => {
                      const value = e.target.value;
                      setCustomTheme(prev => {
                        const updated = { ...prev, secondaryColor: value };
                        applyThemeObject(updated);
                        return updated;
                      });
                    }}
                    className={clsx(
                      'w-24 px-1.5 rounded-lg border-2',
                      'bg-(--card-color) border-(--border-color)',
                      'text-(--main-color)'
                    )}
                  />
                  <span className='text-sm text-(--secondary-color)'>
                    Secondary Color
                  </span>
                </div>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={handleCustomTheme}
                  className={clsx(
                    'flex-1 px-4 py-2 rounded-lg transition-opacity hover:cursor-pointer',
                    'bg-(--main-color) text-(--background-color)',
                    'hover:opacity-90'
                  )}
                >
                  Create Theme
                </button>
                <button
                  onClick={() => {
                    applyTheme(selectedTheme);
                    setCustomTheme({
                      id: '',
                      backgroundColor: '#240d2f',
                      cardColor: '#321441',
                      borderColor: '#49215e',
                      mainColor: '#ea70ad',
                      secondaryColor: '#ce89e6'
                    });
                    setIsAdding(false);
                  }}
                  className={clsx(
                    'px-4 py-2 border-2 rounded-lg transition-colors hover:cursor-pointer',
                    'border-(--border-color)',
                    'hover:bg-(--border-color)'
                  )}
                >
                  Cancel
                </button>
              </div>
              <p className='text-sm text-(--secondary-color) text-center py-2'>
                Check the{' '}
                <a
                  className='text-(--main-color) font-bold underline'
                  target='_blank'
                  rel='noopener noreferrer'
                  href='https://github.com/lingdojo/kana-dojo/blob/main/docs/UI_DESIGN.md#theming-system'
                >
                  UI_DESIGN
                </a>{' '}
                documentation for better understanding of the{' '}
                <span className='text-(--main-color)'>theming system</span>{' '}
                and{' '}
                <span className='text-(--main-color)'>accessibility</span>
              </p>
            </div>
          </div>
        )} */}
      {/* Custom themes list */}
      {/* {themes.length > 0 ? (
          <fieldset
            className={clsx(
              'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            )}
          >
            {themes.map(currentTheme => (
              <label
                key={currentTheme.id}
                style={{
                  color: currentTheme.mainColor,
                  backgroundColor:
                    isHovered === currentTheme.id
                      ? currentTheme.cardColor
                      : currentTheme.backgroundColor,
                  borderWidth:
                    process.env.NODE_ENV === 'development' ? '2px' : undefined,
                  borderColor: currentTheme.borderColor
                }}
                onMouseEnter={() => {
                  setIsHovered(currentTheme.id);
                  if (themePreview) handleHover(currentTheme.id);
                }}
                onMouseLeave={() => {
                  if (isAdding) return;
                  if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                  hoverTimeout.current = setTimeout(() => {
                    applyTheme(selectedTheme);
                  }, 150);
                  setIsHovered('');
                }}
                className={clsx(
                  currentTheme.id === 'long' && 'col-span-full',
                  'py-4 flex justify-center items-center',
                  'flex-1 overflow-hidden border-(--background-color)',
                  buttonBorderStyles,
                  currentTheme.id === selectedTheme &&
                    'border-2 border-(--main-color)'
                )}
                onClick={() => {
                  playClick();
                }}
              >
                <input
                  type='radio'
                  name='selectedTheme'
                  onChange={() => {
                    setSelectedTheme(currentTheme.id);
                    // @ts-expect-error gtag fix
                    if (typeof window.gtag === 'function') {
                      // @ts-expect-error gtag fix
                      window.gtag(
                        'event',
                        process.env.NODE_ENV === 'production'
                          ? '(REAL USERS) Theme Button Clicks'
                          : '(Me Testing) Testing Theme Button Clicks',
                        {
                          event_category: 'Theme Change',
                          event_label: currentTheme.id,
                          value: 1
                        }
                      );
                    }
                  }}
                  className='hidden'
                />
                <div className='flex w-full justify-around items-center'>
                  <span className='text-center text-lg flex items-center gap-1.5'>
                    <span className='text-(--secondary-color)'>
                      {currentTheme.id === selectedTheme ? '\u2B24 ' : ''}
                    </span>
                    {currentTheme.id.split('-').map((themeNamePart, i) => (
                      <span
                        key={`${currentTheme.id}-custom-${i}`}
                        style={{
                          color:
                            process.env.NODE_ENV !== 'production'
                              ? i === 0
                                ? currentTheme.mainColor
                                : currentTheme.secondaryColor
                              : undefined
                        }}
                      >
                        {i > 0 && ' '}
                        {themeNamePart}
                      </span>
                    ))}
                  </span>
                  <button
                    onClick={() => {
                      removeTheme(currentTheme.id);
                      const randomTheme =
                        themeSets[2].themes[
                          random.integer(0, themeSets[2].themes.length - 1)
                        ];
                      setRandomTheme(randomTheme);
                      setSelectedTheme(randomTheme.id);
                    }}
                    className='p-2 text-red-500 hover:bg-red-500 hover:text-(--card-color) hover:bg-opacity-10 rounded transition-colors hover:cursor-pointer'
                    title='Delete theme'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </label>
            ))}
          </fieldset>
        ) : (
          <p className='text-sm text-(--secondary-color) text-center py-8'>
            No custom themes yet. Create one to get started!
          </p>
        )}
      </div> */}
    </div>
  );
};

export default Themes;
