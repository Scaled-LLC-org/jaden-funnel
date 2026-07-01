/**
 * Funnel topology — the single source of truth for the funnel's shape.
 *
 * `app/sitemap.ts` and `app/funnelmap.md/route.ts` both derive from this, so the
 * SEO sitemap, the human-readable Markdown map, and the docs can never drift.
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
      title: 'Quiz — Home',
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
      title: 'Quiz — Alias',
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
      title: 'Results — Physique Blueprint',
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
      title: 'Sales Video (VSL)',
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
      title: 'Thank You — Pre-Call Nurture',
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
      title: 'Community Upsell',
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

// ─────────────────────────────────────────────────────────────────────────────
// Human-readable Markdown map (served at /funnelmap.md)
// ─────────────────────────────────────────────────────────────────────────────

type FunnelStepDef = (typeof FUNNEL.steps)[number]
type FunnelExternalDef = (typeof FUNNEL.external)[number]

const stepById = new Map<string, FunnelStepDef>(FUNNEL.steps.map(s => [s.id, s] as [string, FunnelStepDef]))
const externalById = new Map<string, FunnelExternalDef>(FUNNEL.external.map(e => [e.id, e] as [string, FunnelExternalDef]))

const nextOf = (id: string): readonly FunnelTransition[] => stepById.get(id)?.next ?? []

/** Resolve a transition target to an internal step, bridging external hops via `between`. */
function resolveInternalTarget(to: string): StepId | null {
  if (stepById.has(to)) return to as StepId
  const ext = externalById.get(to)
  if (ext && 'between' in ext) return ext.between[1] as StepId
  return null
}

export interface FunnelLevels {
  /** Main linear path, entry first. */
  mainPath: StepId[]
  /** 0-based depth for each main-path step. */
  levelOf: Map<StepId, number>
  /** Off-path steps that feed back into the main path (e.g. the /quiz alias). */
  alternateEntries: { id: StepId; level: number }[]
  /** Off-path steps that branch out and never rejoin (e.g. /community). */
  standalone: StepId[]
}

/**
 * Derive each page's level from the topology — no hardcoded depths, so it stays
 * in sync with `steps`. Walks `next` from the entry, bridging external hops.
 */
export function computeFunnelLevels(): FunnelLevels {
  const mainPath: StepId[] = []
  const levelOf = new Map<StepId, number>()
  let cur: StepId | null = 'home'
  while (cur && !levelOf.has(cur)) {
    levelOf.set(cur, mainPath.length)
    mainPath.push(cur)
    let next: StepId | null = null
    for (const t of nextOf(cur)) {
      const target = resolveInternalTarget(t.to)
      if (target && !levelOf.has(target)) {
        next = target
        break
      }
    }
    cur = next
  }

  const alternateEntries: { id: StepId; level: number }[] = []
  const standalone: StepId[] = []
  for (const s of FUNNEL.steps) {
    if (levelOf.has(s.id)) continue
    let feedsLevel: number | null = null
    for (const t of s.next) {
      const target = resolveInternalTarget(t.to)
      if (target && levelOf.has(target)) {
        feedsLevel = levelOf.get(target)! - 1
        break
      }
    }
    if (feedsLevel !== null) alternateEntries.push({ id: s.id, level: Math.max(0, feedsLevel) })
    else standalone.push(s.id)
  }

  return { mainPath, levelOf, alternateEntries, standalone }
}

/** Render the funnel as a human-readable Markdown document (served at /funnelmap.md). */
export function buildFunnelMarkdown({ siteUrl, generatedAt }: { siteUrl: string; generatedAt: string }): string {
  const { mainPath, levelOf, alternateEntries, standalone } = computeFunnelLevels()

  const titleOf = (id: string) => stepById.get(id)?.title ?? id
  const pathOf = (id: string) => stepById.get(id)?.path ?? '/'
  const readsOf = (id: string): readonly string[] => stepById.get(id)?.readsParams ?? []
  const writesOf = (id: string): readonly string[] => stepById.get(id)?.writesParams ?? []
  const eventsOf = (id: string): readonly string[] => stepById.get(id)?.events ?? []

  const fmtParams = (arr: readonly string[]) => (arr.length === 0 ? '—' : arr.includes('*') ? 'all' : arr.join(', '))
  const fmtEvents = (arr: readonly string[]) => (arr.length === 0 ? '—' : arr.join(', '))

  const forwardExternal = (id: string) => {
    const t = nextOf(id).find(n => n.external)
    return t ? ` → ${externalById.get(t.to)?.name ?? t.to} ↗` : ''
  }
  const returnsFrom = (id: string) => {
    for (const e of FUNNEL.external) if ('between' in e && e.between[1] === id) return ` ← back from ${e.name}`
    return ''
  }
  const nextLabel = (id: string) => {
    const ns = nextOf(id)
    if (ns.length === 0) return '—'
    return ns.map(t => (t.external ? `${externalById.get(t.to)?.name ?? t.to} ↗` : titleOf(t.to))).join(' / ')
  }

  const conv = FUNNEL.conversion
  const aliasIdsAtLevel = (level: number) => alternateEntries.filter(a => a.level === level).map(a => a.id)

  // ── Funnel Flow: indentation = level ──
  const labelWidth = Math.max(0, ...mainPath.map(id => (levelOf.get(id) ?? 0) * 2 + pathOf(id).length), ...standalone.map(id => pathOf(id).length)) + 3
  const stairLine = (id: string, level: number, suffix: string) => ('  '.repeat(level) + pathOf(id)).padEnd(labelWidth) + titleOf(id) + suffix

  const mainStair = mainPath.map(id => {
    const level = levelOf.get(id) ?? 0
    const aliasIds = aliasIdsAtLevel(level)
    const aliasNote = aliasIds.length ? `   · also ${aliasIds.map(pathOf).join(', ')}` : ''
    const convNote = id === conv.step || aliasIds.includes(conv.step) ? '   · ★ opt-in' : ''
    return stairLine(id, level, forwardExternal(id) + returnsFrom(id) + convNote + aliasNote)
  })
  const standaloneStair = standalone.map(id => stairLine(id, 0, forwardExternal(id) + '   · standalone'))
  const staircase = [...mainStair, ...(standaloneStair.length ? ['', ...standaloneStair] : [])].join('\n')

  // ── Pages by Level ──
  const row = (id: string, level: string, page: string) =>
    `| ${level} | ${page} | \`${pathOf(id)}\` | ${fmtParams(readsOf(id))} | ${fmtParams(writesOf(id))} | ${nextLabel(id)} | ${fmtEvents(eventsOf(id))} |`
  const tableRows: string[] = []
  for (const id of mainPath) {
    const level = levelOf.get(id)!
    tableRows.push(row(id, String(level), titleOf(id)))
    for (const a of alternateEntries.filter(a => a.level === level)) tableRows.push(row(a.id, String(level), `↳ ${titleOf(a.id)} _(alias)_`))
  }
  for (const id of standalone) tableRows.push(row(id, '—', titleOf(id)))

  return `# ${FUNNEL.name}

> ${FUNNEL.description}

**Site:** ${siteUrl}  ·  _generated at build: ${generatedAt}_

## Funnel Flow

_Indentation = funnel depth.  ★ lead opt-in (conversion).  ↗ external handoff._

\`\`\`
${staircase}
\`\`\`

## Pages by Level

_**Reads** = URL params consumed · **Forwards** = params passed onward · **Next** = where it goes · **Events** = analytics fired._

| Level | Page | Route | Reads | Forwards | → Next | Events |
|:-:|---|---|---|---|---|---|
${tableRows.join('\n')}

_Every page also fires: ${FUNNEL.globalEvents.join(', ')}.  ·  Conversion: \`${conv.event}\` → ${conv.sinks.join(', ')}._
`
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics — pathname → funnel step resolver (feeds funnel_pageview enrichment)
// ─────────────────────────────────────────────────────────────────────────────

const stepByPath = new Map<string, StepId>(FUNNEL.steps.map(s => [s.path, s.id]))

/** 0-based funnel depth per step (main path + aliases; standalone steps absent). */
const stepIndexById: Map<StepId, number> = (() => {
  const { levelOf, alternateEntries } = computeFunnelLevels()
  const m = new Map<StepId, number>(levelOf)
  for (const a of alternateEntries) m.set(a.id, a.level)
  return m
})()

/** Resolve a pathname to its funnel step id + 0-based depth. Null when off-funnel. */
export function stepForPath(pathname: string): { step: StepId; stepIndex: number | null } | null {
  const step = stepByPath.get(pathname)
  if (!step) return null
  return { step, stepIndex: stepIndexById.get(step) ?? null }
}
