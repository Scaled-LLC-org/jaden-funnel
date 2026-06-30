/**
 * Funnel topology — the single source of truth for the funnel's shape.
 *
 * `app/sitemap.ts` and `app/funnelmap.json/route.ts` both derive from this, so
 * the SEO sitemap, the machine-readable funnelmap, and the docs can never drift.
 * Update this file when a route, transition, param, or conversion event changes.
 *
 * State model: the funnel is stateless — each step rebuilds context from the URL
 * query string and forwards it onward (see LLM_GUIDE §3). `writesParams` are the
 * params a step appends when navigating to its `next` step.
 */

export type StepId = 'home' | 'quiz' | 'results' | 'vsl' | 'book' | 'thank-you' | 'community'

export interface FunnelTransition {
  /** Target step id, or an external boundary id (see FUNNEL.external). */
  to: StepId | string
  /** How the transition happens (code path / mechanism). */
  via: string
  /** True when control leaves the app (e.g. Calendly, Skool). */
  external?: boolean
}

export interface FunnelStep {
  id: StepId
  path: string
  title: string
  /** What this step does in the funnel. */
  role: string
  /** How it renders: server page, or a client island prerendered by a server page. */
  render: 'server' | 'client-island'
  /** searchParams the step reads. */
  readsParams: string[]
  /** Params the step appends to the URL when navigating to its next step. */
  writesParams: string[]
  next: FunnelTransition[]
  /** Step-specific analytics/logger events (global events are listed separately). */
  events: string[]
  /** Sitemap hints. */
  sitemap: { priority: number; changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' }
}

const QUIZ_WRITES = ['age', 'goals', 'situation', 'frequency', 'natural', 'commit', 'name', 'email', 'phone']
const QUIZ_EVENTS = ['quiz_start', 'quiz_answer', 'quiz_back', 'quiz_lead_submitted', 'quiz_lead_submit_failed', 'form_submit', 'opt_in']

export const FUNNEL = {
  name: 'Aesthetic Mastery — Jaden Levin lead funnel',
  brand: 'Aesthetic Mastery',
  description: 'Quiz → VSL → Calendly booking → post-booking nurture. Funnel state rides the URL query string; each step forwards it onward.',
  /** The single conversion point — the quiz email screen (lib/lead-submit.ts). */
  conversion: { step: 'quiz' as StepId, event: 'opt_in', sinks: ['posthog', 'pipedream', 'supabase'] },
  /** Events fired on every step by the analytics layer (instrumentation-client + PostHog). */
  globalEvents: ['funnel_pageview', '$pageview', '$pageleave', 'autocapture'],

  steps: [
    {
      id: 'home',
      path: '/',
      title: 'Quiz (home)',
      role: 'Funnel entry — multi-step quiz + lead capture (name / email / phone).',
      render: 'client-island',
      readsParams: [],
      writesParams: QUIZ_WRITES,
      next: [{ to: 'results', via: 'QuizFlow.finish() → submitLead() → router.push(/results?…)' }],
      events: QUIZ_EVENTS,
      sitemap: { priority: 1.0, changeFrequency: 'weekly' },
    },
    {
      id: 'quiz',
      path: '/quiz',
      title: 'Quiz (alias)',
      role: 'Same QuizFlow as home, at /quiz.',
      render: 'client-island',
      readsParams: [],
      writesParams: QUIZ_WRITES,
      next: [{ to: 'results', via: 'QuizFlow.finish() → submitLead() → router.push(/results?…)' }],
      events: QUIZ_EVENTS,
      sitemap: { priority: 0.9, changeFrequency: 'weekly' },
    },
    {
      id: 'results',
      path: '/results',
      title: 'Scored physique blueprint',
      role: 'SSR 4-pillar score report from the quiz answers.',
      render: 'server',
      readsParams: ['age', 'goals', 'situation', 'frequency', 'natural', 'commit', 'name'],
      writesParams: ['*'],
      next: [{ to: 'vsl', via: 'CTA Link → /vsl?{toQuery(sp)}' }],
      events: ['results_scored'],
      sitemap: { priority: 0.6, changeFrequency: 'monthly' },
    },
    {
      id: 'vsl',
      path: '/vsl',
      title: 'VSL',
      role: 'Sales video with a click-to-pause exit-intent CTA.',
      render: 'server',
      readsParams: ['*'],
      writesParams: ['*'],
      next: [{ to: 'book', via: 'CTA Link + exit-intent overlay → /book?{toQuery(sp)}' }],
      events: ['vsl_play', 'vsl_exit_intent_shown', 'vsl_cta_click', 'video_watched'],
      sitemap: { priority: 0.6, changeFrequency: 'monthly' },
    },
    {
      id: 'book',
      path: '/book',
      title: 'Booking',
      role: 'Inline Calendly booking widget.',
      render: 'server',
      readsParams: ['goal'],
      writesParams: [],
      next: [{ to: 'calendly', via: 'Calendly inline widget', external: true }],
      events: ['booking_view', 'calendly_loaded', 'calendly_load_failed'],
      sitemap: { priority: 0.6, changeFrequency: 'monthly' },
    },
    {
      id: 'thank-you',
      path: '/thank-you',
      title: 'Post-booking nurture',
      role: 'Confirmation + pre-call videos; localizes the Calendly call time to the viewer.',
      render: 'server',
      readsParams: ['invitee_first_name', 'event_start_time', 'date', 'time', 'name', 'start', 'iso'],
      writesParams: [],
      next: [],
      events: ['call_when_parse_failed', 'video_play', 'thank_you_confirm_click'],
      sitemap: { priority: 0.4, changeFrequency: 'monthly' },
    },
    {
      id: 'community',
      path: '/community',
      title: 'Community upsell',
      role: 'Standalone Skool membership upsell ($97/mo). Not part of the linear quiz path.',
      render: 'server',
      readsParams: [],
      writesParams: [],
      next: [{ to: 'skool', via: 'external <a> → SKOOL_URL', external: true }],
      events: [],
      sitemap: { priority: 0.7, changeFrequency: 'monthly' },
    },
  ] satisfies FunnelStep[],

  /** External boundaries the funnel hands off to. */
  external: [
    {
      id: 'calendly',
      name: 'Calendly',
      role: 'Hosted booking. On completion, redirects back to /thank-you with invitee_first_name + event_start_time.',
      between: ['book', 'thank-you'],
    },
    { id: 'skool', name: 'Skool', role: 'Hosted community checkout (membership).', from: 'community' },
  ],
} as const

/** Build the deployable funnelmap document (absolute URLs + a build/deploy timestamp). */
export function buildFunnelMap({ siteUrl, generatedAt }: { siteUrl: string; generatedAt: string }) {
  return {
    $schema: 'https://aesthetic-mastery/funnelmap.schema.json',
    version: 1,
    name: FUNNEL.name,
    brand: FUNNEL.brand,
    description: FUNNEL.description,
    generatedAt,
    siteUrl,
    conversion: FUNNEL.conversion,
    globalEvents: FUNNEL.globalEvents,
    entry: `${siteUrl}/`,
    steps: FUNNEL.steps.map(s => ({
      ...s,
      url: `${siteUrl}${s.path === '/' ? '' : s.path}`,
    })),
    external: FUNNEL.external,
  }
}
