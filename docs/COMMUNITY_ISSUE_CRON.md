# Community Issue Cron — Vercel Trigger

## Overview

The **Create Community Contribution Issue** GitHub Actions workflow
(`hourly-community-issue.yml`) runs every 15 minutes to open a new community
contribution issue. GitHub's built-in scheduler is unreliable for
high-frequency schedules and silently skips runs ~90% of the time.

To fix this, a **Vercel Cron Job** acts as the primary trigger. Every 15
minutes Vercel POSTs to `/api/trigger-community-issue`, which calls the GitHub
API to dispatch the workflow via `workflow_dispatch`. The GitHub Actions cron
remains as a fallback.

---

## How it works

```
Vercel Cron (every 15 min)
  → POST /api/trigger-community-issue   (app/api/trigger-community-issue/route.ts)
    → GitHub API: POST /repos/lingdojo/kanadojo/actions/workflows/hourly-community-issue.yml/dispatches
      → GitHub Actions runs the workflow normally
```

The API route authenticates incoming requests by checking the
`Authorization: Bearer <CRON_SECRET>` header that Vercel attaches
automatically.

---

## Required setup (one-time, manual)

You need to configure **two environment variables** in the
[Vercel project settings](https://vercel.com/lingdojo/kanadojo/settings/environment-variables)
under **Production** (and optionally Preview/Development).

### 1. `CRON_SECRET`

A random secret shared between Vercel and the API route.

**Generate one:**

```bash
openssl rand -hex 32
```

Add it to Vercel as `CRON_SECRET`. Vercel will automatically attach
`Authorization: Bearer <value>` to every cron invocation.

> Do **not** add this to `.env.local` or commit it anywhere.

---

### 2. `GITHUB_PAT`

A GitHub **fine-grained personal access token** with permission to dispatch
workflows on this repository.

**Steps:**

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Click **Generate new token**
3. Set **Resource owner** to `lingdojo`
4. Under **Repository access** select `lingdojo/kanadojo` only
5. Under **Permissions → Repository permissions** set **Actions** to `Read and write`
6. Generate and copy the token

Add it to Vercel as `GITHUB_PAT`.

> The token only needs `Actions: Read & Write` — no other scopes required.

---

## Vercel Cron schedule

Defined in `vercel.json`:

```json
"crons": [
  {
    "path": "/api/trigger-community-issue",
    "schedule": "7,22,37,52 * * * *"
  }
]
```

This triggers at minutes 7, 22, 37, and 52 of every hour (every 15 minutes),
matching the original GitHub Actions schedule.

> Vercel Cron Jobs require a **Pro plan or above**. On the Hobby plan crons
> are limited to one per day. Check your plan at
> <https://vercel.com/lingdojo/kanadojo/settings/billing>.

---

## Additional cronjob.org endpoints

In addition to `/api/trigger-community-issue`, cronjob.org can trigger:

- `POST /api/trigger-community-backlog-reset`
  - Dispatches `.github/workflows/auto-reset-community-backlog.yml`
  - Uses workflow inputs: `full_reset=true`, `dry_run=false`
- `POST /api/trigger-thanos-community-content`
  - Dispatches `.github/workflows/thanos-community-content.yml`
  - Uses workflow inputs: `minimum_entries=100`, `prune_mode=contributors_only`, `dry_run=false`

Both endpoints use the same auth model:

- `Authorization: Bearer <CRON_SECRET>`
- `GITHUB_PAT` for GitHub workflow dispatch access

---

## Concurrency note

The GitHub Actions workflow has `concurrency.cancel-in-progress: false`, so
if a previous run is still queued when the next cron fires, it will not be
cancelled — it will queue behind the in-progress run. This prevents issues
from being skipped due to cancellation.
