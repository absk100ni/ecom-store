// Sentry — error reporting with aggressive quota protection.
// Gated: production mode + DSN set. Free tier = 5k events/mo shared.

import * as Sentry from '@sentry/react';

const DSN = import.meta.env.VITE_SENTRY_DSN || '';
const MAX_EVENTS_PER_SESSION = 10;

let eventCount = 0;

/** Initialise Sentry — call once at app boot. No-ops in dev or when DSN is unset. */
export function initSentry(): void {
  if (!import.meta.env.PROD || !DSN) return;

  Sentry.init({
    dsn: DSN,
    environment: 'production',
    release: `ecom-store@${__APP_VERSION__}`,

    // NO performance monitoring — quota eater
    tracesSampleRate: 0,

    // NO Replay integration — biggest quota eater

    sampleRate: 1.0,

    ignoreErrors: [
      // Network noise
      'Network Error',
      'Failed to fetch',
      'Load failed',
      'AbortError',
      'timeout of',
      'Request aborted',
      // Browser quirks
      'ResizeObserver loop',
      'ResizeObserver loop completed with undelivered notifications',
      // Chunk/dynamic-import failures (code-split reloads)
      'ChunkLoadError',
      /Loading chunk [\d]+ failed/,
      /dynamically imported module/,
    ],

    denyUrls: [
      // Browser extensions inject noise
      /chrome-extension:\/\//,
      /moz-extension:\/\//,
      /safari-extension:\/\//,
    ],

    beforeSend(event) {
      // Drop events with no usable stacktrace (cross-origin "Script error.")
      const exception = event.exception?.values?.[0];
      if (
        exception &&
        exception.value === 'Script error.' &&
        (!exception.stacktrace || !exception.stacktrace.frames?.length)
      ) {
        return null;
      }

      // Client-side rate cap — max 10 events per session
      eventCount++;
      if (eventCount > MAX_EVENTS_PER_SESSION) return null;

      return event;
    },
  });
}

/** Re-export for ErrorBoundary usage */
export { Sentry };
