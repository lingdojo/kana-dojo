# Wallpaper Source Images

This directory contains the original high-resolution source images for KanaDojo wallpapers.

> **Note**: Source images are excluded from git (see `.gitignore`). Only the processed/optimized versions in `public/wallpapers/` are tracked.

## How It Works

Premium themes are **dynamically generated** from whatever images you place here. The number of source images = the number of Premium themes in the app.

1. **Place source images** in this directory
2. **Run the processing script** — it generates optimized images + a TypeScript manifest
3. **The app** imports the manifest and dynamically creates Premium themes — no code changes needed

## Adding / Removing Wallpapers

1. **Add or remove images** in this directory (`data/wallpapers-source/`)
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`, `.tiff`, `.bmp`
   - Use **kebab-case** filenames (e.g., `neon-city-nights.jpg`, `mt-fuji-sunset.png`)
   - The filename becomes the theme ID & display name:
     - `neon-city-nights.jpg` → Theme ID: `neon-city-nights`, Display: "Neon City Nights"
   - Recommended minimum resolution: 3840×2160 (4K) for best results

2. **Run the processing script**:

   ```bash
   npm run images:process
   ```

   This does two things:
   - Generates optimized files in `public/wallpapers/` (AVIF + WebP at 3 sizes)
   - Generates `features/Preferences/data/wallpapers.generated.ts` (the manifest)

3. **Done!** Start the dev server to see your new Premium themes:
   ```bash
   npm run dev
   ```

## Processing Details

- **AVIF**: Quality 80, effort 6 — excellent compression, good quality
- **WebP**: Quality 85 — slightly higher quality for broader compatibility
- **Sizes**: 1920w (mobile/tablet), 2560w (desktop default), 3840w (4K displays)
- **Output**: `public/wallpapers/[name]-[width]w.[avif|webp]`

## File Size Guidelines

Typical output sizes per source image:

- AVIF 1920w: ~100–200 KB
- AVIF 2560w: ~200–400 KB
- AVIF 3840w: ~400–800 KB
- WebP versions: ~1.5–2× larger than AVIF equivalents
