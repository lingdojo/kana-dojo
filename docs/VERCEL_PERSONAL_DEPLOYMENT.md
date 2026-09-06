# Vercel Hobby Personal Deployment

This guide explains how to deploy a personal, non-commercial fork of KanaDojo to a Vercel Hobby project. It is for individual developers using a public GitHub fork, not for operating the official [kanadojo.com](https://kanadojo.com) service.

Vercel plan limits, fair-use rules, and terms can change. Check the current [Vercel plan documentation](https://vercel.com/docs/plans), [Cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing), and [Vercel fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines) before deploying.

You do not need a custom domain. Vercel's default `*.vercel.app` URL is sufficient. A default deployment is publicly accessible, so do not upload private data, passwords, API keys, or other secrets to the repository or the deployed application.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Before You Start](#before-you-start)
- [Recommended Branch Model](#recommended-branch-model)
- [Apply the Hobby Compatibility Change](#apply-the-hobby-compatibility-change)
- [Import the Fork into Vercel](#import-the-fork-into-vercel)
- [Environment Variables and Privacy](#environment-variables-and-privacy)
- [First Deployment and Verification](#first-deployment-and-verification)
- [Keep the Fork Up to Date](#keep-the-fork-up-to-date)
- [Rollback and Troubleshooting](#rollback-and-troubleshooting)
- [Related Documentation](#related-documentation)
- [Resources](#resources)

---

## Overview

This is a personal deployment path for a fork of the public [`lingdojo/kana-dojo`](https://github.com/lingdojo/kana-dojo) repository. It keeps the upstream `main` branch available as a mirror and maintains a small Hobby-compatible deployment override on a separate `deploy` branch.

The Vercel Hobby plan is intended for personal, non-commercial use and has resource, usage, Cron, and fair-use limits. Review the current plan terms before relying on a deployment for anything important. This guide does not describe the production infrastructure, domains, integrations, or operational practices for `kanadojo.com`.

---

## Before You Start

You need:

- A GitHub account with permission to create a fork
- A Vercel account connected to GitHub
- Git installed locally
- Node.js and npm installed locally; use a currently supported version for this repository rather than assuming a specific version

Create a fork of [`lingdojo/kana-dojo`](https://github.com/lingdojo/kana-dojo) in your GitHub account. The fork is the repository that Vercel should import.

For a Hobby team, the commit author must be the Hobby team owner, and that GitHub identity must be connected to the same Vercel account. Confirm that the Vercel GitHub App can access your fork. See [Vercel's Hobby Git deployment requirements](https://vercel.com/docs/git#using-hobby-teams) for the current rules.

---

## Recommended Branch Model

Keep `main` as an upstream mirror. Keep long-lived Hobby-specific changes, including the Cron removal below, on `deploy`.

### 1. Clone your fork

Replace `YOUR_GITHUB_USERNAME` with your GitHub username:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/kana-dojo.git
cd kana-dojo
```

### 2. Add the upstream repository

This lets you fetch changes from the official repository while keeping your fork as `origin`:

```bash
git remote add upstream https://github.com/lingdojo/kana-dojo.git
git remote -v
```

### 3. Create the deployment branch

Create `deploy` from the current upstream-compatible `main`:

```bash
git switch main
git switch -c deploy
git push -u origin deploy
```

Do not repeatedly rebase or force-push `deploy`. A stable branch makes Vercel deployments easier to trace and preserves the small personal override across upstream updates.

---

## Apply the Hobby Compatibility Change

The current upstream `vercel.json` schedules `/api/process-bug-reports` every 20 minutes. Vercel Hobby Cron supports at most one execution per day, so importing the file unchanged can fail with a plan or Cron schedule error.

On your personal `deploy` branch, remove the entire `crons` array from `vercel.json`. Keep the rest of the file, including its existing build and ignore settings, unchanged:

```diff
 "functions": {
   "app/api/process-bug-reports/route.ts": {
     "maxDuration": 60
   }
 },
-"crons": [
-  {
-    "path": "/api/process-bug-reports",
-    "schedule": "*/20 * * * *"
-  }
-],
 "headers": [
```

Commit and push this override only to your fork's `deploy` branch:

```bash
git add vercel.json
git commit -m "chore(deploy): make Vercel config Hobby compatible"
git push origin deploy
```

This is the minimum required Hobby-specific change. Do not submit it back to the upstream repository as an official production change. The upstream service may have different plan requirements and operational needs.

---

## Import the Fork into Vercel

### 1. Import the GitHub repository

In the Vercel dashboard, choose **Add New** → **Project**, select your fork, and import it. If Vercel cannot see the repository, install or update the Vercel GitHub App and grant it access to only the fork you intend to deploy. You do not need to grant access to every repository.

### 2. Review project settings

Use these settings during import:

| Setting                    | Value                                                        |
| -------------------------- | ------------------------------------------------------------ |
| Framework Preset           | **Next.js**                                                  |
| Root Directory             | Repository root, unless you intentionally changed the layout |
| Build and install settings | Prefer Vercel's automatic detection                          |
| Domain                     | Keep the generated `*.vercel.app` URL                        |

Do not add a custom domain just for this deployment.

### 3. Track the deployment branch

After import, open **Project Settings** → **Environments** → **Production** → **Branch Tracking** and set the Production Branch to `deploy`. Vercel may change this UI wording; if the setting has moved, use the current [production branch documentation](https://vercel.com/docs/git#customizing-the-production-branch).

Production deployments come from the configured production branch. Preview deployments are separate builds for other branches or pull requests and should be used to inspect changes before merging them into `deploy`. See [Vercel's Git deployment documentation](https://vercel.com/docs/git) for the current workflow.

---

## Environment Variables and Privacy

Never commit secrets to Git. Store them in the Vercel project under **Settings** → **Environment Variables**, and choose the appropriate **Production**, **Preview**, or **Development** scope. After changing an environment variable, redeploy so the new value is available to the running deployment. See [Vercel Environment Variables](https://vercel.com/docs/environment-variables) for current dashboard behavior.

For a personal public deployment:

- Consider setting `ANALYTICS_DISABLED=true` to disable analytics for your fork.
- Optional API-backed features may need their own credentials. Without those credentials, the corresponding feature may be unavailable.
- Review the repository's current Sentry and other observability configuration. Use your own project, configure it for your fork, or disable it where supported; this guide does not change the application's observability code.
- Treat the Production URL as public. Do not place private user data or secrets in the app.

[Vercel's native Password Protection](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/password-protection) is not a free Hobby capability. This documentation-only guide does not provide application-level authentication, so the default Production URL remains publicly accessible.

---

## First Deployment and Verification

Once `deploy` is configured as the Production Branch, push the branch to your fork. Vercel should start a deployment automatically:

```bash
git push origin deploy
```

Verify the result in the Vercel dashboard:

1. The deployment status becomes **Ready**.
2. The fixed Production URL is shown under the project and remains available for later visits.
3. The home page loads from the generated `*.vercel.app` URL.
4. The `/api/healthcheck` route responds if it is present in the current checkout.
5. A deliberately safe configuration check confirms that the intended environment variables are active; never print secret values in logs or commit them for testing.
6. Build and runtime logs contain no unresolved errors.

You can run a local check before pushing changes:

```bash
npm run check
```

Run relevant tests when they apply to your change. The repository's local checks can depend on the current checkout and environment; a passing local check does not replace reviewing the Vercel build and runtime logs.

---

## Keep the Fork Up to Date

Before syncing, save or commit any local work on `deploy`. Then update the mirror and carry the upstream changes into the deployment branch:

```bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git push origin main

git switch deploy
git merge main
git push origin deploy
```

If the merge conflicts in `vercel.json`, preserve the personal removal of the `crons` array and keep the upstream build, function, header, and ignore settings unless you have a specific reason to change them. Resolve and test the merge before pushing. Prefer a normal merge over force-pushing so the deployment history stays understandable.

---

## Rollback and Troubleshooting

### Hobby Cron schedule error

If deployment reports that a Cron expression is not allowed on Hobby, inspect `vercel.json` on `deploy` and remove the complete frequent `crons` array. Push the corrected branch and redeploy. Do not add a daily Cron unless you have verified that it is needed and allowed by the current plan.

### GitHub repository is not visible

Open the Vercel GitHub App settings and configure repository access for the fork. Return to the Vercel project import flow after access is updated.

### A push did not deploy

Confirm that:

- The Vercel Production Branch is `deploy`.
- The commit was pushed to the fork configured as the project repository.
- The commit author can be associated with the Vercel-connected GitHub account.
- The Vercel GitHub App still has access to the repository.

### An environment change is not active

Check the variable's environment scope, then trigger a new deployment. Existing deployments do not automatically receive changed values.

### A deployment was skipped

Inspect the deployment details and build logs, including the repository's configured `ignoreCommand`. Use a production-relevant change or start a manual redeploy when appropriate. Do not create meaningless code changes just to force a build.

### Roll back a bad deployment

Open the Vercel project **Deployments** page, select a known-good deployment, and use the available rollback or redeploy action. Confirm the Production URL after the rollback. Keep in mind that rollback does not undo a bad environment variable; correct the variable and redeploy separately.

### The Production URL should be private

The generated URL is public by default. Vercel native Password Protection is not included with the free Hobby plan, and this guide does not add application authentication. Do not deploy private data to this project.

---

## Related Documentation

- [Official Vercel deployment documentation](./VERCEL_DEPLOYMENT.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [GitHub Workflows](./GITHUB_WORKFLOWS.md)

---

## Resources

- [Vercel plans](https://vercel.com/docs/plans)
- [Vercel Cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Vercel fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- [Vercel Git deployments and production branches](https://vercel.com/docs/git)
- [Vercel deployment overview](https://vercel.com/docs/deployments/overview)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
- [GitHub forking a repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-permissions-and-visibility-of-forks)
