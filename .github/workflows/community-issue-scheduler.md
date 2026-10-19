# Community issue scheduler

This guide describes how cron-job.org triggers
[`hourly-community-issue.yml`](./hourly-community-issue.yml) through
[`app/api/trigger-community-issue/route.ts`](../../app/api/trigger-community-issue/route.ts).

## Modes

`COMMUNITY_ISSUE_RANDOM_SCHEDULER_ENABLED` in
[`scheduler.ts`](../../app/api/trigger-community-issue/scheduler.ts) is the
source-controlled boolean switch. It is currently `true`, enabling random
mode. Set it to `false` and redeploy to restore deterministic behavior: every
cron-job.org request dispatches the workflow, with no random-scheduler state or
callback required. Changing this constant requires a redeployment.

In random mode, cron-job.org polls the endpoint at a fixed cadence of exactly
every 5 minutes (`*/5 * * * *`). The endpoint atomically claims a due run in Upstash Redis and
dispatches at most one workflow for that due time. After a created issue, the
workflow reports completion and the next delay is a uniformly selected whole
number of minutes, inclusive of the configured minimum and maximum. Polling
means the actual delay can be up to one poll interval longer than the selected
delay.

If the run finds no eligible issue, it schedules a short retry. If dispatch or
the workflow fails before it can report an outcome, the due time remains
unchanged; the claim lease expires after 15 minutes and a later poll retries.
Manual workflow runs without an internal scheduler run ID do not update random
scheduler state.

## Configuration

Set these Vercel Production environment variables (and redeploy):

| Variable | Default | Purpose |
| --- | --- | --- |
| `COMMUNITY_ISSUE_RANDOM_INTERVAL_MINUTES_MIN` | `30` | Inclusive minimum after a created issue. |
| `COMMUNITY_ISSUE_RANDOM_INTERVAL_MINUTES_MAX` | `65` | Inclusive maximum after a created issue. |
| `COMMUNITY_ISSUE_NO_ITEM_RETRY_MINUTES` | `10` | Retry delay when no eligible issue can be created. |
| `UPSTASH_REDIS_REST_URL` | — | Existing Upstash Redis REST URL. Required in random mode. |
| `UPSTASH_REDIS_REST_TOKEN` | — | Existing Upstash Redis REST token. Required in random mode. |
| `CRON_SECRET` | — | Shared bearer token for cron-job.org requests. |
| `GITHUB_PAT` | — | Token authorized to dispatch the workflow. |
| `COMMUNITY_ISSUE_SCHEDULER_CALLBACK_SECRET` | — | Shared callback bearer token; configure the same value in Vercel and GitHub Actions secrets. |

Also configure these GitHub repository settings:

- **Actions secret** `COMMUNITY_ISSUE_SCHEDULER_CALLBACK_SECRET`: same value as
  the Vercel variable above.
- **Actions variable** `COMMUNITY_ISSUE_SCHEDULER_CALLBACK_URL`:
  `https://kanadojo.com/api/trigger-community-issue/complete`.

Use whole-number bounds satisfying `1 <= min <= max`; retry must be at least
one minute. Random mode fails closed with a service error if Redis, the callback
secret, or valid interval configuration is missing. Create a strong random
callback secret and do not commit it.

## cron-job.org setup

Configure a `POST` request to
`https://kanadojo.com/api/trigger-community-issue` with:

- `Authorization: Bearer <CRON_SECRET>`
- `Content-Type: application/json`
- Body: `{}`

Keep the existing deterministic interval when the feature flag is off. When
random mode is enabled, configure cron-job.org to poll **every 5 minutes**
(`*/5 * * * *`); do not leave the current 57-minute schedule in place.
The endpoint returns `dispatched: false` when a random-mode poll is early or
another request already holds the due-run claim.

## Safety and operations

- Redis Lua scripts atomically check due time and claim/release the run to
  protect against overlapping or retried cron requests.
- Callback requests require the shared bearer secret and the active run ID;
  stale or duplicate callbacks cannot advance scheduler state.
- A created issue advances the next run by a random configured interval. A
  no-item outcome advances by the retry interval. A failure leaves it due.
- To switch modes, change the boolean constant in `scheduler.ts` and redeploy. No
  issue backlog state is reset by switching modes.
- If callback delivery fails after issue creation, the lease eventually
  expires and another issue could be created before the normal interval. Check
  GitHub Actions logs and the callback secret/URL when investigating this case.
