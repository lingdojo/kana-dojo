# R2 Wallpaper Asset Pipeline

KanaDojo built-in Premium wallpaper images are generated locally, uploaded to
Cloudflare R2, and consumed by the app through the generated wallpaper manifest.

## Runtime Shape

- Source images live in `data/wallpapers-source`.
- Optimized AVIF and WebP files are staged in `.generated/wallpapers`.
- `.generated/` is gitignored and is only a local upload staging area.
- `.generated/wallpapers/wallpaper-build-state.json` records source hashes,
  dimensions, encoder settings, and expected outputs.
- `.generated/wallpapers/wallpaper-upload-plan.json` records exactly which files
  need to be uploaded after processing.
- `.generated/wallpapers/wallpaper-upload-report.json` records the latest R2
  upload and verification results.
- Public delivery uses `https://assets.kanadojo.com/wallpapers/*`.
- The app imports `features/Preferences/data/wallpapers/wallpapers.generated.ts`.
- Premium themes are generated from the manifest in `themeDefinitions.ts`.

## Commands

Generate staged image files and update the TypeScript manifest:

```powershell
npm run images:process
```

Upload staged image files to R2:

```powershell
npm run images:upload:r2
```

Generate and upload in one command:

```powershell
npm run images:r2
```

For normal wallpaper work, use `npm run images:r2`. It processes only changed
sources, uploads only changed generated files, then verifies the public manifest
URLs.

## Cloudflare Resources

- Cloudflare account: the account that owns the active `kanadojo.com` zone.
- R2 bucket: `kanadojo-wallpapers`.
- Custom domain: `assets.kanadojo.com`.
- Object prefix: `wallpapers/`.
- Cache header: `public, max-age=31536000, immutable`.

## Environment Overrides

The defaults are production-ready, but these env vars can override them:

```txt
WALLPAPER_ASSET_BASE_URL=https://assets.kanadojo.com
WALLPAPER_R2_BUCKET=kanadojo-wallpapers
WALLPAPER_R2_PREFIX=wallpapers
WALLPAPER_STAGING_DIR=.generated/wallpapers
WALLPAPER_R2_CACHE_CONTROL=public, max-age=31536000, immutable
```

## Adding A Wallpaper

1. Add the original image to `data/wallpapers-source`.
2. Use a stable kebab-case filename because it becomes the wallpaper ID.
3. Run `npm run images:r2`.
4. Commit the updated generated manifest.
5. Do not commit `.generated/wallpapers`.

The processor rejects filenames with spaces, uppercase letters, special
characters, or duplicate IDs across extensions. Rename sources before processing
instead of relying on the script to guess a final ID.

## Smart Incremental Behavior

The processor uses content/config fingerprints rather than only timestamps. A
wallpaper is reprocessed only when one of these changes:

- source file content hash or size
- decoded dimensions
- output width list
- AVIF/WebP encoder settings
- R2 asset base URL or object prefix
- an expected local output file is missing
- `npm run images:process -- --force` is used

The first run after introducing the state file can bootstrap from existing
generated outputs. That writes state and an empty upload plan without re-encoding
every wallpaper.

## Upload And Verification

The uploader reads `wallpaper-upload-plan.json`. It does not scan and upload the
entire staging folder.

For each planned upload it:

1. Checks the local file size and SHA-256 hash against the plan.
2. Uploads to R2 with `--remote`.
3. Downloads the exact R2 object into a temporary verification path.
4. Compares remote size and SHA-256 with the local file.
5. Retries failed upload/verification attempts up to three times.
6. Checks the exact public manifest URLs with `HEAD` requests.

If anything fails, the uploader exits non-zero and writes the failed objects to
`wallpaper-upload-report.json`.

## Deleted Sources

If a source image is removed, the processor removes matching local generated
outputs and removes the Premium theme from the generated manifest. It records
remote R2 cleanup candidates in the upload plan, but does not delete remote
objects automatically. This avoids breaking immutable URLs that may still be
cached or referenced.

## Source Repair Note

The old `bangkok-riverside-night.jpg` source was corrupt and could not be decoded
by Sharp. It has been replaced with a same-ID WebP source so the generated theme
ID and public R2 URLs stay stable.

## Cache Discipline

Wallpaper URLs are cached for one year and marked immutable. If a wallpaper image
changes visually, prefer a new filename or versioned object path instead of
overwriting an existing object URL.
