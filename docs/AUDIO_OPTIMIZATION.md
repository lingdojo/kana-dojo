# Audio Optimization Guide

This document explains the audio optimizations implemented to reduce data transfer and improve performance.

## Optimizations Implemented

### 1. Web Audio API (Performance)

- **Before**: Used `HTMLAudioElement` which creates new DOM elements per sound
- **After**: Uses Web Audio API with `AudioContext` and `AudioBuffer`
- **Benefits**:
  - No DOM element creation
  - Better performance with overlapping sounds
  - Precise timing control
  - Lower memory footprint

### 2. Audio Pooling for Overlapping Sounds

- Sounds like `playErrorTwice()` now properly support overlapping
- Web Audio API naturally handles multiple buffer sources
- Pre-loaded audio buffers for instant playback

### 3. Opus Format Support

- **Before**: Uncompressed WAV files (~3.4 MB total)
- **After**: Opus format with WAV fallback (~340 KB total)
- **Savings**: ~90% file size reduction

| File         | WAV Size | Opus Size | Savings |
| ------------ | -------- | --------- | ------- |
| long.wav     | 2,958 KB | ~300 KB   | 90%     |
| correct.wav  | 159 KB   | ~16 KB    | 90%     |
| click sounds | 114 KB   | ~11 KB    | 90%     |
| error sound  | 12 KB    | ~1 KB     | 92%     |

### 4. Lazy Loading with Caching

- Audio files only load on first play
- Respects silent mode (no loading when muted)
- Audio buffers cached in memory after first load

### 5. Cache Headers

- Added immutable cache headers for `/sounds/*` in `next.config.ts`
- Audio files cached for 1 year in browser
- Reduces repeat visits data transfer to near zero

### 6. Service Worker Caching

- Precaches all audio files on install
- Cache-first strategy for audio requests
- Supports offline audio playback

## File Sizes

Current audio files (after Opus conversion):

```
correct.opus:     ~16 KB
long.opus:        ~300 KB
click sounds:     ~3 KB each (4 files = ~12 KB)
error sound:      ~1 KB
mariah-carey.opus: 2,922 KB (music, expected)
```

## Usage

### Audio Hooks

```typescript
import {
  useClick,
  useCorrect,
  useError,
  useLong,
  preloadGameSounds
} from '@/shared/hooks/useAudio';

function GameComponent() {
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError, playErrorTwice } = useError();
  const { playLong } = useLong();

  // Preload sounds when entering game mode
  useEffect(() => {
    preloadGameSounds();
  }, []);

  // Audio loads only when first played
  // Respects silent mode automatically
  // Uses Web Audio API for performance
}
```

### Standalone Sound Playback

```typescript
import { playCorrectSound, playSoundByUrl } from '@/shared/hooks/useAudio';

// Play correct sound at custom volume
playCorrectSound(0.5);

// Play any sound by URL
await playSoundByUrl('/sounds/custom.opus', 0.8);
```

### Convert Audio Files to Opus

1. Install ffmpeg:

   ```bash
   # Windows (PowerShell as Admin)
   winget install FFmpeg

   # Mac
   brew install ffmpeg

   # Linux
   apt-get install ffmpeg
   ```

2. Run compression script:

   ```bash
   node scripts/compress-audio-opus.js
   ```

3. Test audio playback in all browsers

4. (Optional) Delete original `.wav` files if Opus works everywhere

## Performance Impact

| Metric                 | Before      | After   | Improvement |
| ---------------------- | ----------- | ------- | ----------- |
| Initial load           | ~3.4 MB     | 0 bytes | 100%        |
| First interaction      | ~3.4 MB     | ~340 KB | 90%         |
| Silent mode transfer   | ~3.4 MB     | 0 bytes | 100%        |
| Repeat visits          | Full reload | Cached  | ~100%       |
| Sound overlap handling | Glitchy     | Native  | ✓           |

## Browser Compatibility

### Web Audio API

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

### Opus Format

- Chrome/Edge: ✅
- Firefox: ✅
- Safari 15+: ✅
- Mobile browsers: ✅
- Fallback: WAV files for older browsers

## Silent Mode

The hooks automatically respect the `silentMode` preference from the store:

- When enabled: No audio files are loaded or played
- When disabled: Audio loads on first play and is cached

## Service Worker

The audio service worker (`/public/sw.js`) provides:

- **Precaching**: All audio files cached on install
- **Cache-first**: Audio served from cache when available
- **Offline support**: Audio works without network
- **Auto-update**: Checks for updates hourly

### Manual Cache Control

```typescript
import {
  cacheAudioFile,
  clearAudioCache
} from '@/shared/components/ServiceWorkerRegistration';

// Cache a specific audio file
cacheAudioFile('/sounds/custom.opus');

// Clear all cached audio
clearAudioCache();
```

## Troubleshooting

### Audio not playing

- Check browser console for autoplay policy errors
- Ensure user has interacted with the page first
- Verify audio files exist in `public/sounds/`
- Check if AudioContext is in 'suspended' state

### AudioContext suspended

The system automatically resumes the AudioContext when sounds are played.
If issues persist, ensure sounds are triggered by user interaction.

### Large data transfer

- Run the Opus compression script
- Check that cache headers are working (Network tab → Response Headers)
- Verify service worker is registered
- Verify silent mode is working correctly

## Architecture

```
shared/hooks/useAudio.ts          - Main audio system (Web Audio API)
shared/components/ServiceWorkerRegistration.tsx - SW registration
public/sw.js                       - Service worker for caching
scripts/compress-audio-opus.js     - Opus conversion script
```
