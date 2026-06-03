# Translation Usage Guardrails

This module backs the translation cost controls used by `/api/translate`.

## What it does

- Enforces request-rate limits for translation traffic.
- Tracks uncached translation character usage by IP.
- Applies daily, monthly, and global monthly character budgets.
- Returns quota headers so the client and healthcheck can surface usage.
- Supports an optional verification step for suspicious traffic.

## Why it exists

Google Cloud Translation is billed by characters, not by requests. A request-count limiter alone does not cap spend well enough when the app allows up to 5,000 characters per translation.

The goal is to keep normal learner behavior frictionless while making scripted abuse, crawlers, and repeated large uncached requests expensive to the project rather than to the user.

## Operational notes

- Cached translations do not consume character budget.
- Verification thresholds are intentionally higher than ordinary learner behavior.
- Redis is preferred in production; the in-memory fallback is best-effort only.
- The healthcheck route exposes translation usage stats for monitoring.

