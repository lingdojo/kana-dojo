// shared/analytics/posthog-server.ts

/**
 * Server-side PostHog helpers.
 *
 * These functions are the only sanctioned way for server code (API routes,
 * server actions, route handlers) to emit PostHog events. They:
 *
 *   1. Read the singleton client initialized in `instrumentation.ts`.
 *   2. Never throw - analytics must never break user-facing routes.
 *   3. Log internal failures via `console.error` (kept in production by
 *      `next.config.ts` `removeConsole.exclude`).
 *
 * If the server-side SDK was never initialized (e.g. missing
 * `POSTHOG_API_KEY`), all calls are silent no-ops.
 */

import type { PostHog } from 'posthog-node';

function getClient(): PostHog | null {
  return globalThis.__posthogServer ?? null;
}

export function captureServerEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  const client = getClient();
  if (!client) return;

  try {
    client.capture({
      distinctId: 'server',
      event,
      properties,
    });
  } catch (err) {
    console.error('[PostHog:server] capture failed:', err);
  }
}

export function identifyServerUser(
  distinctId: string,
  properties?: Record<string, unknown>,
): void {
  const client = getClient();
  if (!client) return;

  try {
    client.identify({ distinctId, properties });
  } catch (err) {
    console.error('[PostHog:server] identify failed:', err);
  }
}

export async function shutdownPostHogServer(): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    await client.shutdown();
  } catch (err) {
    console.error('[PostHog:server] shutdown failed:', err);
  }
}
