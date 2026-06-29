import type { SanityPageMap } from '@/lib/sanity/types'

/**
 * One GROQ query per singleton. Each projects every field that appears in the
 * matching interface (types.ts) and Studio schema (sanity/schemas/*). Headlines
 * are projected as inline segment arrays so `_key` is preserved.
 */

export const AM_HOME_QUERY = `*[_type=="amHomePage"][0]{
  eyebrowCopy, headline[]{_key,text,highlighted}, subheadline, introQuestion, ctaNote
}`

export const AM_RESULTS_QUERY = `*[_type=="amResultsPage"][0]{
  eyebrowCopy, headline[]{_key,text,highlighted}, subheadline, bullets,
  summaryHeading, summaryBody, ctaButtonText, countdownText
}`

export const AM_VSL_QUERY = `*[_type=="amVslPage"][0]{
  announcementBarText, eyebrowCopy, headline[]{_key,text,highlighted}, subheadline,
  ctaButtonText, exitIntentText
}`

export const AM_BOOK_QUERY = `*[_type=="amBookPage"][0]{
  announcementBarText, headline[]{_key,text,highlighted}, subheadline
}`

export const AM_THANK_YOU_QUERY = `*[_type=="amThankYouPage"][0]{
  headline[]{_key,text,highlighted}, subheadline, stepsHeading, aboutHeading, aboutBody
}`

export const AM_COMMUNITY_QUERY = `*[_type=="amCommunityPage"][0]{
  eyebrowCopy, headline[]{_key,text,highlighted}, subheadline, priceText, ctaButtonText, features
}`

export const AM_SETTINGS_QUERY = `*[_type=="amSettings"][0]{
  announcementBarText, urgencyBarText, calendlyUrl,
  social{youtube, instagram, tiktok}
}`

export const VIDEO_LIBRARY_QUERY = `*[_type=="videoLibrary"][0]{
  vslVideoId, thankYouWelcomeVideoId, thankYouTrainingVideoId
}`

/** Lookup of every query by its singleton type key. */
export const QUERIES: Record<keyof SanityPageMap, string> = {
  amHomePage: AM_HOME_QUERY,
  amResultsPage: AM_RESULTS_QUERY,
  amVslPage: AM_VSL_QUERY,
  amBookPage: AM_BOOK_QUERY,
  amThankYouPage: AM_THANK_YOU_QUERY,
  amCommunityPage: AM_COMMUNITY_QUERY,
  amSettings: AM_SETTINGS_QUERY,
  videoLibrary: VIDEO_LIBRARY_QUERY,
}
