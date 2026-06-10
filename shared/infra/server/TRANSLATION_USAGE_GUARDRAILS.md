# Translation Usage Guardrails

This module backs the translation cost controls used by `/api/translate`.

## What it does

- Enforces high request-rate backstops and short burst protection for translation traffic.
- Tracks uncached translation character usage by IP.
- Applies daily, monthly, and global monthly character budgets.
- Returns quota headers so the client and healthcheck can surface usage.
- Supports an optional verification step for suspicious traffic.

## Why it exists

Translation providers bill by characters, not by requests. A request-count limiter alone does not cap spend well enough when the app allows up to 5,000 characters per translation.

The goal is to keep normal learner behavior frictionless while making scripted abuse, crawlers, and repeated large uncached requests expensive to the project rather than to the user. Request limits are intentionally generous; character limits are the primary fair-use control.

## Operational notes

- Cached translations do not consume character budget.
- Uncached translations use Azure Translator first and Google Cloud Translation only as a fallback.
- Azure requires `AZURE_TRANSLATOR_KEY`; `AZURE_TRANSLATOR_ENDPOINT` and `AZURE_TRANSLATOR_REGION` are optional for custom or regional resources.
- The default global monthly cap is `3,000,000` uncached characters so the translator stays available beyond the free tiers, while per-IP limits still control abuse.
- Turnstile verification is triggered by daily uncached character volume, not by request count.
- Short-window burst limits remain to stop machine-speed request floods.
- Redis is preferred in production; the in-memory fallback is best-effort only.
- The healthcheck route exposes translation usage stats for monitoring.

