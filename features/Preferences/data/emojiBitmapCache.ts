/**
 * Module-level bitmap cache for emoji rendering.
 *
 * Problem: ctx.fillText('🌸') is catastrophically slow —
 * each call triggers text shaping, font fallback, and composite glyph rendering.
 * On a busy frame with 60+ particles this causes visible jank and frame drops.
 *
 * Solution: Render each emoji ONCE to a small offscreen <canvas>,
 * then use ctx.drawImage() at draw time (GPU-accelerated, ~50× faster).
 */

const _cache = new Map<string, HTMLCanvasElement>();

/**
 * Returns a pre-rendered bitmap of the given emoji at the given size (px).
 * The bitmap is cached by key = `${emoji}@${size}`.
 * Returns the offscreen canvas (which is a valid CanvasImageSource for drawImage).
 */
export function getEmojiBitmap(
  emoji: string,
  size: number,
): HTMLCanvasElement | undefined {
  if (typeof document === 'undefined') return undefined;

  const key = `${emoji}@${size}`;
  const cached = _cache.get(key);
  if (cached) return cached;

  // Render at 2× for crispness on HiDPI
  const scale = 2;
  const pxSize = size * scale;
  const padding = Math.ceil(pxSize * 0.15); // emoji can overflow metrics
  const dim = pxSize + padding * 2;

  const offscreen = document.createElement('canvas');
  offscreen.width = dim;
  offscreen.height = dim;

  const ctx = offscreen.getContext('2d');
  if (!ctx) return undefined;

  ctx.font = `${pxSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, dim / 2, dim / 2);

  _cache.set(key, offscreen);
  return offscreen;
}
