/**
 * PostHog analytics (client-side). Ported from the Vite reference.
 *
 * SSR-safe and placeholder-aware: every public function early-returns on the
 * server and when `config.posthog.apiKey` is still a `PLACEHOLDER_*` sentinel.
 * Events captured before `initPostHog()` resolves are queued and replayed.
 */
import type { PostHog } from 'posthog-js'
import { config, isPlaceholder } from '@/lib/config'
import { logger } from '@/lib/logger'

let ph: PostHog | null = null
const pendingEvents: Array<{ name: string; properties?: Record<string, unknown> }> = []
const IDENTITY_KEY = 'jaden_identity'

function capture(eventName: string, properties?: Record<string, unknown>): void {
  if (ph) {
    ph.capture(eventName, properties)
  } else {
    pendingEvents.push({ name: eventName, properties })
  }
}

/** Initialize PostHog. No-op on the server or when the API key is a placeholder. */
export async function initPostHog(): Promise<void> {
  if (typeof window === 'undefined') return
  if (isPlaceholder(config.posthog.apiKey)) {
    logger.debug('posthog_skipped_placeholder')
    return
  }

  const { default: posthog } = await import('posthog-js')
  posthog.init(config.posthog.apiKey, {
    api_host: config.posthog.apiHost,
    ui_host: config.posthog.uiHost,
    person_profiles: 'always',
    capture_pageview: 'history_change',
    capture_pageleave: true,
    autocapture: true,
  })
  ph = posthog
  logger.info('posthog_init_success')

  // Replay any events that fired before PostHog was ready.
  while (pendingEvents.length) {
    const evt = pendingEvents.shift()!
    ph.capture(evt.name, evt.properties)
  }

  reidentifyFromCache()
}

/**
 * Capture an arbitrary PostHog event. Use this for funnel events such as
 * `funnel_pageview`, `form_submit`, `opt_in`, and `video_watched`.
 */
export function captureEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  logger.info(eventName)
  capture(eventName, properties)
}

/** Identify the current person. Allowed to receive email — this is the analytics layer. */
export function identifyUser(distinctId: string, traits?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  logger.info('posthog_identify')
  ph?.identify(distinctId, { ...traits })

  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify({ distinctId, ...traits }))
  } catch {
    /* localStorage unavailable — ignore */
  }
}

/** Safe accessor for the underlying PostHog instance (null until initialized). */
export function getPostHog(): PostHog | null {
  return ph
}

function reidentifyFromCache(): void {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY)
    if (!raw) return
    const { distinctId, ...traits } = JSON.parse(raw)
    if (distinctId) {
      logger.info('posthog_reidentify_from_cache')
      ph?.identify(distinctId, { ...traits })
    }
  } catch {
    /* corrupt cache — ignore */
  }
}

/**
 * Flush the PostHog event queue. Call before hard redirects
 * (`window.location.href`) to avoid event loss.
 */
export function flushPostHog(): Promise<void> {
  if (!ph) return Promise.resolve()
  return new Promise(resolve => {
    try {
      const phAny = ph as unknown as {
        _requestQueue?: { flush?: () => void }
        flush?: () => void
      }
      const flush = phAny._requestQueue?.flush ?? phAny.flush
      if (typeof flush === 'function') {
        flush.call(phAny._requestQueue ?? phAny)
      }
    } catch {
      /* best-effort flush — ignore */
    }
    // Allow time for the network request to complete.
    setTimeout(resolve, 600)
  })
}
