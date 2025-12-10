# Audio Optimization Guide

This document explains the audio optimizations implemented to reduce Vercel data transfer and improve performance.

## Optimizations Implemented

### 1. Lazy Loading with Caching

- **Before**: All audio files loaded immediately when hooks were called (even in silent mode)
- **After**: Audio files only load on first play, respecting silent mode
- **Savings**: ~3.4 MB initial load → 0 bytes until first interaction

### 2. Smart Click Sound Loading

- **Before**: All 4 click sounds loaded per component (~114 KB)
- **After**: Random click sound loaded on-demand with caching
- **Savings**: 75% reduction in click sound data transfer

### 3. Cache Headers

- Added immutable cache headers for `/sounds/*` in `next.config.ts`
- Audio files cached for 1 year in browser
- Reduces repeat visits data transfer to near zero

### 4. Audio Compression (Optional)

- Script provided to convert WAV → MP3
- Typical savings: 90% file size reduction
- `long.wav` (2.96 MB) → ~300 KB as MP3

## File Sizes

Current WAV files:

```
correct.wav:     159 KB
long.wav:      2,958 KB  ⚠️ Largest file
click sounds:    ~28 KB each (4 files = 114 KB)
error sound:      12 KB
```

## Usage

### Audio Hooks

```typescript
import {
  useClick,
  useCorrect,
  useError,
  useLong
} from '@/shared/hooks/useAudio';

function MyComponent() {
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError, playErrorTwice } = useError();
  const { playLong } = useLong();

  // Audio loads only when first played
  // Respects silent mode automatically
}
```

### Compress Audio Files (Optional)

1. Install ffmpeg:

   ```bash
   # Windows
   choco install ffmpeg

   # Mac
   brew install ffmpeg

   # Linux
   apt-get install ffmpeg
   ```

2. Run compression script:

   ```bash
   node scripts/compress-audio.js
   ```

3. Update `useAudio.ts` to use `.mp3` extensions:

   ```typescript
   const clickSoundUrls = [
     '/sounds/click/click4/click4_11.mp3' // Changed from .wav
     // ...
   ];
   ```

4. Test audio playback

5. Delete original `.wav` files

## Performance Impact

| Metric                 | Before      | After   | Improvement |
| ---------------------- | ----------- | ------- | ----------- |
| Initial load           | ~3.4 MB     | 0 bytes | 100%        |
| Click sounds/component | 114 KB      | ~28 KB  | 75%         |
| Silent mode transfer   | ~3.4 MB     | 0 bytes | 100%        |
| Repeat visits          | Full reload | Cached  | ~100%       |

With MP3 compression:
| File | WAV | MP3 | Savings |
|------|-----|-----|---------|
| long.wav | 2,958 KB | ~300 KB | 90% |
| correct.wav | 159 KB | ~16 KB | 90% |
| Total | ~3.4 MB | ~340 KB | 90% |

## Browser Compatibility

The optimized implementation uses native `HTMLAudioElement`, which is supported in all modern browsers:

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## Silent Mode

The hooks automatically respect the `silentMode` preference from the store:

- When enabled: No audio files are loaded or played
- When disabled: Audio loads on first play and is cached

## Troubleshooting

### Audio not playing

- Check browser console for autoplay policy errors
- Ensure user has interacted with the page first
- Verify audio files exist in `public/sounds/`

### Large data transfer

- Run the compression script to convert WAV → MP3
- Check that cache headers are working (Network tab → Response Headers)
- Verify silent mode is working correctly

## Future Optimizations

Consider these additional optimizations if needed:

1. **Audio sprites**: Combine multiple sounds into one file
2. **Remove long.wav**: 87% of total audio data
3. **Preload critical sounds**: Add `<link rel="preload">` for essential sounds
4. **Service Worker caching**: Cache audio files offline
