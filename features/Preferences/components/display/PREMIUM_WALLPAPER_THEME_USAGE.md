# Premium Wallpaper Theme Usage

Premium wallpaper themes are data-driven. The UI does not keep a handwritten list
of wallpaper cards.

## Data Flow

1. `npm run images:process` reads `data/wallpapers-source`.
2. It writes optimized assets into `.generated/wallpapers`.
3. It writes R2 URLs into `features/Preferences/data/wallpapers/wallpapers.generated.ts`.
4. `themeDefinitions.ts` creates one Premium theme for each generated wallpaper.
5. Theme UI components resolve wallpapers with `getWallpaperById`.
6. Background CSS is created with `getWallpaperStyles`.

## Rendering

Wallpaper previews and active page backgrounds use CSS `image-set(...)`:

```css
image-set(
  url("...avif") type("image/avif"),
  url("...webp") type("image/webp")
)
```

AVIF is the preferred format and WebP is the fallback.

## Active Background

`ClientLayout.tsx` applies the selected Premium wallpaper as the app background.
The theme system also applies the same wallpaper when `applyTheme` runs, so
theme previews and actual theme selection stay visually aligned.

## Custom User Wallpapers

User-created custom wallpaper themes are separate from the built-in R2 pipeline.
They are processed in the browser and stored locally with IndexedDB/object URLs.
They are not uploaded to R2.

## Production Asset Host

Built-in Premium wallpaper URLs should point to:

```txt
https://assets.kanadojo.com/wallpapers/*
```

Local `/wallpapers/*` URLs are part of the old public-folder pipeline and should
not be reintroduced.
