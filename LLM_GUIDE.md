# LLM_GUIDE.md — jaden-funnel

Lead-gen funnel for fitness coach **Jaden Levin** / brand **"Aesthetic Mastery"** (natural physique, no gear).

```
/ (or /quiz) → /results → /vsl → /book → [Calendly] → /thank-you      /community = standalone Skool upsell
  quiz          scoring     VSL     booking  external     nurture
```

## 1. Overview

**Funnel state rides the URL query string** (no auth, no store). Persistence: lead capture → Supabase; editable copy → Sanity CMS. Every integration is `isPlaceholder()`-gated, so the funnel runs identically unconfigured.

| Feature | Where |
|---|---|
| Multi-step quiz + lead capture | `QuizFlow` |
| Scored 4-pillar report (SSR) | `/results` + `lib/quiz-scoring.ts` |
| VSL w/ click-to-pause exit-intent CTA | `/vsl` + `VslPlayer` |
| Inline Calendly booking | `/book` + `CalendlyEmbed` |
| Post-booking nurture, TZ-localized call time | `/thank-you` + `useCallWhen` |
| Membership upsell ($97/mo) | `/community` |

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js `16.2.9` (App Router, Turbopack) | ⚠️ `searchParams` is a **Promise** — `await` it. See `AGENTS.md`. |
| UI | React `19.2.4` | RSC + small client islands |
| Lang | TypeScript `^5` | strict; alias `@/* → ./*`; **root tsconfig excludes `sanity/`** (studio is its own workspace) |
| Styles | Tailwind `^4` | tokens in `app/globals.css` `@theme`, **not** `tailwind.config.ts` |
| Fonts | `next/font/google` | Inter, Caveat, JetBrains Mono |
| Pkg mgr | bun | scripts: bare `next dev`/`build`/`start` → dev on `:3000` |
| Lead DB | Supabase `^2.49` | `scaled_landings.opt_ins`; insert-only |
| CMS | Sanity `@sanity/client ^7.23` | `lib/sanity` + `sanity/` studio; singleton-per-page, server-fetched |
| Analytics | PostHog `^1.194` · Vercel Analytics | init in `instrumentation-client.ts` |

All creds in `lib/config.ts` (hardcoded, public client IDs only — never secrets). Real now: Supabase, Sanity (`9ow7m6l3`), PostHog, Pipedream, `workspaceId:121`. Still `PLACEHOLDER_*`: `calendly.url`, `social.*`. Also TODO: Skool URL (`/community`), YouTube IDs.

## 3. Architecture

```
GET / → app/page.tsx (Server) → <QuizFlow/> island (answers in React state, NOT persisted)
  finish() → submitLead() → router.push(/results?age=..&goals=..&name=..)
  /results (Server async): sp = await searchParams → readCtx(sp) → scorePillars(ctx) [pure SSR] → CTA Link /vsl?{toQuery(sp)}
  query forwarded verbatim each hop → /vsl → /book (Calendly) → Calendly EXTERNAL redirect → /thank-you?invitee_first_name,event_start_time
  /thank-you (Server): reads Calendly params; islands localize time via useCallWhen(iso) after mount
```

Decisions: (1) **URL is the state** — each page rebuilds context from `searchParams`, `toQuery()` re-threads it. (2) Server renders copy; islands handle interaction. (3) Pure logic in `lib/` runs at SSR. (4) TZ rendering deferred to client (`useCallWhen`) to avoid hydration mismatch.

## 4. Folder Structure

```
app/
  layout.tsx          root: 3 google fonts + metadata + <RevealController/> + <Analytics/>
  globals.css         ★ design tokens (@theme) + .am-* classes + keyframes
  page.tsx quiz/      → <QuizFlow/>
  results/ vsl/ book/ thank-you/   async Server pages (await searchParams)
  community/          Skool upsell (standalone)
  sitemap.ts          → /sitemap.xml (all routes, from funnel-map)
  funnelmap.json/route.ts  → /funnelmap.json (force-static topology, from funnel-map)
components/funnel/     ★ all components
  BrandHeader SiteFooter UrgencyBar Headline SectionHeading Accent StatGrid VideoPoster icons   server
  QuizFlow VideoPlayer VslPlayer ScoreRing Countdown CalendlyEmbed WaitHeadline ThankYouCalendar ThankYouStickyBar RevealController   client
hooks/
  useCallWhen.ts      localize Calendly ISO → viewer TZ (hydration-safe)
  useUtmParams.ts     capture/persist ALL url params (sessionStorage am_utms); exports useUtmParams()/getUtmParams()/buildUtmQueryString()/buildPersistedSearch()
  useRevealOnScroll.ts  IntersectionObserver: .reveal → .reveal.visible
lib/
  config.ts           ★ all integration creds (PLACEHOLDER_*-gated) — §16
  quiz-scoring.ts     Ctx, PILLARS, readCtx, scorePillars, band — SSR-safe
  search-params.ts    SearchParams type, firstParam(), toQuery()
  call-when.ts        parseCallWhen(iso) — client-only
  logger.ts           structured funnel logger (dataLayer seam, no PII)
  lead-submit.ts      submitLead() — analytics + Pipedream + Supabase
  funnel-map.ts       ★ single-source funnel topology (FUNNEL, buildFunnelMap) — feeds sitemap + funnelmap
  site-url.ts         getSiteUrl() — absolute base URL (NEXT_PUBLIC_SITE_URL → Vercel env → localhost)
  utils.ts            cn() — vestigial
  analytics/posthog.ts   supabase/{client,optIn,types}   sanity/{client,queries,types,content}
instrumentation-client.ts  ★ client init (PostHog) + route pageviews
sanity/                Sanity Studio (own package.json/tsconfig) — schemas/* (8 singletons)
public/posters/*.svg   placeholder video posters
```

## 5. Components

Props typed inline. **Server:** BrandHeader, SiteFooter, UrgencyBar, Headline, SectionHeading, Accent, StatGrid, VideoPoster, icons. **Client (`"use client"`):** the rest.

| Component | Props | Used by |
|---|---|---|
| `BrandHeader` | `centered?=false` `border?=true` `withName?=true` | results, vsl, book, thank-you, community |
| `SiteFooter` | `children?` (override disclaimer) | all above |
| `UrgencyBar` | `children` | vsl, book |
| `Headline` | `segments: HeadlineSegment[]` (CMS; highlighted → `.am-italic`) | book, community |
| `SectionHeading` | `eyebrow` `eyebrowAccent?=false` `fontSize?=30` `marginBottom?=32` `children` | thank-you (×6) |
| `Accent` | `children` — inline italic+accent `<em>` | thank-you, WaitHeadline |
| `StatGrid` | `items:{value,label}[]` `variant?='inline'\|'card'` | QuizFlow proof (inline), thank-you about (card) |
| `VideoPoster` | `poster` `iconSize?=22` | VideoPlayer, VslPlayer |
| `PlayIcon` / `CheckIcon` | `size?` `fill?`/`color?` (`icons.tsx`) | players, VideoPoster, QuizFlow |
| `QuizFlow` | — (owns all quiz state; pushes to /results) | /, /quiz |
| `VideoPlayer` | `poster` `youtubeId?` `ratio?='16/9'` | thank-you |
| `VslPlayer` | `bookHref` | vsl |
| `ScoreRing` | `value:number` (0–100, rAF-animated) | results |
| `Countdown` | `seconds?=420` (mm:ss) | results |
| `CalendlyEmbed` | — (injects script + widget) | book |
| `WaitHeadline` | `firstName` `iso` `callDate` `callTime` | thank-you |
| `ThankYouCalendar` | `iso` | thank-you |
| `ThankYouStickyBar` | — (reveals after 3.5s) | thank-you |

`QuizFlow` internal-only: `OptCard`, `BackBtn`, `Analyzing`.

⚠️ `.am-italic` (CMS `Headline`) is **not** italic — accent color only. `Accent` **is** real italic+accent. Don't conflate them.

## 6. Pages & Routing

No auth, middleware, or API routes. All routes public.

| Route | File | Render | searchParams |
|---|---|---|---|
| `/`, `/quiz` | `page.tsx`, `quiz/page.tsx` | Server → `<QuizFlow/>` | no |
| `/results` | `results/page.tsx` | Server (dynamic) | quiz answers |
| `/vsl` | `vsl/page.tsx` | Server (dynamic) | forward only |
| `/book` | `book/page.tsx` | Server (dynamic) | `goal` for copy |
| `/thank-you` | `thank-you/page.tsx` | Server (dynamic) | Calendly params |
| `/community` | `community/page.tsx` | Server | no |
| `/sitemap.xml` | `sitemap.ts` | Static (build) | — |
| `/funnelmap.json` | `funnelmap.json/route.ts` | Static (`force-static`) | — |

`sitemap.ts` + `funnelmap.json` both derive from `lib/funnel-map.ts` (single source of truth) and regenerate every build/deploy. Set **`NEXT_PUBLIC_SITE_URL`** (or rely on Vercel env vars) so they emit the real domain instead of `localhost`.

Quiz query: `age, goals, situation, frequency, natural, commit, name, email, phone` (⚠️ not `goal` — §10). Calendly query: `invitee_first_name, event_start_time, date, time`.

## 7. Component Hierarchy

```
/ , /quiz → QuizFlow → screen by SCREENS[i].type: intro|single|multi → OptCard×N (+BackBtn); proof→StatGrid; analyzing→Analyzing; email→inputs+submit
/results  → BrandHeader · ScoreRing · bullets · pillar card×4 (band color) · summary · Countdown · Link /vsl · SiteFooter
/vsl      → UrgencyBar · BrandHeader · VslPlayer(→VideoPoster, exit-intent Link) · CTA · SiteFooter
/book     → UrgencyBar · BrandHeader · Headline · CalendlyEmbed · SiteFooter
/thank-you→ BrandHeader · WaitHeadline · VideoPlayer · 3 steps(ThankYouCalendar/MessageGraphic/VideoGraphic) ·
            SectionHeading×6 · VideoPlayer+CHECKLIST · BREAKOUTS(VideoPlayer×3) · TESTIMONIALS(VideoPlayer×4) · StatGrid · ThankYouStickyBar
/community→ BrandHeader · Headline · pricing card · Skool <a> · SiteFooter
```

## 8. Hooks & Logic Functions

| Hook | Signature | Notes |
|---|---|---|
| `useCallWhen` | `(iso) → CallWhen \| null` | null first render (SSR-match), localizes after mount; warns `call_when_parse_failed` on bad ISO |
| `useUtmParams` | `() → UtmParams` | merges URL + sessionStorage `am_utms` (memoized) |
| `useRevealOnScroll` | `() → void` | mounts IntersectionObserver app-wide via `<RevealController/>` |

| Fn | Signature | File |
|---|---|---|
| `readCtx` | `(sp) → Ctx` | quiz-scoring.ts |
| `scorePillars` | `(ctx) → { scored, overall, top }` | quiz-scoring.ts |
| `band` | `(score) → { label, color }` | quiz-scoring.ts |
| `firstParam` | `(v) → string` | search-params.ts |
| `toQuery` | `(sp) → string` | search-params.ts |
| `parseCallWhen` | `(iso) → CallWhen \| null` | call-when.ts (client only) |
| `getUtmParams` / `buildUtmQueryString` / `buildPersistedSearch` | — | useUtmParams.ts (non-hook; share internal `pickUtms`) |
| `logger` | `.debug/.info/.warn/.error(event, ctx?)` | logger.ts |

## 9. Data Flow

**Quiz → report:** answers in React state → `finish()` logs `quiz_lead_submitted` (no PII), `await submitLead()` (try/guarded), `router.push(/results?…)` → `/results` `readCtx`→`scorePillars`→SSR (scores in initial HTML).

**Forwarding:** every internal `Link` uses `toQuery(sp)`; `/vsl` computes `bookHref=/book?{toQuery(sp)}`.

**Booking → thank-you:** Calendly redirects with `invitee_first_name`+`event_start_time` → `firstParam()` → `useCallWhen(iso)` localizes client-side after mount.

**Logging:** `logger` → console (level-gated) + `window.dataLayer.push`. Force debug live via **`?debug`**, `localStorage.am_debug='true'`, or `localStorage.am_log_level=...`. Default level: dev=debug, prod=info. Boot banner in `instrumentation-client.ts` prints active level. **Events:** `quiz_start` · `quiz_answer{key,value}` · `quiz_back{from}` · `quiz_lead_submitted{dialCode,answerKeys}` · `quiz_lead_submit_failed` · `results_scored{overall,top}` · `vsl_play`/`vsl_exit_intent_shown`/`vsl_cta_click` · `video_play` · `booking_view`/`calendly_loaded`/`calendly_load_failed` · `thank_you_confirm_click` · `call_when_parse_failed`. PostHog adds `funnel_pageview`/`form_submit`/`opt_in`/`video_watched` (+ auto `$pageview`).

## 10. Business Logic — Pillar Scoring

`lib/quiz-scoring.ts`. Each pillar: `clamp(base + Σ bonuses)`, `clamp = max(34, min(97, round))`. `overall = mean`; `top = highest = "biggest opportunity"`.

| key | Title | Base | Top bonuses |
|---|---|---:|---|
| nutrition | Macro Calibration System | 58 | situation=nutrition +30, goals∋fat +14 |
| training | Controlled Intensity Method | 55 | situation=stuck +28, situation=random +20 |
| recovery | Winning Weeks Framework | 48 | frequency=1-2 +30, situation=tried-everything +16 |
| coaching | 1:1 Accountability Accelerator | 60 | commit=now +30, commit=soon +20 |

`band`: ≥85 CRITICAL PRIORITY `#0086a8` · ≥70 NEEDS ATTENTION `#1f9e7a` · ≥55 WORTH ADDRESSING `#caa53d` · else BENEFICIAL `#7a8893`.

⚠️ **`goal` is always empty** — intro screen calls `pick(undefined, …)`, never stored. So `goal`-based bonuses and `/book` `goalWord` are dead until the intro gets a `key`. `age` collected but unused.

## 11. Key Patterns

- **Async page:** `searchParams: Promise<SearchParams>` → `await`; coerce with `firstParam()`.
- **URL as state:** forward with `toQuery(sp)` on every internal Link.
- **Islands:** pages stay Server; stateful bits are small `"use client"` files.
- **Hydration-safe TZ:** never compute `Date`-display in render → `useCallWhen` (null-first).
- **Styling:** inline `style={{ … var(--token) }}` + `.am-*` classes; add colors to `@theme`, not components.
- **Shared primitives:** `SectionHeading`/`Accent`/`StatGrid`/`VideoPoster`/`icons` over copy-pasted JSX.
- **Logging:** `logger.info("event", {ctx})`; never name/email/phone/tokens.
- **Static copy:** top-of-file typed consts (`SCREENS`, `PILLARS`, `BREAKOUTS`, …) `.map()`ed.

## 12. Development Guide

`bun install` · `bun dev` (`:3000`) · `bun run build` · `bun start`. **Studio:** `cd sanity && bun install && bunx sanity dev` (set `SANITY_STUDIO_PROJECT_ID`). Honor `AGENTS.md` (Next 16 — read `node_modules/next/dist/docs/` when unsure).

- **New page:** `app/<route>/page.tsx`, `async`, `searchParams: Promise<SearchParams>`, compose `BrandHeader`→sections→`SiteFooter`, forward via `toQuery`.
- **New island:** `components/funnel/X.tsx` + `"use client"`, single-concern, clean up timers/listeners.
- **New hook:** `hooks/use*.ts`; SSR-safe or defer browser work to `useEffect`.
- **New util:** `lib/x.ts`, pure.
- **New token:** add `--color-x` to `@theme` (+ `:root` alias if used as `var(--x)`).
- **New log event:** `logger.info("snake_case", {nonPII})`.

## 13. Best Practices

See §11. Additionally — **Don't:** assume pre-16 Next (sync searchParams / `pages/`) · add a store/DB for funnel state · log PII · lean on `cn()`/`components.json` (vestigial).

## 14. Performance

Server-first; ~10 small islands, no state/fetch/animation libs. Scores in initial HTML (SSR `scorePillars`). `VideoPlayer` mounts the YouTube iframe only on click; `CalendlyEmbed` script on mount. Motion on `transform`/`opacity` only. `<img>` direct (eslint-disabled) — fine for SVG posters; use `next/image` if raster added.

## 15. Troubleshooting

| Symptom | Cause → Fix |
|---|---|
| `searchParams.x` undefined / type error | It's a Promise → `await searchParams` first |
| `goal` copy/scoring never fires | intro `pick(undefined,…)` not stored → give intro `key:"goal"` |
| Booking 404 / no name+time on `/thank-you` | placeholder `calendly.url` → set real URL + Calendly redirect w/ params |
| Videos won't play (poster only) | `youtubeId` empty → add real IDs |
| Hydration mismatch on `/thank-you` | computing `Date` in render → use `useCallWhen` (null-first) |
| Color change ignored | edited `tailwind.config.ts` → edit `@theme` in `globals.css` (v4) |
| Build fails: `Cannot find module 'sanity/structure'` | root build is type-checking the studio → keep `sanity` in tsconfig `exclude`; run studio via `cd sanity` |
| Analytics / leads not firing | Supabase/PostHog/Pipedream creds are real — check key/network. Calendly + `social.*` still placeholders (§16) |
| Sanity copy edit not showing | `projectId` real — check singleton exists/published, 3s fetch didn't time out, or field intentionally hardcoded (§16) |
| Build fails on missing modules | run `bun install` |

## 16. Integration Stack

**Credential-gated:** every init/call checks `isPlaceholder()` and no-ops while its `lib/config.ts` value is a `PLACEHOLDER_*` sentinel. **PII discipline:** `logger`/dataLayer stay PII-free; email reaches only PostHog `identifyUser` + the lead sinks (Supabase/Pipedream).

**Config — `lib/config.ts`.** `supabase{url,anonKey,schema}`, `sanity{projectId,dataset,apiVersion,useCdn}`, `posthog{apiKey,apiHost,uiHost}`, `pipedream{quizWebhook}`, `calendly{url}`, `social{youtube,instagram,tiktok}`, `workspaceId:121`. `isPlaceholder(v)=v.startsWith("PLACEHOLDER_")`. Real: supabase/sanity/posthog/pipedream/workspaceId. Placeholder: `calendly.url`, `social.*`.

**Client init — `instrumentation-client.ts`.** Runs once before hydration: `initPostHog()` + initial `funnel_pageview`. Exports `onRouterTransitionStart` → `funnel_pageview` per client route change (PostHog auto-captures `$pageview`). `<Analytics/>` (Vercel) in `app/layout.tsx`.

**Lead capture — `lib/lead-submit.ts` ← `QuizFlow.finish()`.** Quiz email screen = single conversion point. `submitLead(data)`: PostHog `form_submit`+`opt_in`+`identifyUser`, then `Promise.allSettled([Pipedream (no-cors), insertOptIn])`. Never throws / blocks navigation; `router.push` runs after it resolves. UTMs from `getUtmParams()` → `utms`; full URL query → `url_params`.

**Analytics — `lib/analytics/posthog.ts`.** Exports `initPostHog`, `captureEvent`, `identifyUser` (caches identity in `localStorage.jaden_identity`, re-identifies on init), `flushPostHog()` (call before hard redirects), `getPostHog`. Inits with `person_profiles:'always'`, `capture_pageview:'history_change'`, `capture_pageleave:true`, `autocapture:true`. Events before init are queued and replayed.

**Lead DB — `lib/supabase/`.** `getSupabase()` (lazy singleton, schema `scaled_landings`). `insertOptIn(OptInData)` → `opt_ins` row `{url, workspace_id, form_data (JSONB: answers + name/email/phone), utms, url_params}`; placeholder-skips, never throws. ⚠️ Insert only — no migrations/DDL (run by the user).

**CMS — Sanity (`lib/sanity/` + `sanity/`).** Singleton-per-page, server-fetched. `getPageContent(type)` = `DEFAULTS[type]` (verbatim current copy) overlaid with CMS data; placeholder / error / 3s-timeout → defaults. 8 singletons: `amHomePage amResultsPage amVslPage amBookPage amThankYouPage amCommunityPage amSettings videoLibrary`. Headlines = `HeadlineSegment[]` (`{text,highlighted}`) rendered by `<Headline/>`. Pages wire only static copy matching current text verbatim; dynamic/scored copy stays hardcoded:

| Page | wired to CMS | hardcoded |
|---|---|---|
| results | eyebrow, bullets, summaryHeading, ctaButtonText, countdownText | headline/subheadline/summaryBody (scored) |
| vsl | announcementBarText, ctaButtonText, exitIntentText | (no on-page heading) |
| book | announcementBarText, headline | subheadline (`goalWord`) |
| thank-you | subheadline, aboutBody | headline (WaitHeadline), SectionHeading accents |
| community | all 6 fields | — |

⚠️ **Defined but not yet consumed:** `amHomePage` (`/`,`/quiz` render `<QuizFlow/>` hardcoded), `amSettings` (bar text comes from each page's own singleton), `videoLibrary` (all video callers pass empty `youtubeId`). Also `amThankYouPage.stepsHeading`/`aboutHeading` fetched-but-unused.

**Scroll reveal.** `useRevealOnScroll()` mounts once via `<RevealController/>`; `.reveal` → `.reveal.visible` (off on mobile + reduced-motion). No markup uses `.reveal` yet — add the class to opt in.

**Go-live checklist.** ① `bun install` + `cd sanity && bun install`. ② fill remaining placeholders in `lib/config.ts` (`calendly.url`, `social.*`) + Skool URL (`/community`) + YouTube IDs. ③ `bun run build`. ④ create the 8 Sanity singletons; wire `amHomePage`/`amSettings`/`videoLibrary` if desired. ⑤ point Calendly redirect at `/thank-you?invitee_first_name=…&event_start_time=…`. ⑥ set `NEXT_PUBLIC_SITE_URL` to the production domain so `/sitemap.xml` + `/funnelmap.json` emit absolute URLs (update `lib/funnel-map.ts` whenever a route/transition/event changes).
