# GitHub Metrics Automation

This project includes a scheduled GitHub Actions workflow that appends a daily snapshot of repository metrics (stars, forks, contributors) to `data/github-metrics.json`.

## What It Does

- Runs every day at 19:00 UTC.
- Fetches the current counts for stars, forks, and contributors.
- Appends a new entry with the exact collection timestamp.
- Calculates diff values vs the last entry in the file.
- Commits the update back to the repository.

## Data Format

`data/github-metrics.json` is an append-only JSON array. Each entry looks like:

```json
{
  "collectedAt": "2026-02-09T19:00:12Z",
  "stars": 1234,
  "forks": 56,
  "contributors": 388,
  "diff": { "stars": 4, "forks": 1, "contributors": 0 }
}
```

`diff` values are computed against the last entry in the file. If no prior entry exists, diffs are `0`.

## Workflow

The workflow file is:

- `.github/workflows/github-metrics.yml`

Schedule:

- `0 19 * * *` (19:00 UTC)

Manual run:

- `workflow_dispatch` is enabled in GitHub Actions.

## Contributor Count

The script uses GitHub's contributors endpoint with pagination to compute the count:

- `GET /repos/{owner}/{repo}/contributors?per_page=1`
- If the `Link` header includes `rel="last"`, the last page number is the total count.
- If no `Link` header is present, the array length is used (0 or 1).

**Note:** The count may differ by ±1-3 from what's shown on GitHub's website due to:

- Caching delays on GitHub's end
- Edge cases in how deleted/renamed accounts and bots are handled
- Anonymous Git contributors (not included in our count to match the website)

This is the most reliable and efficient approach available via the API.

## Script

The collector script is located at:

- `scripts/github/collect-github-metrics.mjs`

Environment variables:

- `GITHUB_TOKEN` (required)
- `REPO_SLUG` (defaults to `GITHUB_REPOSITORY`)
- `METRICS_FILE` (defaults to `data/github-metrics.json`)

If any API call fails or returns invalid data, the script exits cleanly without writing or failing the workflow.

## Manual Steps

1. Ensure GitHub Actions are enabled for the repository.
2. Ensure Actions have `contents: write` permission (repo settings).
3. If your org blocks `GITHUB_TOKEN` from pushing, create a fine-grained PAT with:
   - `Contents: Read and write`
     Then add it as a repository secret (e.g. `METRICS_TOKEN`) and update the workflow to use it.
