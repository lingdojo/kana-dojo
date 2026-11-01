# Wallpaper Source Image Guide

This directory contains the original source images for KanaDojo built-in Premium
wallpapers.

For the full pipeline, start here:

```txt
features/Preferences/data/wallpapers/R2_WALLPAPER_ASSET_PIPELINE.md
```

That file is the main entrypoint for the R2 wallpaper asset workflow.

## What Lives Here

- Source images only.
- Stable kebab-case filenames only, because the filename becomes the wallpaper
  ID and display name.
- Examples:
  - `blue-mountain-sunrise.jpg` -> `Blue Mountain Sunrise`
  - `moraine-lake-sunrise.jpg` -> `Moraine Lake Sunrise`

Do not place generated AVIF/WebP files here. Generated files are staged in:

```txt
.generated/wallpapers
```

That staging directory is gitignored and exists only for local processing and R2
upload verification.

## Normal Workflow

1. Add or remove source images in this directory.
2. Use kebab-case filenames with no spaces, uppercase letters, or special
   characters.
3. Run:

   ```powershell
   npm run images:r2
   ```

4. Commit the updated generated manifest and source image changes.

The command processes only changed or missing local outputs, uploads only the
planned changed files to R2, verifies direct R2 bytes, and verifies the exact
public manifest URLs.

## Supported Formats

Supported source extensions come from the shared image processing config:

```txt
.jpg, .jpeg, .png, .webp, .avif, .gif, .tiff, .bmp
```

Recommended source resolution is 3840x2160 or larger when possible. Smaller
sources are allowed; the processor skips output widths larger than the source.

## Generated Outputs

The processor generates AVIF and WebP variants at supported responsive widths:

```txt
1920w, 2560w, 3840w
```

The app does not serve these from `public/wallpapers`. Built-in Premium wallpaper
assets are uploaded to Cloudflare R2 and served from:

```txt
https://assets.kanadojo.com/wallpapers/*
```

The tracked manifest is:

```txt
features/Preferences/data/wallpapers/wallpapers.generated.ts
```

## Source Deletions

Removing a source image removes that Premium theme from the generated manifest
and removes matching local generated outputs. The pipeline records remote R2
cleanup candidates, but it does not automatically delete R2 objects.
