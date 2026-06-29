# LLM_GUIDE.md — jaden-funnel

Lead-gen funnel for fitness coach **Jaden Levin** / brand **"Aesthetic Mastery"** (natural physique, no gear). Reflects the **working tree**. Legacy `components/ui/**` + the old `hooks/use-outside-click.tsx` are deleted on disk but still tracked — ignore; `git add -A` to stage.

```
/ (or /quiz) → /results → /vsl → /book → [Calendly] → /thank-you      /community = standalone Skool upsell
  quiz          scoring     VSL     booking  external     nurture
```

---

## 1. Overview

Quiz → VSL → Calendly booking → post-booking nurture. Funnel **state** rides the URL query string (no app auth); persistence is now **lead capture → Supabase** + a **Sanity CMS** for editable copy — both `PLACEHOLDER_*`-gated, so the funnel runs identically unconfigured. See §16.

| Feature | Where |
|---|---|
| Multi-step quiz + lead capture (name/email/phone) | `QuizFlow` |
| Scored 4-pillar report (SSR) | `/results` + `lib/quiz-scoring.ts` |
| VSL w/ click-to-pause exit-intent CTA | `/vsl` + `VslPlayer` |
| Inline Calendly booking | `/book` + `CalendlyEmbed` |
| Post-booking nurture, TZ-localized call time | `/thank-you` + `useCallWhen` |
| Funnel event logging (GTM/dataLayer seam) | `lib/logger.ts` |
| Membership upsell ($97/mo) | `/community` |

**Integration stack wired** (Supabase lead capture · PostHog · Vercel Analytics · Pipedream · Sanity CMS) — all credential-gated by `PLACEHOLDER_*` in `lib/config.ts`, so they no-op until real keys are set. See §16. Still need real values: the `lib/config.ts` creds, Calendly/Skool URLs, YouTube IDs.

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js `16.2.9` | App Router, RSC. ⚠️ `searchParams` is a **Promise** (`await` it). See `AGENTS.md`. |
| UI | React `19.2.4` | RSC + small client islands |
| Lang | TypeScript `^5` | strict; alias `@/* → ./*` |
| Styles | Tailwind `^4` | tokens in `app/globals.css` `@theme`, **not** `tailwind.config.ts` |
| Fonts | `next/font/google` | Inter, Caveat, JetBrains Mono |
| Class util | `clsx`+`tailwind-merge` → `cn()` | vestigial |
| Pkg mgr | bun (`bun.lockb`) | dev runs on `:3001` (`:3000` is another client) |
| Lead DB | Supabase `^2.49` | `lib/supabase` → `scaled_landings.opt_ins`; placeholder-gated insert only |
| CMS | Sanity `@sanity/client ^7.23` | `lib/sanity` + `sanity/` studio; singleton-per-page, server-fetched |
| Analytics | PostHog `^1.194` · Vercel Analytics | init in `instrumentation-client.ts`; helpers in `lib/analytics` |

Integrations (all in `lib/config.ts`, `PLACEHOLDER_*`-gated → §16): **Supabase** · **PostHog** · **Vercel Analytics** · **Pipedream** · **Sanity** · **Calendly** (`CalendlyEmbed`) · **Skool** (`/community`) · **YouTube** (`VideoPlayer`). Creds are hardcoded placeholders in `lib/config.ts` (not env vars) — public client IDs only; never put secret tokens client-side.

## 3. Architecture

```
Browser GET /  → app/page.tsx (Server) → <QuizFlow/> island
   QuizFlow holds answers in React state (NOT persisted)
   finish() → URLSearchParams → router.push(/results?age=..&goals=..&name=..)
                         │
   /results (Server, async): sp = await searchParams
        readCtx(sp) → scorePillars(ctx) [lib/quiz-scoring, pure SSR]
        logger.info("results_scored") ; CTA Link → /vsl?{toQuery(sp)}
                         │ query forwarded verbatim each hop
   /vsl → /book (Calendly) → Calendly EXTERNAL redirects → /thank-you?invitee_first_name,event_start_time
                         │
   /thank-you (Server): reads Calendly params; islands localize time via useCallWhen(iso)
```

Decisions: (1) **URL is the state** — each page rebuilds context from `searchParams`, `toQuery()` re-threads it. (2) Server renders copy; islands handle interaction. (3) Pure logic in `lib/` runs at SSR (scores in initial HTML). (4) TZ rendering deferred to client (`useCallWhen`) to avoid hydration mismatch.

## 4. Folder Structure

```
app/
  layout.tsx          root: 3 google fonts + metadata
  globals.css         ★ design tokens (@theme) + .am-* classes + keyframes
  page.tsx quiz/      → <QuizFlow/>
  results/ vsl/ book/ thank-you/   async Server pages (await searchParams)
  community/          Skool upsell (standalone)
components/funnel/     ★ all live components
  BrandHeader SiteFooter UrgencyBar Headline           server
  QuizFlow VideoPlayer VslPlayer ScoreRing Countdown CalendlyEmbed
  WaitHeadline ThankYouCalendar ThankYouStickyBar RevealController   client islands
hooks/
  useCallWhen.ts      localize Calendly ISO → viewer TZ (hydration-safe)
  useUtmParams.ts     capture/persist UTMs (sessionStorage am_utms) — getUtmParams()
  useRevealOnScroll.ts  IntersectionObserver: .reveal → .reveal.visible
lib/
  config.ts           ★ all integration creds (PLACEHOLDER_*-gated) — §16
  quiz-scoring.ts     pillar scoring (Ctx, PILLARS, readCtx, scorePillars, band) — SSR-safe
  search-params.ts    SearchParams type, firstParam(), toQuery()
  call-when.ts        parseCallWhen(iso) — client-only intent
  logger.ts           structured funnel logger (dataLayer seam, no PII)
  lead-submit.ts      submitLead() — analytics + Pipedream + Supabase on quiz submit
  utils.ts            cn() — vestigial
  analytics/          posthog.ts
  supabase/           client.ts · optIn.ts · types.ts (scaled_landings.opt_ins)
  sanity/             client.ts · queries.ts · types.ts · content.ts (DEFAULTS + getPageContent)
instrumentation-client.ts  ★ client init (PostHog) + route pageviews
sanity/                Sanity Studio — config, deskStructure, schemas/* (8 singletons)
public/posters/*.svg   placeholder video posters
```

## 5. Components

Props are typed inline. **Server:** BrandHeader, SiteFooter, UrgencyBar. **Client (`"use client"`):** the rest.

| Component | Props | Used by |
|---|---|---|
| `BrandHeader` | `centered?=false` `border?=true` `withName?=true` | results, vsl, book, thank-you, community |
| `SiteFooter` | `children?` (override disclaimer) | all above |
| `UrgencyBar` | `children` (bar text) | vsl, book |
| `QuizFlow` | — (owns all quiz state; pushes to /results) | /, /quiz |
| `VideoPlayer` | `poster` `youtubeId?` `ratio?="16/9"` | thank-you |
| `VslPlayer` | `bookHref` | vsl |
| `ScoreRing` | `value:number` (0–100, rAF-animated) | results |
| `Countdown` | `seconds?=420` (mm:ss) | results |
| `CalendlyEmbed` | — (injects script + widget) | book |
| `WaitHeadline` | `firstName` `iso` `callDate` `callTime` | thank-you |
| `ThankYouCalendar` | `iso` | thank-you |
| `ThankYouStickyBar` | — (reveals after 3.5s) | thank-you |

`QuizFlow` internal-only: `OptCard`, `BackBtn`, `Analyzing`.

## 6. Pages & Routing

No auth, middleware, or API routes. All routes public.

| Route | File | Render | Reads searchParams |
|---|---|---|---|
| `/`, `/quiz` | `app/page.tsx`, `app/quiz/page.tsx` | Server → `<QuizFlow/>` | no |
| `/results` | `app/results/page.tsx` | Server (dynamic) | yes — quiz answers |
| `/vsl` | `app/vsl/page.tsx` | Server (dynamic) | yes — forward only |
| `/book` | `app/book/page.tsx` | Server (dynamic) | yes — `goal` for copy |
| `/thank-you` | `app/thank-you/page.tsx` | Server (dynamic) | yes — Calendly params |
| `/community` | `app/community/page.tsx` | Server (static) | no |

Pages: `searchParams: Promise<SearchParams>` → `const sp = await searchParams`. Query in flight: quiz sets `age, goals, situation, frequency, natural, commit, name, email, phone` (⚠️ not `goal` — §10); Calendly sets `invitee_first_name, event_start_time, date, time`.

## 7. Component Hierarchy

```
/ , /quiz → QuizFlow → screen renderer by SCREENS[i].type:
            intro|single|multi → OptCard×N (+BackBtn); proof; analyzing→Analyzing; email→inputs+submit

/results  → BrandHeader · ScoreRing(overall) · BULLETS · pillar card×4 (band color)
            · summary · Countdown · Link /vsl?{query} · SiteFooter

/vsl      → UrgencyBar · BrandHeader · VslPlayer(bookHref → exit-intent Link) · CTA · SiteFooter

/book     → UrgencyBar · BrandHeader · CalendlyEmbed · SiteFooter

/thank-you→ BrandHeader · WaitHeadline · VideoPlayer · 3 steps(ThankYouCalendar +
            MessageGraphic/VideoGraphic inline) · VideoPlayer+CHECKLIST · BREAKOUTS(VideoPlayer×3)
            · TESTIMONIALS(VideoPlayer×4) · ABOUT · SiteFooter · ThankYouStickyBar

/community→ BrandHeader · pricing card · Skool <a> · SiteFooter
```

## 8. Hooks & Logic Functions

**Custom hook**

| Hook | Signature | Notes |
|---|---|---|
| `useCallWhen` | `(iso: string) → CallWhen \| null` | `hooks/useCallWhen.ts`. Returns `null` first render (SSR-match), localizes after mount. Warns `call_when_parse_failed` on bad ISO. Used by `WaitHeadline`, `ThankYouCalendar`. |

**Pure utils (`lib/`)**

| Fn | Signature | File |
|---|---|---|
| `readCtx` | `(sp: SearchParams) → Ctx` | quiz-scoring.ts |
| `scorePillars` | `(ctx: Ctx) → { scored, overall, top }` | quiz-scoring.ts |
| `band` | `(score: number) → { label, color }` | quiz-scoring.ts |
| `firstParam` | `(v: string\|string[]\|undefined) → string` | search-params.ts |
| `toQuery` | `(sp: SearchParams) → string` | search-params.ts |
| `parseCallWhen` | `(iso: string) → CallWhen \| null` | call-when.ts (client only) |
| `logger` | `.info/.debug/.warn/.error(event, context?)` | logger.ts |

Island effects (built-in hooks): `QuizFlow` (state machine + analyzing auto-advance + `router.push`), `Analyzing` (750ms stepper), `ScoreRing` (rAF ease), `Countdown` (1s interval), `CalendlyEmbed` (script inject/cleanup), `ThankYouStickyBar` (3.5s reveal), `VideoPlayer`/`VslPlayer` (toggle).

## 9. Data Flow

**Quiz → report:** answers in React state → `finish()` logs `quiz_lead_submitted` (no PII) + `router.push(/results?…)` → `/results` server `readCtx`→`scorePillars`→SSR (`ScoreRing`/`Countdown` hydrate; scores already in HTML).

**Forwarding:** every internal `Link` uses `toQuery(sp)`; `/vsl` computes `bookHref=/book?{toQuery(sp)}` for both CTA and exit-intent overlay.

**Booking → thank-you:** Calendly redirects with `invitee_first_name`+`event_start_time` → `/thank-you` `firstParam()`s them → `useCallWhen(iso)` localizes day/time client-side after mount.

**Logging:** `logger` → console (dev) + `window.dataLayer.push` (prod). Events: `quiz_start`, `quiz_answer{key,value}`, `quiz_lead_submitted{dialCode,answerKeys}`, `results_scored{overall,top}`, `vsl_play`/`vsl_exit_intent_shown`/`vsl_cta_click`, `video_play`, `booking_view`/`calendly_loaded`/`calendly_load_failed`, `call_when_parse_failed`. **PostHog** (via `captureEvent`, §16) adds standard funnel events: `funnel_pageview`, `form_submit`, `opt_in`, `video_watched` (+ auto `$pageview`). **Console verbosity** is level-gated (`getLogLevel()`; default dev=debug, prod=info). Append **`?debug`** to any URL — or set `localStorage.am_debug='true'` / `localStorage.am_log_level='debug'|'info'|'warn'|'error'` — to force debug logs live (e.g. in prod). A boot banner in `instrumentation-client.ts` prints the active level + `isLogOverridden()`. Ported from harp_webby.

## 10. Business Logic — Pillar Scoring

`lib/quiz-scoring.ts`. Persuasion math from URL answers; no DB. Each pillar: `clamp(base + Σ bonuses)`, `clamp = max(34, min(97, round))`. `overall = mean`; `top = highest = "biggest opportunity"`.

| key | Title | Base | Top bonuses |
|---|---|---:|---|
| nutrition | Macro Calibration System | 58 | situation=nutrition +30, goals∋fat +14 |
| training | Controlled Intensity Method | 55 | situation=stuck +28, situation=random +20 |
| recovery | Winning Weeks Framework | 48 | frequency=1-2 +30, situation=tried-everything +16 |
| coaching | 1:1 Accountability Accelerator | 60 | commit=now +30, commit=soon +20 |

`band`: ≥85 CRITICAL `#0086a8` · ≥70 NEEDS ATTENTION `#1f9e7a` · ≥55 WORTH ADDRESSING `#caa53d` · else BENEFICIAL `#7a8893`.

⚠️ **`goal` is always empty** — intro screen calls `pick(undefined, …)`, which never stores. So `goal`-based bonuses and `/book` `goalWord` are dead until the intro gets a `key`. `age` collected but unused.

## 11. Key Patterns

- **Async page:** `searchParams: Promise<SearchParams>` → `await`; coerce scalars with `firstParam()`.
- **URL as state:** forward with `toQuery(sp)` on every internal Link; no store/context.
- **Islands:** pages stay Server; stateful bits are small `"use client"` files in `components/funnel/`.
- **Hydration-safe TZ:** never compute `Date`-display in render → use `useCallWhen` (null-first).
- **Styling:** inline `style={{ … var(--token) }}` + `.am-*` classes; add colors to `@theme`, not components.
- **Logging:** `logger.info("event", {ctx})`; never pass name/email/phone/tokens.
- **Static copy:** top-of-file typed consts (`SCREENS`, `PILLARS`, `BREAKOUTS`, …) `.map()`ed.

## 12. Development Guide

Run: `bun install` (root) · `bun dev` (`:3001` here) · `bun run build` · `bun start`. **Sanity Studio:** `cd sanity && bun install && bunx sanity dev` (set `SANITY_STUDIO_PROJECT_ID`). Honor `AGENTS.md` (Next 16 — read `node_modules/next/dist/docs/` when unsure).

- **New page:** `app/<route>/page.tsx`, `async`, type `searchParams: Promise<SearchParams>`, compose `BrandHeader`→sections→`SiteFooter`, forward via `toQuery`.
- **New island:** `components/funnel/X.tsx` + `"use client"`, single-concern, clean up timers/listeners, import into a Server page.
- **New hook:** `hooks/use*.ts`; keep SSR-safe or defer browser work to `useEffect` (see `useCallWhen`).
- **New util:** `lib/x.ts`, pure; call in Server page if no `window`/TZ.
- **New token:** add `--color-x` to `@theme` in `globals.css` (+ `:root` alias if used as `var(--x)`).
- **New log event:** `logger.info("snake_case", {nonPII})`.

## 13. Best Practices

**Do:** async Server pages + small islands · `await searchParams`+`firstParam()` · forward `toQuery` · `var(--token)` styling · pure SSR-safe `lib/` · `logger` for funnel events (no PII) · clean up effects.

**Don't:** reintroduce `components/ui/**` or lean on `cn()`/`components.json` (vestigial) · compute TZ/`Date` in render · hardcode hex in components · assume pre-16 Next (sync searchParams / `pages/`) · add a store/DB for funnel state · log PII.

## 14. Performance

- Server-first; ~10 small islands, no state/fetch/animation libs.
- Scores render in initial HTML (SSR `scorePillars`).
- Fonts: `next/font` `display:swap`; Inter doubles as sans+serif.
- Motion on `transform`/`opacity` (`am*` keyframes); `ScoreRing` rAF on a single SVG.
- `VideoPlayer` mounts YouTube iframe only on click; `CalendlyEmbed` script on mount.
- `<img>` used directly (eslint-disabled) — fine for SVG posters; use `next/image`+dims if raster added.

## 15. Troubleshooting

| Symptom | Cause → Fix |
|---|---|
| `searchParams.x` undefined / type error | It's a Promise → `await searchParams` first |
| `goal` copy/scoring never fires; `/book` always "aesthetic" | intro `pick(undefined,…)` not stored → give intro `key:"goal"` |
| Booking 404 / no name+time on `/thank-you` | placeholder `CALENDLY_URL` → set real URL + configure Calendly redirect w/ params |
| Videos won't play (poster only) | `youtubeId` empty → add real IDs |
| Hydration mismatch on `/thank-you` | computing `Date` in render → use `useCallWhen` (null-first) |
| Color change ignored | edited `tailwind.config.ts` → edit `@theme` in `globals.css` (v4) |
| ~120 deleted `components/ui/**` in `git status` | removed on disk, unstaged → `git add -A` |
| Wrong app in browser | jaden-funnel dev is `:3001` (`:3000` is another client) |
| Unknown Next API | read `node_modules/next/dist/docs/` (AGENTS.md) |
| Analytics / leads not firing | creds still `PLACEHOLDER_*` in `lib/config.ts` → set real values (§16) |
| Sanity copy edit not showing | `config.sanity.projectId` still placeholder, or that field is intentionally hardcoded (§16 table) |
| Build fails on missing modules | run `bun install` (new deps: `@supabase/supabase-js`, `posthog-js`, `@sanity/client`, `@vercel/analytics`) |

## 16. Integration Stack (setup-funnel)

Production stack layered onto the existing funnel. **Credential-gated:** `lib/config.ts` holds `PLACEHOLDER_*` sentinels; every init/call checks `isPlaceholder()` and no-ops until a real value is set — so the funnel runs identically with zero config and lights up integration-by-integration. **PII discipline:** `logger`/dataLayer stay PII-free; email reaches only PostHog `identifyUser` + the lead sinks (Supabase/Pipedream).

**Config — `lib/config.ts`.** One object: `supabase{url,anonKey,schema:"scaled_landings"}`, `sanity{projectId,dataset,apiVersion,useCdn}`, `posthog{apiKey,apiHost,uiHost}`, `pipedream{quizWebhook}`, `calendly{url}`, `social{youtube,instagram,tiktok}`, `workspaceId`. `isPlaceholder(v) = v.startsWith("PLACEHOLDER_")`.

**Client init — `instrumentation-client.ts` (root).** Runs once before hydration: `initPostHog()`; fires initial `funnel_pageview`. Exports `onRouterTransitionStart` → `funnel_pageview` on each client route change (PostHog auto-captures `$pageview` via `capture_pageview:"history_change"`). `<Analytics/>` (Vercel) mounts in `app/layout.tsx`.

**Lead capture — `lib/lead-submit.ts` ← `QuizFlow.finish()`.** The quiz email screen is the single conversion point. `submitLead(data)`: PostHog `form_submit`+`opt_in`+`identifyUser(email)`, then `Promise.allSettled([Pipedream (no-cors), insertOptIn])`, then `router.push(/results?…)`. Never throws / never blocks navigation. UTMs from `getUtmParams()` (sessionStorage `am_utms`) ride along into `url_params`.

**Analytics events (PostHog via `captureEvent`):** `funnel_pageview` · `form_submit` · `opt_in` · `video_watched` (+ auto `$pageview`). All also pass through `logger` → dataLayer.

**Lead DB — `lib/supabase/`.** `getSupabase()` (lazy singleton, schema `scaled_landings`). `insertOptIn(OptInData)` → `opt_ins` row `{url, workspace_id, form_data (JSONB: quiz answers + name/email/phone), utms, url_params}`; placeholder-skips, never throws. `types.ts` = generated read-only `Database`. ⚠️ Runtime **insert only** — no migrations/DDL here; schema changes are run by the user.

**CMS — Sanity (`lib/sanity/` + `sanity/`).** Singleton-per-page, **server-fetched** (no browser prefetch). `getPageContent(type)` = `DEFAULTS[type]` (verbatim current copy) overlaid with CMS data; placeholder / error / 3s-timeout → defaults, so pages render identically until configured. 8 singletons: `amHomePage amResultsPage amVslPage amBookPage amThankYouPage amCommunityPage amSettings videoLibrary`. Headlines are `HeadlineSegment[]` (`{text,highlighted}`) rendered by `<Headline/>` (highlighted → `am-italic`). Pages wire only static copy matching current text **verbatim**; dynamic/scored/`<em>`-accented copy stays hardcoded:

| Page | wired to CMS | stays hardcoded |
|---|---|---|
| results | eyebrow, bullets, summaryHeading, ctaButtonText, countdownText | headline/subheadline/summaryBody (scored) |
| vsl | announcementBarText, ctaButtonText, exitIntentText | (no on-page heading) |
| book | announcementBarText, headline | subheadline (`goalWord`) |
| thank-you | subheadline, aboutBody | headline (WaitHeadline), section headings (accent) |
| community | all 6 fields | — |

Studio (own `sanity/package.json`): `cd sanity && bun install && bunx sanity dev` (set `SANITY_STUDIO_PROJECT_ID`).

**Scroll reveal.** `useRevealOnScroll()` mounts once via `<RevealController/>` in layout; `.reveal` → `.reveal.visible` (CSS in globals.css, off on mobile + reduced-motion). No markup uses `.reveal` yet — add the class to opt a section in.

**Go-live checklist.** ① `bun install` (root) + `cd sanity && bun install`. ② fill real values in `lib/config.ts` (incl. `workspaceId`, Calendly URL; Skool URL in `/community`, YouTube IDs in `VideoPlayer` callers). ③ `bun run build`. ④ create the 8 Sanity singletons in Studio (defaults already match). ⑤ point the Calendly redirect at `/thank-you?invitee_first_name=…&event_start_time=…`.
