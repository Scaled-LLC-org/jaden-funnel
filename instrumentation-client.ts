/**
 * Next.js client instrumentation — runs once after the HTML loads and before
 * React hydration (the canonical home for third-party analytics init).
 * PostHog is SSR-safe and no-ops while its key is a PLACEHOLDER_* value, so
 * this is safe to ship unconfigured.
 *
 * Docs: app/api-reference/file-conventions/instrumentation-client
 */
import { initPostHog, captureEvent } from '@/lib/analytics/posthog'
import { logger, getLogLevel, isLogOverridden } from '@/lib/logger'

// Boot banner — surfaces the active log level and how to crank it (harp-style).
// With `?debug` (or localStorage.am_debug) this confirms verbose logging is ON.
if (isLogOverridden()) {
  console.log(`%c🐛 funnel debug logging ON %c(level: ${getLogLevel()})`, 'color:#0086a8;font-weight:bold', 'color:#888')
} else {
  console.log(
    `%c[funnel]%c log level: ${getLogLevel()} — append %c?debug%c to the URL for verbose logs`,
    'color:#0086a8;font-weight:bold',
    'color:#888',
    'color:#0086a8;font-weight:bold',
    'color:#888',
  )
}

try {
  initPostHog()
  captureEvent('funnel_pageview', { phase: 'init' })
} catch (err) {
  logger.error('analytics_init_failed', {
    message: err instanceof Error ? err.message : 'unknown',
  })
}

/**
 * Fires on every client-side route change (push / replace / traverse).
 * PostHog auto-captures `$pageview` via `capture_pageview: "history_change"`,
 * so here we just emit the funnel event for the logger/PostHog seam.
 */
export function onRouterTransitionStart(url: string, navigationType: 'push' | 'replace' | 'traverse'): void {
  try {
    captureEvent('funnel_pageview', { url, navigationType })
  } catch {
    /* never let tracking break navigation */
  }
}
