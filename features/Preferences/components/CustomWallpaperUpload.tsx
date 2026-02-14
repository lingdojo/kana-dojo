'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import {
  Upload,
  Link2,
  X,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  ImagePlus,
  ArrowRight,
} from 'lucide-react';
import { useCustomWallpaperStore } from '@/features/Preferences/store/useCustomWallpaperStore';
import {
  processImageForWallpaper,
  nameToId,
  ensureUniqueId,
  formatBytes,
  MAX_CUSTOM_WALLPAPERS,
  type ProcessingProgress,
  type ProcessingStatus,
} from '@/features/Preferences/lib/imageProcessor';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { applyTheme } from '@/features/Preferences/data/themes';
import { useClick } from '@/shared/hooks/useAudio';

// ============================================================================
// Sub-components
// ============================================================================

/** Animated progress bar with gradient and stage labels */
function ProcessingProgressBar({ progress }: { progress: ProcessingProgress }) {
  const statusLabels: Record<ProcessingStatus, string> = {
    idle: '',
    loading: 'Loading',
    validating: 'Validating',
    resizing: 'Resizing',
    converting: 'Converting',
    'generating-thumbnail': 'Thumbnail',
    saving: 'Saving',
    complete: 'Done!',
    error: 'Error',
  };

  const isError = progress.status === 'error';
  const isComplete = progress.status === 'complete';
  const isActive = !isError && !isComplete && progress.status !== 'idle';

  return (
    <div className='w-full space-y-2'>
      {/* Stage indicator */}
      <div className='flex items-center justify-between text-sm'>
        <span
          className={clsx(
            'flex items-center gap-1.5 font-medium',
            isError && 'text-red-400',
            isComplete && 'text-green-400',
            isActive && 'text-(--main-color)',
          )}
        >
          {isActive && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
          {isComplete && <Check className='h-3.5 w-3.5' />}
          {isError && <AlertCircle className='h-3.5 w-3.5' />}
          {statusLabels[progress.status]}
        </span>
        {isActive && (
          <span className='text-(--secondary-color) tabular-nums'>
            {progress.progress}%
          </span>
        )}
      </div>

      {/* Progress bar track */}
      <div
        className={clsx(
          'h-2 w-full overflow-hidden rounded-full',
          'bg-(--border-color)',
        )}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            isError && 'bg-red-500',
            isComplete && 'bg-green-500',
            isActive &&
              'bg-linear-to-r from-(--main-color) to-(--secondary-color)',
          )}
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {/* Detailed message */}
      <p
        className={clsx(
          'text-xs',
          isError ? 'text-red-400' : 'text-(--secondary-color)',
        )}
      >
        {progress.message}
      </p>
    </div>
  );
}

/** Existing custom wallpaper theme cards with delete */
function CustomWallpaperCard({
  wallpaper,
  isSelected,
  onSelect,
  onDelete,
}: {
  wallpaper: {
    id: string;
    name: string;
    thumbnailDataUrl: string;
    sizeBytes: number;
  };
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { playClick } = useClick();

  return (
    <div className='group relative'>
      <label
        className={clsx(
          'flex cursor-pointer items-center justify-center overflow-hidden rounded-xl py-4',
          'transition-all duration-200',
        )}
        style={{
          backgroundImage: `url('${wallpaper.thumbnailDataUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: isHovered ? 'brightness(1)' : 'brightness(0.85)',
          outline: isSelected ? '3px solid oklch(85% 0 0)' : 'none',
          transition: 'filter 275ms, outline 150ms',
          minHeight: '80px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          playClick();
          onSelect();
        }}
      >
        <input
          type='radio'
          name='selectedTheme'
          className='hidden'
          onChange={onSelect}
        />
        {/* Invisible text — consistent with premium theme rendering */}
        <span className='invisible text-lg text-white'>{wallpaper.name}</span>
      </label>

      {/* Delete button — appears on hover */}
      <div
        className={clsx(
          'absolute -top-1.5 -right-1.5 transition-opacity duration-200',
          'opacity-0 group-hover:opacity-100',
        )}
      >
        {showConfirmDelete ? (
          <div className='flex gap-1'>
            <button
              onClick={e => {
                e.stopPropagation();
                playClick();
                onDelete();
                setShowConfirmDelete(false);
              }}
              className={clsx(
                'rounded-full bg-red-600 p-1 text-white shadow-lg',
                'transition-colors hover:cursor-pointer hover:bg-red-700',
              )}
              title='Confirm delete'
            >
              <Check className='h-3.5 w-3.5' />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                playClick();
                setShowConfirmDelete(false);
              }}
              className={clsx(
                'rounded-full p-1 text-white shadow-lg',
                'bg-(--border-color)',
                'transition-colors hover:cursor-pointer hover:bg-(--card-color)',
              )}
              title='Cancel'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </div>
        ) : (
          <button
            onClick={e => {
              e.stopPropagation();
              playClick();
              setShowConfirmDelete(true);
            }}
            className={clsx(
              'rounded-full bg-red-600/80 p-1 text-white shadow-lg backdrop-blur-sm',
              'transition-colors hover:cursor-pointer hover:bg-red-600',
            )}
            title='Delete custom theme'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </button>
        )}
      </div>

      {/* Name tooltip on hover */}
      <div
        className={clsx(
          'pointer-events-none absolute inset-x-0 bottom-0 flex justify-center',
          'transition-opacity duration-200',
          'opacity-0 group-hover:opacity-100',
        )}
      >
        <span className='rounded-t-md bg-black/70 px-2 py-0.5 text-xs text-white backdrop-blur-sm'>
          {wallpaper.name}
          <span className='ml-1.5 text-white/60'>
            ({formatBytes(wallpaper.sizeBytes)})
          </span>
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

/**
 * Custom wallpaper upload UI for creating user-defined Premium themes.
 *
 * Provides:
 * - URL input with submit button (Enter key support)
 * - Drag-and-drop zone with file browser fallback
 * - Animated progress bar
 * - Error handling with actionable messages
 * - Preview grid of existing custom wallpaper themes
 */
export default function CustomWallpaperUpload() {
  const { playClick } = useClick();

  // Store state
  const { wallpapers, addWallpaper, removeWallpaper, initializeObjectUrls } =
    useCustomWallpaperStore();
  const selectedTheme = usePreferencesStore(state => state.theme);
  const setSelectedTheme = usePreferencesStore(state => state.setTheme);

  // Local state
  const [urlInput, setUrlInput] = useState('');
  const [progress, setProgress] = useState<ProcessingProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Initialize object URLs on mount
  useEffect(() => {
    initializeObjectUrls();
  }, [initializeObjectUrls]);

  const isProcessing =
    progress.status !== 'idle' &&
    progress.status !== 'complete' &&
    progress.status !== 'error';

  const isAtLimit = wallpapers.length >= MAX_CUSTOM_WALLPAPERS;

  // -----------------------------------------------------------------------
  // Core processing logic
  // -----------------------------------------------------------------------

  const handleProcess = useCallback(
    async (source: File | string) => {
      if (isProcessing) return;

      if (isAtLimit) {
        setProgress({
          status: 'error',
          progress: 0,
          message: `Maximum of ${MAX_CUSTOM_WALLPAPERS} custom wallpapers reached. Remove one to add another.`,
          error: `Limit of ${MAX_CUSTOM_WALLPAPERS} reached.`,
        });
        return;
      }

      try {
        const processed = await processImageForWallpaper(source, setProgress);

        setProgress({
          status: 'saving',
          progress: 90,
          message: 'Saving to local storage…',
        });

        // Generate unique ID
        const existingIds = new Set(wallpapers.map(w => w.id));
        const baseId = nameToId(processed.name);
        const id = ensureUniqueId(baseId, existingIds);

        await addWallpaper(
          {
            id,
            name: processed.name,
            createdAt: Date.now(),
            originalSource: typeof source === 'string' ? 'url' : 'file',
            originalName: typeof source === 'string' ? source : source.name,
            width: processed.width,
            height: processed.height,
            sizeBytes: processed.sizeBytes,
            thumbnailDataUrl: processed.thumbnailDataUrl,
          },
          processed.blob,
        );

        setProgress({
          status: 'complete',
          progress: 100,
          message: `"${processed.name}" added successfully! (${formatBytes(processed.sizeBytes)})`,
        });

        // Auto-select the new theme
        setSelectedTheme(id);

        // Clear URL input
        setUrlInput('');

        // Auto-dismiss success after 4 seconds
        setTimeout(() => {
          setProgress(prev =>
            prev.status === 'complete'
              ? { status: 'idle', progress: 0, message: '' }
              : prev,
          );
        }, 4000);
      } catch {
        // Error is already reported via onProgress in processImageForWallpaper
      }
    },
    [isProcessing, isAtLimit, wallpapers, addWallpaper, setSelectedTheme],
  );

  // -----------------------------------------------------------------------
  // URL submission
  // -----------------------------------------------------------------------

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    // Basic URL validation
    try {
      const url = new URL(trimmed);
      if (!['http:', 'https:'].includes(url.protocol)) {
        setProgress({
          status: 'error',
          progress: 0,
          message: 'Please enter a valid HTTP or HTTPS URL.',
          error: 'Invalid protocol.',
        });
        return;
      }
    } catch {
      setProgress({
        status: 'error',
        progress: 0,
        message: 'Please enter a valid image URL (starting with https://).',
        error: 'Invalid URL.',
      });
      return;
    }

    playClick();
    handleProcess(trimmed);
  };

  // -----------------------------------------------------------------------
  // File / Drag-and-drop handlers
  // -----------------------------------------------------------------------

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setProgress({
        status: 'error',
        progress: 0,
        message: `"${file.name}" is not an image. Please select a JPEG, PNG, or WebP file.`,
        error: 'Not an image file.',
      });
      return;
    }

    playClick();
    handleProcess(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isProcessing) return;
    handleFiles(e.dataTransfer.files);
  };

  // -----------------------------------------------------------------------
  // Delete handler
  // -----------------------------------------------------------------------

  const handleDelete = async (id: string) => {
    await removeWallpaper(id);
    // If user was using this theme, fall back to a default
    if (selectedTheme === id) {
      setSelectedTheme('sapphire-bloom');
      applyTheme('sapphire-bloom');
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className='mt-4 space-y-4'>
      {/* Section heading */}
      <div className='flex items-center gap-2'>
        <ImagePlus size={16} className='text-(--secondary-color)' />
        <h4 className='text-base font-semibold text-(--main-color)'>Custom</h4>
        <span className='text-xs text-(--secondary-color)'>
          ({wallpapers.length}/{MAX_CUSTOM_WALLPAPERS})
        </span>
      </div>

      {/* Existing custom wallpaper theme cards */}
      {wallpapers.length > 0 && (
        <fieldset
          className={clsx(
            'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4',
            'p-1', // Padding to prevent outline clipping
          )}
        >
          {wallpapers.map(wallpaper => (
            <CustomWallpaperCard
              key={wallpaper.id}
              wallpaper={wallpaper}
              isSelected={selectedTheme === wallpaper.id}
              onSelect={() => {
                setSelectedTheme(wallpaper.id);
              }}
              onDelete={() => handleDelete(wallpaper.id)}
            />
          ))}
        </fieldset>
      )}

      {/* URL Input */}
      <div className='space-y-3'>
        <div className='flex gap-2'>
          <div
            className={clsx(
              'flex flex-1 items-center gap-2 rounded-lg border-2 px-3 py-2',
              'border-(--border-color) bg-(--card-color)',
              'transition-colors focus-within:border-(--main-color)',
            )}
          >
            <Link2 className='h-4 w-4 shrink-0 text-(--secondary-color)' />
            <input
              ref={urlInputRef}
              type='url'
              placeholder='Paste image URL (https://…)'
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
              disabled={isProcessing || isAtLimit}
              style={{ outline: 'none', boxShadow: 'none' }}
              className={clsx(
                'w-full appearance-none bg-transparent text-sm outline-none',
                'text-(--main-color)',
                'placeholder:text-(--secondary-color)/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'focus:shadow-none focus:ring-0 focus:outline-none focus-visible:outline-none',
              )}
            />
            {urlInput && !isProcessing && (
              <button
                onClick={() => setUrlInput('')}
                className='text-(--secondary-color) hover:cursor-pointer hover:text-(--main-color)'
                title='Clear'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
          <button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim() || isProcessing || isAtLimit}
            className={clsx(
              'flex items-center gap-1.5 rounded-lg px-4 py-2',
              'text-sm font-medium transition-all',
              'hover:cursor-pointer',
              'disabled:cursor-not-allowed disabled:opacity-40',
              urlInput.trim() && !isProcessing && !isAtLimit
                ? 'bg-(--main-color) text-(--background-color) hover:opacity-90'
                : 'bg-(--border-color) text-(--secondary-color)',
            )}
          >
            <ArrowRight className='h-4 w-4' />
            <span className='hidden sm:inline'>Add</span>
          </button>
        </div>

        {/* Drag-and-drop / file browser zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() =>
            !isProcessing && !isAtLimit && fileInputRef.current?.click()
          }
          className={clsx(
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6',
            'transition-all duration-200',
            isProcessing || isAtLimit
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer',
            isDragOver
              ? 'border-(--main-color) bg-(--main-color)/10'
              : 'border-(--border-color) hover:border-(--secondary-color) hover:bg-(--border-color)/30',
          )}
        >
          <Upload
            className={clsx(
              'h-8 w-8 transition-colors',
              isDragOver ? 'text-(--main-color)' : 'text-(--secondary-color)',
            )}
          />
          <div className='text-center'>
            <p
              className={clsx(
                'text-sm font-medium',
                isDragOver ? 'text-(--main-color)' : 'text-(--main-color)',
              )}
            >
              {isDragOver ? 'Drop image here' : 'Drag & drop an image here'}
            </p>
            <p className='mt-0.5 text-xs text-(--secondary-color)'>
              or <span className='font-medium underline'>browse files</span> ·
              JPEG, PNG, WebP, AVIF, GIF, TIFF, BMP · max 50 MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp,image/avif,image/gif,image/tiff,image/bmp'
            onChange={e => handleFiles(e.target.files)}
            className='hidden'
          />
        </div>
      </div>

      {/* Progress bar — visible when processing, complete, or errored */}
      {progress.status !== 'idle' && (
        <div
          className={clsx(
            'rounded-lg border-2 p-3',
            'bg-(--card-color)',
            progress.status === 'error'
              ? 'border-red-500/30'
              : progress.status === 'complete'
                ? 'border-green-500/30'
                : 'border-(--border-color)',
          )}
        >
          <ProcessingProgressBar progress={progress} />
          {/* Dismiss button for errors */}
          {progress.status === 'error' && (
            <button
              onClick={() =>
                setProgress({
                  status: 'idle',
                  progress: 0,
                  message: '',
                })
              }
              className={clsx(
                'mt-2 flex items-center gap-1 rounded px-2 py-1 text-xs',
                'text-(--secondary-color) transition-colors',
                'hover:cursor-pointer hover:text-(--main-color)',
              )}
            >
              <X className='h-3 w-3' />
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Info text */}
      {wallpapers.length === 0 && progress.status === 'idle' && (
        <p className='text-center text-xs text-(--secondary-color)'>
          Add an image to create your own Premium glass theme.
          <br />
          Images are processed locally in your browser and stored on your
          device.
        </p>
      )}

      {/* Limit warning */}
      {isAtLimit && (
        <p className='text-center text-xs text-amber-400'>
          Maximum of {MAX_CUSTOM_WALLPAPERS} custom wallpapers reached. Remove
          one to add another.
        </p>
      )}
    </div>
  );
}
