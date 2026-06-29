/**
 * Central funnel configuration — the single source of truth for every
 * third-party credential and integration URL. Never hardcode keys elsewhere.
 *
 * `PLACEHOLDER_*` values let the app compile and run end-to-end. Each
 * integration's init code calls `isPlaceholder()` and skips gracefully at
 * runtime when its credential is still a placeholder, so the funnel works
 * with zero configuration and lights up integration-by-integration as real
 * values are filled in.
 */
export const config = {
  supabase: {
    url: 'https://ulsrfseshjkmttxoltjx.supabase.co',
    anonKey: 'sb_publishable_Fc15jaLVUkOlfTHjjtefYw_xe6fAR0I',
    schema: 'scaled_landings' as const,
  },
  sanity: {
    projectId: '9ow7m6l3',
    dataset: 'production',
    apiVersion: '2026-06-29',
    useCdn: true,
  },
  posthog: {
    apiKey: 'phc_AVFN7iK5RNBXkXxjALeG63LBduWqeQdJWfX6WYhKzR2K',
    apiHost: 'https://us.i.posthog.com',
    uiHost: 'https://us.posthog.com',
  },
  pipedream: {
    // The quiz email screen is the single lead-capture point in this funnel.
    quizWebhook: 'https://b39f8fdb14bc856d9ee69d3263ad906d.m.pipedream.net?workspace=121',
  },
  calendly: {
    // Existing funnel books via Calendly (see CalendlyEmbed / app/book).
    url: 'PLACEHOLDER_CALENDLY_URL',
  },
  social: {
    youtube: 'PLACEHOLDER_YOUTUBE_URL',
    instagram: 'PLACEHOLDER_INSTAGRAM_URL',
    tiktok: 'PLACEHOLDER_TIKTOK_URL',
  },
  /** Differentiates this client inside the shared `scaled_landings` schema. */
  workspaceId: 121,
} as const

/** True when a config value is still an unset `PLACEHOLDER_*` sentinel. */
export function isPlaceholder(value: string): boolean {
  return typeof value === 'string' && value.startsWith('PLACEHOLDER_')
}
