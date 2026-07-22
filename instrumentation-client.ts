// instrumentation-client.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://a6f82883d78e424ee7b578556b78743d@o4511608063197184.ingest.us.sentry.io/4511608067981312',
  // Performance rescue: Sentry Replay is intentionally disabled for now.
  // integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 0.1,
  enableLogs: true,
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

/**
 * Global Chunk Load Error Handler
 *
 * When a new deployment happens, cached HTML pages may reference old JS/CSS chunks
 * that no longer exist. This handler detects such failures and auto-reloads the page
 * to fetch fresh HTML with correct chunk references.
 */
const RELOAD_FLAG = 'kanadojo_chunk_reload';

// Only attempt one auto-reload per session to prevent infinite loops
if (typeof window !== 'undefined' && !sessionStorage.getItem(RELOAD_FLAG)) {
  window.addEventListener('error', event => {
    const error = event.error;
    const message = event.message || '';

    // Detect chunk loading failures
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      message.includes('Loading chunk') ||
      message.includes('Loading CSS chunk') ||
      (message.includes('Failed to fetch') &&
        message.includes('dynamically imported module'));

    if (isChunkError) {
      console.warn('[KanaDojo] Detected stale chunks, reloading page...');
      sessionStorage.setItem(RELOAD_FLAG, 'true');
      window.location.reload();
    }
  });

  // Also catch unhandled promise rejections (dynamic imports fail this way)
  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason;
    const message = reason?.message || String(reason) || '';

    const isChunkError =
      reason?.name === 'ChunkLoadError' ||
      message.includes('Loading chunk') ||
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('error loading dynamically imported module');

    if (isChunkError) {
      console.warn(
        '[KanaDojo] Detected stale chunks (promise rejection), reloading page...',
      );
      sessionStorage.setItem(RELOAD_FLAG, 'true');
      window.location.reload();
    }
  });
}
if (process.env.NODE_ENV === 'development') {
  console.log('PostHog client instrumentation disabled in development mode.');
}

/*
 * Performance rescue: PostHog is intentionally disabled without deleting the
 * integration. Re-enable only after a measured analytics rollout.
} else if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
) {
  // Dynamically import PostHog only in actual production deployments (not previews)
  import('posthog-js')
    .then(module => {
      const posthog = module?.default;
      if (typeof posthog?.init !== 'function') {
        console.warn('[PostHog] Loaded module has no init(); skipping.');
        return;
      }

      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      if (!posthogKey) {
        console.warn(
          'NEXT_PUBLIC_POSTHOG_KEY is not set; PostHog will not be initialized.',
        );
        return;
      }

      try {
        posthog.init(posthogKey, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          defaults: '2025-05-24',
        });
      } catch (err) {
        console.error('[PostHog] init() failed:', err);
      }
    })
    .catch(err => {
      console.error('[PostHog] Failed to load posthog-js:', err);
    });
}
*/
