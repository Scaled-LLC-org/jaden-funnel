/**
 * Lead-submission orchestrator — the single funnel conversion path.
 *
 * Fires PostHog analytics immediately, then fans the lead out to Pipedream and
 * Supabase in parallel. Every sink is individually placeholder-guarded and
 * failure-isolated: a down integration never blocks the lead or the redirect.
 */
import { config, isPlaceholder } from '@/lib/config'
import { logger } from '@/lib/logger'
import { insertOptIn, type OptInData } from '@/lib/supabase/optIn'
import { captureEvent, identifyUser } from '@/lib/analytics/posthog'

/** POST the lead to the funnel's Pipedream webhook (fire-and-forget, no-cors). */
async function postPipedream(data: OptInData): Promise<void> {
  if (isPlaceholder(config.pipedream.quizWebhook)) {
    logger.debug('pipedream_skipped_placeholder')
    return
  }
  try {
    await fetch(config.pipedream.quizWebhook, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
        phone: data.phone,
        ...data.formData,
        ...(data.utms ?? {}),
      }),
    })
  } catch (err) {
    logger.warn('pipedream_post_failed', {
      message: err instanceof Error ? err.message : 'unknown',
    })
  }
}

/**
 * Run the full conversion path for a captured lead. Resolves once both data
 * sinks have settled. Never throws.
 */
export async function submitLead(data: OptInData): Promise<void> {
  // Analytics first — synchronous, client-side, instant.
  captureEvent('form_submit', { form_name: 'quiz', funnel: config.funnelId })
  captureEvent('opt_in', {
    funnel: config.funnelId,
    answerKeys: Object.keys(data.formData ?? {}),
  })
  if (data.email) {
    identifyUser(data.email, {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
    })
  }

  // Data sinks in parallel; allSettled so one failure never rejects the path.
  await Promise.allSettled([postPipedream(data), insertOptIn(data)])
}
