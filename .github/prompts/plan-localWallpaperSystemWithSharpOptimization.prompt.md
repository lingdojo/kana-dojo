# Plan: Local Wallpaper System with Sharp Optimization

You'll replace all Unsplash hotlinks with locally-hosted, multi-format, aggressively-cached wallpapers. Source images go in a dedicated directory, get processed via Sharp into AVIF + WebP at multiple sizes, then served from `public/wallpapers/` with 1-year cache headers. The custom wallpaper feature will be removed to maintain full control over image quality.

**Key Decisions from Research:**
- ✅ Current caching already configured: 1-year immutable headers for `/wallpapers/*`
- ✅ Next.js supports AVIF + WebP in image config
- ✅ Using existing `public/wallpapers/` directory (consistent with current `neonretrocarcity.jpg`)
- ❌ Removing unused `WallpaperSelector` component and custom wallpaper feature
- ❌ Replacing all 10 Unsplash URLs + 1 local image with optimized local versions

---

## Steps

### 1. Create source directory structure
- Create `data/wallpapers-source/` for original downloaded images
- Add `.gitignore` entry to exclude source files (keep repo lean)
- Add `README.md` with instructions for adding new wallpapers

### 2. Create image processing script at `scripts/process-wallpapers.ts`
- Install `sharp` as devDependency
- Read all images from `data/wallpapers-source/` (glob pattern: `*.{jpg,jpeg,png,webp,avif,gif,tiff,bmp}`)
- For each image:
  - Generate 3 sizes: 1920w, 2560w, 3840w (landscape wallpapers)
  - Convert to both AVIF (primary) + WebP (fallback)
  - Naming pattern: `[original-name]-[width]w.[ext]` (e.g., `neon-city-1920w.avif`)
  - Output to `public/wallpapers/`
- Handle errors gracefully (corrupted/invalid images, unsupported formats)
- Log summary: files processed, formats generated, file sizes, compression ratios
- Sharp configuration:
  - AVIF: `{ quality: 80, effort: 6 }` (good quality, reasonable speed)
  - WebP: `{ quality: 85 }` (slightly higher for fallback)

### 3. Add npm script to `package.json`
- Add: `"images:process": "tsx scripts/process-wallpapers.ts"`
- Add to relevant scripts section (near other data processing scripts)

### 4. Update wallpaper data in `features/Preferences/data/wallpapers.ts`
- Replace all 10 Unsplash `url` values with local paths: `/wallpapers/[name]-2560w.avif`
- Update the existing `neonretrocarcity.jpg` entry to reference optimized version
- Add `urlWebp` property to `Wallpaper` interface: `urlWebp?: string`
- Set `urlWebp: '/wallpapers/[name]-2560w.webp'` for each wallpaper (fallback)
- Add comments documenting the responsive sizes available (1920w, 2560w, 3840w)
- Consider adding `urlLarge` and `urlSmall` properties for future responsive improvements

### 5. Update wallpaper application logic
- In `app/ClientLayout.tsx#L153-L166`: Update background image CSS to use `<picture>` element or CSS with fallback
- In `features/Preferences/data/themes.ts#L88-L98`: Update `getWallpaperStyles()` to handle AVIF with WebP fallback
- Use CSS: `background-image: image-set(url('/...avif') type('image/avif'), url('/...webp') type('image/webp'))`
- Or consider media queries for responsive sizes: `@media (max-width: 1920px)` → use 1920w version

### 6. Remove custom wallpaper functionality
- Delete `features/Preferences/components/WallpaperSelector.tsx` (unused component)
- Remove from `features/Preferences/store/usePreferencesStore.ts`:
  - `customWallpapers` state (lines 47, 99-101)
  - `addCustomWallpaper` action (lines 113-124)
  - `removeCustomWallpaper` action (lines 126-135)
- Remove from `features/Preferences/data/wallpapers.ts`:
  - `getWallpaperById()` custom wallpaper logic (lines 135-137)
  - `isValidImageUrl()` function (lines 145-163, no longer needed)
  - `generateWallpaperId()` function (lines 168-170)
- Update `Wallpaper` interface to remove optional fields only used for custom wallpapers

### 7. Verify caching configuration (already excellent, just confirm)
- Confirm `next.config.ts#L195-L203` headers for `/wallpapers/:path*` are still present
- Confirm `vercel.json#L58-L64` wallpaper cache headers
- Both already set to `public, max-age=31536000, immutable` ✅
- Test with browser DevTools Network tab: verify `Cache-Control` headers in response

### 8. Update documentation
- Update `docs/GLASS_MODE_THEME.md#L74`: Document new wallpaper format and sizes
- Create `data/wallpapers-source/README.md`: Instructions for adding new wallpapers and running the script
- Update `AGENTS.md` if wallpaper workflow is significant

---

## Verification

Manual testing:
```powershell
# 1. Add test images to data/wallpapers-source/
# 2. Run processing script
npm run images:process

# 3. Verify output in public/wallpapers/
# Should see: [name]-1920w.avif, [name]-1920w.webp, [name]-2560w.avif, etc.

# 4. Check file sizes (AVIF should be ~50% smaller than WebP)

# 5. Start dev server
npm run dev

# 6. Navigate to preferences/themes
# 7. Select a premium theme with wallpaper
# 8. Verify background loads correctly

# 9. Check Network tab in DevTools:
#    - Verify AVIF format is served (or WebP if browser doesn't support AVIF)
#    - Verify Cache-Control: public, max-age=31536000, immutable
#    - Verify status 200 first time, then 304 (from cache) on refresh

# 10. Run verification
npm run check
```

Browser compatibility check:
- Test in Chrome/Edge (supports AVIF)
- Test in Safari (supports AVIF as of Safari 16+)
- Test in Firefox (supports AVIF)
- Verify WebP fallback in older browsers if needed

---

## Decisions
- **Both AVIF + WebP**: Maximum compatibility with optimal compression
- **3 responsive sizes**: Better performance on mobile/tablet vs desktop
- **Manual script**: Run `npm run images:process` only when adding new wallpapers
- **Remove custom wallpapers**: Maintain quality control, simpler codebase
- **Source in `data/`**: Keeps wallpapers with other data files, excluded from git
- **Output in `public/wallpapers/`**: Consistent with existing structure and cache headers
