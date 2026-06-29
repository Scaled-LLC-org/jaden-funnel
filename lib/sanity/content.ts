import { sanityClient } from '@/lib/sanity/client'
import { QUERIES } from '@/lib/sanity/queries'
import type { SanityPageMap } from '@/lib/sanity/types'
import { config, isPlaceholder } from '@/lib/config'
import { logger } from '@/lib/logger'

/** Max time we wait on Sanity before falling back to defaults (ms). */
const FETCH_TIMEOUT_MS = 3000

/**
 * Verbatim fallback copy for every singleton, reproducing the funnel's current
 * hardcoded copy. With placeholder Sanity config the site renders entirely from
 * these, so it looks identical until the CMS is configured. Highlighted
 * headline segments mirror the existing `<em className="am-italic">` /
 * `am-accent` emphasis on each page.
 */
export const DEFAULTS: { [K in keyof SanityPageMap]: SanityPageMap[K] } = {
  amHomePage: {
    eyebrowCopy: 'Get your personalized',
    headline: [
      { text: 'Natural ', highlighted: false },
      { text: 'Physique', highlighted: true },
      { text: ' Plan', highlighted: false },
    ],
    subheadline: 'The exact training, nutrition, and recovery to build a peak aesthetic physique — the natural way.',
    introQuestion: 'First, where are you today?',
    ctaNote: "🔥 Built on Jaden Levin's natural method",
  },
  amResultsPage: {
    eyebrowCopy: 'Your assessment is ready',
    headline: [
      { text: "Here's your ", highlighted: false },
      { text: 'physique blueprint', highlighted: true },
    ],
    subheadline: 'We analyzed your answers and scored the 4 pillars that decide whether your body actually changes.',
    bullets: [
      'Build visible, lasting muscle',
      'Get lean without misery',
      'Look like you actually lift',
      'Train smarter, not all day',
      '100% natural, no shortcuts',
      'Energy that lasts all day',
    ],
    summaryHeading: 'Your assessment summary',
    summaryBody: 'Every one of these is 100% fixable, naturally, with the exact system Jaden walks you through next. No peptides. No shortcuts.',
    ctaButtonText: 'Watch My Personalized Training Now →',
    countdownText: 'Your personalized training expires in',
  },
  amVslPage: {
    announcementBarText: 'Please watch the full video below. Do not close this window.',
    eyebrowCopy: 'Your personalized training',
    headline: [
      { text: 'Your ', highlighted: false },
      { text: 'personalized training', highlighted: true },
      { text: ' is ready', highlighted: false },
    ],
    subheadline: 'Watch the full breakdown of the natural system that builds a peak aesthetic physique — then book your free assessment call.',
    ctaButtonText: 'Book My Free Body Assessment Call',
    exitIntentText: "Takes 30 seconds · If we're a fit we'll map your plan · If not, free roadmap. Either way you win.",
  },
  amBookPage: {
    announcementBarText: 'Limited strategy-call spots this week',
    headline: [
      { text: 'Book your ', highlighted: false },
      { text: 'free strategy call', highlighted: true },
    ],
    subheadline: "Pick a time below. We'll map out exactly how to build your physique naturally, on your schedule. No pressure, no hard sell.",
  },
  amThankYouPage: {
    headline: [
      { text: 'Watch this ', highlighted: false },
      { text: 'before we talk', highlighted: true },
    ],
    subheadline: 'Add the call to your calendar and reply "YES" to confirm.',
    stepsHeading: 'Do these three things.',
    aboutHeading: 'This call is a conversation, not a pitch',
    aboutBody:
      "We'll look at where you're at, where you want your physique to go, and whether Aesthetic Mastery is the right fit. If it's not, we'll tell you. Either way you leave with a clear plan, built on a 100% natural approach.",
  },
  amCommunityPage: {
    eyebrowCopy: 'The best place to start',
    headline: [
      { text: 'Start with ', highlighted: false },
      { text: 'Aesthetic Mastery', highlighted: true },
    ],
    subheadline:
      "Based on your answers, the smartest first move is the Aesthetic Mastery community. Get Jaden's full natural system, the app, the 300+ workout library, and the Peak Aesthetic Splits — for less than the price of a month at most gyms.",
    priceText: '$97',
    ctaButtonText: 'Join Aesthetic Mastery →',
    features: [
      "Jaden's full natural nutrition + training system",
      'The proprietary app + AI calorie/protein tracking',
      '300+ workout video library',
      '3 pre-built Peak Aesthetic Splits',
      'Weekly meal-plan generation',
      'Private community + monthly group calls',
    ],
  },
  amSettings: {
    announcementBarText: 'Please watch the full video below. Do not close this window.',
    urgencyBarText: 'Limited strategy-call spots this week',
    calendlyUrl: config.calendly.url,
    social: {
      youtube: config.social.youtube,
      instagram: config.social.instagram,
      tiktok: config.social.tiktok,
    },
  },
  videoLibrary: {
    vslVideoId: '',
    thankYouWelcomeVideoId: '',
    thankYouTrainingVideoId: '',
  },
}

/** Resolve `value` or reject after {@link FETCH_TIMEOUT_MS}. */
function withTimeout<T>(value: Promise<T>): Promise<T> {
  return Promise.race([value, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('sanity_timeout')), FETCH_TIMEOUT_MS))])
}

/** Keep only the keys whose value is neither null nor undefined. */
function definedFields<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      out[key as keyof T] = value as T[keyof T]
    }
  }
  return out
}

/**
 * Fetch a singleton's content, always returning a fully-populated object.
 *
 * - Placeholder config → returns DEFAULTS immediately (no network).
 * - Otherwise races the Sanity fetch against a 3s timeout, then overlays the
 *   fetched object's non-null/undefined fields on top of DEFAULTS so any
 *   missing CMS field falls back to its default.
 * - Any error or timeout → logs a warning and returns DEFAULTS.
 *
 * SSR/server-safe and never throws.
 */
export async function getPageContent<T extends keyof SanityPageMap>(type: T): Promise<SanityPageMap[T]> {
  const fallback = DEFAULTS[type]

  if (isPlaceholder(config.sanity.projectId)) {
    logger.debug('sanity_skipped_placeholder', { type })
    return fallback
  }

  try {
    const fetched = await withTimeout(sanityClient.fetch<SanityPageMap[T] | null>(QUERIES[type]))
    if (!fetched) return fallback
    return { ...fallback, ...definedFields(fetched) }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown_error'
    logger.warn('sanity_fetch_failed', { type, message })
    return fallback
  }
}
