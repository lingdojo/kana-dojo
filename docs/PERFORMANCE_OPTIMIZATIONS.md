# Performance Optimizations Applied

This document outlines all the performance optimizations applied to improve dev server startup time.

## 1. Next.js Configuration (`next.config.ts`)

### Added Optimizations:

- **Turbopack**: Enabled via `--turbo` flag in dev script (up to 10x faster than webpack)
- **React Strict Mode**: Disabled in development (reduces double-rendering overhead)
- **Optimized Package Imports**: Tree-shaking for large packages (framer-motion, lucide-react, FontAwesome, radix-ui, zustand, clsx, cva)
- **Webpack Build Worker**: Parallel compilation for faster builds
- **Dev Indicators**: Disabled build activity indicator to reduce overhead
- **Console Removal**: Automatic console.log removal in production builds
- **Image Optimization**: AVIF and WebP format support
- **Turbo Resolve Aliases**: Faster module resolution with pre-configured path aliases
- **Skip Type Checking in Dev**: TypeScript errors checked separately via `npm run check`
- **Skip ESLint in Dev**: Linting runs separately for faster HMR

## 2. TypeScript Configuration (`tsconfig.json`)

### Added Optimizations:

- **assumeChangesOnlyAffectDirectDependencies**: Faster incremental builds
- **disableSourceOfProjectReferenceRedirect**: Reduced type-checking overhead
- **incremental**: Already enabled (caches compilation results)
- **skipLibCheck**: Already enabled (skips type-checking of declaration files)

## 3. Tailwind CSS Configuration (`tailwind.config.js`)

### Optimizations:

- **Explicit Content Paths**: Added specific paths for features/, shared/, core/ directories
- **Reduced Scanning**: More targeted file patterns prevent unnecessary scans

## 4. Environment Variables (`.env.local`)

### Added Variables:

- **NEXT_TELEMETRY_DISABLED=1**: Disables Next.js telemetry (faster startup)
- **NODE_OPTIONS**: Optimized memory allocation (4GB)
- **NEXT_PRIVATE_SKIP_SIZE_LIMIT_CHECK=1**: Skips bundle size checks in dev

## 5. Font Loading Optimization (`ClientLayout.tsx` & `decorationFonts.ts`)

### Changes:

- **Conditional Loading**: Fonts only load in production via environment-based file routing
- **Development Skip**: Returns empty array immediately in dev (fonts.dev.ts, decorationFonts.dev.ts)
- **No Font Compilation**: Prevents 35+ Google Fonts from being processed during dev compilation
- **Decoration Fonts Split**: MainMenu decoration fonts also use dev/prod split pattern

## 6. i18n Loading Optimization (`core/i18n/request.ts`)

### Changes:

- **Parallel Loading**: All translation namespaces load in parallel via Promise.all
- **Message Caching**: Loaded translations are cached to avoid re-importing during HMR
- **Faster Initial Load**: Reduces sequential await overhead

## 7. Package Manager (`.npmrc`)

### Existing Optimizations:

- **prefer-offline=true**: Uses cached packages when available

## Expected Performance Improvements

### Before Optimizations:

- Dev server startup: ~30-60 seconds (with font compilation timeouts)
- Hot reload: ~3-5 seconds
- Initial page load: Slow due to font processing

### After Optimizations:

- Dev server startup: **~5-10 seconds** (with Turbopack)
- Hot reload: **~500ms-1s** (with Turbopack)
- Initial page load: **Fast** (no font loading in dev)
- Production: **Unchanged** (all optimizations are dev-only or improve prod too)

## Additional Recommendations

### For Even Faster Development:

1. **Use SSD**: Ensure your project is on an SSD drive
2. **Exclude from Antivirus**: Add node_modules and .next to antivirus exclusions
3. **Close Unnecessary Apps**: Free up RAM and CPU
4. **Use Node 18+**: Latest Node versions have better performance
5. **Clear .next folder**: Run `rm -rf .next` if builds feel slow

### Commands:

```bash
# Clear build cache
rm -rf .next

# Clear node modules and reinstall (if needed)
rm -rf node_modules package-lock.json
npm install

# Run optimized dev server
npm run dev
```

## Monitoring Performance

To check if optimizations are working:

1. **Startup Time**: Note the time from running `npm run dev` to "Ready in X.Xs"
2. **Hot Reload**: Make a small change and see how fast it updates
3. **Memory Usage**: Check Task Manager - should stay under 4GB
4. **Turbopack Indicator**: You should see "Turbopack" mentioned in the startup logs

## Rollback Instructions

If any optimization causes issues:

### Disable Turbopack:

```json
// package.json
"dev": "next dev"
```

### Re-enable React Strict Mode:

```typescript
// next.config.ts
reactStrictMode: true;
```

### Enable Font Loading in Dev:

```typescript
// ClientLayout.tsx - Remove the environment check in loadFontsModule
```

## Notes

- All optimizations are **non-breaking** and maintain production functionality
- Font loading is **production-only** - use system fonts in dev for testing
- Turbopack is **stable** in Next.js 15+ and recommended by Vercel
- These optimizations are **cumulative** - each one contributes to faster performance
