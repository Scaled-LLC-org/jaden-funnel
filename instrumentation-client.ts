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
import { stepForPath } from '@/lib/funnel-map'

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

/**
 * Build funnel_pageview properties from a destination URL: the pathname plus the
 * resolved funnel step + 0-based depth (from lib/funnel-map). The `funnel` id and
 * UTM attribution ride along automatically as PostHog super properties — see
 * `registerFunnelContext` in lib/analytics/posthog.ts.
 */
function pageviewProps(href: string): Record<string, unknown> {
  let path = href
  try {
    path = new URL(href, window.location.origin).pathname
  } catch {
    /* href is already a bare pathname — use it as-is */
  }
  const resolved = stepForPath(path)
  return {
    url: href,
    path,
    step: resolved?.step ?? 'off_funnel',
    step_index: resolved?.stepIndex ?? null,
  }
}

try {
  initPostHog()
  captureEvent('funnel_pageview', { phase: 'init', ...pageviewProps(window.location.href) })
} catch (err) {
  logger.error('analytics_init_failed', {
    message: err instanceof Error ? err.message : 'unknown',
  })
}

/**
 * Fires on every client-side route change (push / replace / traverse).
 * PostHog auto-captures `$pageview` via `capture_pageview: "history_change"`,
 * so here we just emit the enriched funnel event for the logger/PostHog seam.
 */
export function onRouterTransitionStart(url: string, navigationType: 'push' | 'replace' | 'traverse'): void {
  try {
    captureEvent('funnel_pageview', { ...pageviewProps(url), navigationType })
  } catch {
    /* never let tracking break navigation */
  }
}
