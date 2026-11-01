# R2 Wallpaper Upload Script

`scripts/upload-wallpapers-r2.ts` uploads planned wallpaper image files to
Cloudflare R2.

## What It Uploads

The script reads the upload plan created by `npm run images:process`:

```txt
.generated/wallpapers/wallpaper-upload-plan.json
```

Only files listed in `uploadFiles` are uploaded. Unchanged staged files are not
re-uploaded. Each planned file is uploaded to:

```txt
kanadojo-wallpapers/wallpapers/<filename>
```

The public URL is then:

```txt
https://assets.kanadojo.com/wallpapers/<filename>
```

## Required Setup

Wrangler must be authenticated to the Cloudflare account that owns the active
`kanadojo.com` zone:

```powershell
wrangler login
```

The production bucket and custom domain are:

```txt
Bucket: kanadojo-wallpapers
Domain: assets.kanadojo.com
```

## Command

```powershell
npm run images:upload:r2
```

Use the combined generation and upload command for normal work:

```powershell
npm run images:r2
```

## Cache Headers

Every upload uses:

```txt
Cache-Control: public, max-age=31536000, immutable
```

This keeps repeat wallpaper requests served from browser and Cloudflare cache
instead of repeatedly hitting R2.

The script always passes `--remote` to Wrangler. Without that flag, Wrangler can
write to local simulated R2 storage instead of Cloudflare R2.

## Verification

For each planned upload, the script:

1. Confirms the local file still matches the upload plan size and SHA-256 hash.
2. Uploads the file with Wrangler.
3. Downloads the exact R2 object into `.generated/wallpapers/.r2-verify`.
4. Compares the remote object size and SHA-256 hash with the local file.
5. Retries failed upload or verification attempts up to three times.
6. Checks the exact public manifest URLs through `assets.kanadojo.com`.

The public URL checks use exact URLs, not query-string cache busting. R2 custom
domain behavior can differ for query-string URLs, while the app uses exact
manifest URLs.

## Report

Every run writes:

```txt
.generated/wallpapers/wallpaper-upload-report.json
```

The report includes uploaded files, skipped unchanged files, retry counts,
direct R2 verification status, public URL status, and remote cleanup candidates.
The script exits non-zero if any required upload or required public URL check
fails.

## Reruns

The upload is safe to rerun. Existing R2 objects with the same key are replaced,
but only files in the latest upload plan are touched. If no files changed, the
script performs no uploads and verifies the manifest URLs. Because wallpaper URLs
are immutable in practice, prefer new filenames for visual changes that users
should see immediately.
