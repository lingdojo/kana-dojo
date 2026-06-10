// instrumentation.ts

/**
 * Next.js server-side instrumentation entry point.
 *
 * Runs once per server boot on production deployments. Initializes a single
 * server-side PostHog client (using `posthog-node`) and stashes it on
 * `globalThis` so it survives Next.js dev HMR reloads.
 *
 * The actual capture helpers live in `@/shared/analytics/posthog-server` so
 * consumers never need to import `posthog-node` directly.
 */

declare global {
  var __posthogServer: import('posthog-node').PostHog | undefined;
}

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production'
  ) {
    return;
  }

  const apiKey = process.env.POSTHOG_API_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    console.warn(
      '[PostHog:server] No PostHog API key configured; server-side analytics disabled.',
    );
    return;
  }

  const host = process.env.POSTHOG_HOST ?? process.env.NEXT_PUBLIC_POSTHOG_HOST;

  try {
    const { PostHog } = await import('posthog-node');

    if (!globalThis.__posthogServer) {
      globalThis.__posthogServer = new PostHog(apiKey, {
        host,
        flushAt: 1,
        persistence: 'memory',
      });
    }
  } catch (err) {
    console.error('[PostHog:server] Failed to initialize:', err);
  }
}
