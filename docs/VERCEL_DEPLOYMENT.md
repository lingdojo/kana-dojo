# Vercel Deployment Documentation

This guide explains how KanaDojo is deployed to Vercel and how the deployment pipeline works.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Deployment Process](#deployment-process)
- [Environments](#environments)
- [Environment Variables](#environment-variables)
- [Custom Domains](#custom-domains)
- [Build Configuration](#build-configuration)
- [Performance & Caching](#performance--caching)
- [Troubleshooting](#troubleshooting)

---

## Overview

KanaDojo is deployed to **Vercel**, a platform optimized for Next.js applications. The deployment pipeline is fully automated through GitHub Actions and includes:

- Automatic deployments on push to `main`
- Preview deployments for pull requests
- Discord notifications for deployment status
- Edge caching for optimal performance

---

## Deployment Process

### 1. Push to Main

When code is pushed to the `main` branch:

1. **GitHub Actions** triggers the deployment workflow
2. **Vercel** receives the webhook and starts building
3. **Build Process** runs:
   - TypeScript compilation (`tsc --noEmit`)
   - Next.js build (`next build`)
   - Sitemap generation (`postbuild` script)
4. **Deployment** to production environment
5. **Notification** sent to Discord (success or failure)

### 2. Pull Request Preview

For each pull request:

1. Vercel automatically creates a preview deployment
2. Preview URL is added as a comment on the PR
3. Preview builds run the same checks as production
4. Preview deployments are deleted when PR is merged/closed

---

## Environments

| Environment     | Branch      | URL            | Purpose              |
| --------------- | ----------- | -------------- | -------------------- |
| **Production**  | `main`      | kanadojo.com   | Live application     |
| **Preview**     | PR branches | `*.vercel.app` | Testing before merge |
| **Development** | Any branch  | Local          | Development          |

### Production Environment

- **URL**: https://kanadojo.com
- **Region**: Vercel's default (typicallyiad1 - Washington, D.C.)
- **Framework**: Next.js 15 with Turbopack
- **Edge Functions**: Enabled for API routes

---

## Environment Variables

### Required Variables

| Variable                        | Description                      | Where to Get                                              |
| ------------------------------- | -------------------------------- | --------------------------------------------------------- |
| `GOOGLE_TRANSLATE_API_KEY`      | Google Cloud Translation API key | [Google Cloud Console](https://console.cloud.google.com/) |
| `NEXT_PUBLIC_GA_ID`             | Google Analytics measurement ID  | [Google Analytics](https://analytics.google.com/)         |
| `NEXT_PUBLIC_POSTHOG_KEY`       | PostHog API key                  | [PostHog](https://posthog.com/)                           |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL             | [Supabase](https://supabase.com/)                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key           | [Supabase](https://supabase.com/)                         |

### Optional Variables

| Variable              | Description                       | Default |
| --------------------- | --------------------------------- | ------- |
| `DISCORD_WEBHOOK_URL` | Discord webhook for notifications | Not set |
| `SENTRY_DSN`          | Sentry error tracking             | Not set |
| `ANALYZE`             | Bundle analysis                   | `false` |

### Setting Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/lingdojo/kanadojo)
2. Navigate to **Settings** → **Environment Variables**
3. Add variables for each environment (Production, Preview, Development)
4. Redeploy to apply changes

---

## Custom Domains

KanaDojo uses the following custom domains:

| Domain             | Type       | Configuration               |
| ------------------ | ---------- | --------------------------- |
| `kanadojo.com`     | Production | A record pointing to Vercel |
| `www.kanadojo.com` | Redirect   | CNAME to main domain        |

### Domain Settings

- **SSL/TLS**: Automatically provisioned by Vercel
- **HTTPS**: Always enforced
- **WWW**: Redirects to apex domain

---

## Build Configuration

### Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Enable turbopack in dev
  experimental: {
    turbo: {
      resolveAlias: {
        '@/*': './*'
      }
    }
  },

  // Image optimization
  images: {
    domains: ['kanadojo.com'],
    formats: ['image/avif', 'image/webp']
  },

  // Enable i18n
  i18n: {
    locales: ['en', 'es', 'ja'],
    defaultLocale: 'en',
    localeDetection: true
  }
};

export default nextConfig;
```

### Build Scripts

```bash
# package.json scripts
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "postbuild": "next-sitemap",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

### Output

After a successful build, Vercel produces:

- **Serverless Functions**: API routes (Edge runtime)
- **Static Assets**: JavaScript, CSS, images
- **Edge Config**: Internationalization routing
- **Headers**: Security and caching headers

---

## Performance & Caching

### Caching Strategy

| Resource Type | Cache-Control            | S-MaxAge | Stale-While-Revalidate |
| ------------- | ------------------------ | -------- | ---------------------- |
| Static Assets | public, max-age=31536000 | 31536000 | -                      |
| API Responses | varies                   | varies   | varies                 |
| OG Images     | public, max-age=86400    | 86400    | 604800                 |

### Edge Network

- **CDN**: Vercel's global edge network (35+ regions)
- **Edge Functions**: API routes run at edge for low latency
- **ISR**: Incremental Static Regeneration not enabled (uses SSR)

### Performance Metrics

| Metric | Target  | Actual |
| ------ | ------- | ------ |
| LCP    | < 2.5s  | ~1.2s  |
| FID    | < 100ms | ~45ms  |
| CLS    | < 0.1   | ~0.02  |

---

## Troubleshooting

### Build Failures

**Common Causes**:

1. **TypeScript Errors**

   ```bash
   # Run locally to check
   npm run check
   ```

2. **Missing Environment Variables**
   - Check Vercel dashboard for missing vars
   - Ensure they're set for correct environment

3. **Dependency Issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules .next
   npm install
   npm run build
   ```

### Deployment Stuck

1. Check [Vercel Dashboard](https://vercel.com/lingdojo/kanadojo) for status
2. View build logs for errors
3. Try manual redeploy from dashboard

### Performance Issues

1. Check Vercel Analytics dashboard
2. Review Core Web Vitals
3. Consider adding edge caching headers

### Rollback

To rollback to a previous deployment:

1. Go to [Vercel Dashboard](https://vercel.com/lingdojo/kanadojo)
2. Navigate to **Deployments**
3. Find the working deployment
4. Click **...** → **Redeploy**

---

## Discord Notifications

The deployment pipeline sends notifications to Discord:

### Success Notification

- **Title**: Vercel Deploy Succeeded (production)
- **Color**: Green (3066993)
- **Includes**: Repository, environment, commit, deployment URL

### Failure Notification

- **Title**: Vercel Deploy Failed (environment)
- **Color**: Red (15158332) for production, Orange for preview
- **Includes**: Error details, commit, deployment URL, workflow run link

### Setup

1. Create a Discord webhook URL
2. Add to GitHub repository secrets: `DISCORD_WEBHOOK_URL`
3. Workflows automatically send notifications

---

## Related Documentation

- [GitHub Workflows](./GITHUB_WORKFLOWS.md)
- [Architecture](./ARCHITECTURE.md)
- [Performance](./PERFORMANCE_OPTIMIZATIONS.md)

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/cli)
