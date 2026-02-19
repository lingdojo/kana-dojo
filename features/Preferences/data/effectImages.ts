/**
 * SVG strings for each Japan-themed effect shape.
 * Stored inline — no asset files, no network requests.
 * Each string is encoded into a data URI and loaded into an HTMLImageElement
 * once, then read from the module-level cache at draw time.
 */

/* eslint-disable quotes */
export const EFFECT_SVG: Record<string, string> = {
  // ── Sakura petal ────────────────────────────────────────────────────────────
  // Classic single petal: teardrop body + notch at tip + subtle highlight lobe
  sakura: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 38"><path d="M16 4 C10 4 3 10 3 19 C3 29 16 35 16 35 C16 35 29 29 29 19 C29 10 22 4 16 4Z" fill="#FFB7C5"/><path d="M16 4 Q14 10 16 15 Q18 10 16 4Z" fill="#D96B8A"/><ellipse cx="11" cy="17" rx="2" ry="3" fill="#FFDDE8" opacity="0.45"/></svg>`,

  // ── Momiji maple leaf ────────────────────────────────────────────────────────
  // 11-point star shape with stem — instantly recognisable as a maple leaf
  momiji: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 46"><path d="M20 3 L17 11 L10 8 L14 16 L4 15 L11 22 L3 27 L13 27 L9 36 L20 30 L31 36 L27 27 L37 27 L29 22 L36 15 L26 16 L30 8 L23 11Z" fill="#C23B22"/><rect x="18.75" y="35" width="2.5" height="9" rx="1.25" fill="#7A3010"/></svg>`,

  // ── Sumi-e ink drop ──────────────────────────────────────────────────────────
  // Teardrop shape like a falling ink droplet; dark indigo/navy
  'ink-drop': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40"><path d="M14 2 C16 9 24 17 24 27 C24 34 20 38 14 38 C8 38 4 34 4 27 C4 17 12 9 14 2Z" fill="#1C1C3A"/><ellipse cx="10" cy="24" rx="2.5" ry="3.5" fill="#4A4A72" opacity="0.5"/></svg>`,

  // ── Koi fish ────────────────────────────────────────────────────────────────
  // Side-view: body ellipse + fan tail + eye + scale hint
  koi: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 28"><path d="M8 14 C14 5 38 5 48 14 C38 23 14 23 8 14Z" fill="#E8803A"/><path d="M48 14 C52 7 57 5 55 14 C57 23 52 21 48 14Z" fill="#C23B22"/><path d="M46 14 C49 9 53 7 51 14 C53 21 49 19 46 14Z" fill="#FFB347" opacity="0.7"/><circle cx="18" cy="12" r="2.5" fill="#1A1A2E"/><circle cx="17" cy="11" r="1" fill="white" opacity="0.8"/><path d="M30 8 Q33 6 35 8 Q33 10 30 8Z" fill="#C06030" opacity="0.55"/><path d="M30 19 Q33 21 35 19 Q33 17 30 19Z" fill="#C06030" opacity="0.55"/></svg>`,

  // ── Firefly glow orb ─────────────────────────────────────────────────────────
  // Concentric halos + bright core; looks like bioluminescence
  firefly: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#EEDD44" opacity="0.07"/><circle cx="20" cy="20" r="12" fill="#EEDD44" opacity="0.18"/><circle cx="20" cy="20" r="7" fill="#FFEF80" opacity="0.65"/><circle cx="20" cy="20" r="4" fill="#FFFFF0"/><circle cx="18" cy="18" r="1.5" fill="white" opacity="0.85"/></svg>`,

  // ── Bamboo leaf ──────────────────────────────────────────────────────────────
  // Slender pointed oval with a center vein
  bamboo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 44"><path d="M10 2 C15 8 16 22 10 42 C4 22 5 8 10 2Z" fill="#5A9E6F"/><path d="M10 5 L10 39" stroke="#3D7A52" stroke-width="1" fill="none" stroke-linecap="round"/></svg>`,

  // ── Torii gate ───────────────────────────────────────────────────────────────
  // Two uprights + two crossbars; classic vermilion
  torii: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 52"><rect x="2" y="7" width="40" height="5" rx="2.5" fill="#D2001A"/><rect x="5" y="12" width="34" height="3.5" rx="1.75" fill="#D2001A"/><rect x="7" y="15" width="5" height="33" rx="2.5" fill="#D2001A"/><rect x="32" y="15" width="5" height="33" rx="2.5" fill="#D2001A"/></svg>`,
};

/** Natural aspect ratio (h/w) for each SVG viewBox. */
export const EFFECT_SVG_ASPECT: Record<string, number> = {
  sakura: 38 / 32, // 1.19
  momiji: 46 / 40, // 1.15
  'ink-drop': 40 / 28, // 1.43
  koi: 28 / 56, // 0.50
  firefly: 40 / 40, // 1.00
  bamboo: 44 / 20, // 2.20
  torii: 52 / 44, // 1.18
};

// ─── Module-level image cache ─────────────────────────────────────────────────

const _cache = new Map<string, HTMLImageElement>();
const _pending = new Set<string>();

function _loadOne(id: string): void {
  if (_cache.has(id) || _pending.has(id) || !EFFECT_SVG[id]) return;
  _pending.add(id);
  const img = new Image();
  img.onload = () => {
    _cache.set(id, img);
    _pending.delete(id);
  };
  img.onerror = () => _pending.delete(id);
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(EFFECT_SVG[id])}`;
}

/**
 * Kick off async loading for a set of effect image IDs.
 * Safe to call multiple times; already-loaded images are skipped.
 */
export function preloadEffectImages(ids: string[]): void {
  if (typeof window === 'undefined') return;
  ids.forEach(_loadOne);
}

/**
 * Synchronous cache lookup. Returns undefined if not yet loaded —
 * callers should simply skip drawing until the next RAF frame.
 */
export function getEffectImage(id: string): HTMLImageElement | undefined {
  return _cache.get(id);
}
