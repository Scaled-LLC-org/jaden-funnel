/**
 * App-side Sanity types. Every field name here mirrors the Studio schema field
 * names (sanity/schemas/*) and the GROQ projections in queries.ts exactly.
 */

/** A single headline segment; `highlighted` segments get accent/gradient styling. */
export interface HeadlineSegment {
  _key?: string
  text: string
  highlighted: boolean
}

export interface AmHomePage {
  eyebrowCopy: string
  headline: HeadlineSegment[]
  subheadline: string
  introQuestion: string
  ctaNote: string
}

export interface AmResultsPage {
  eyebrowCopy: string
  headline: HeadlineSegment[]
  subheadline: string
  bullets: string[]
  summaryHeading: string
  summaryBody: string
  ctaButtonText: string
  countdownText: string
}

export interface AmVslPage {
  announcementBarText: string
  eyebrowCopy: string
  headline: HeadlineSegment[]
  subheadline: string
  ctaButtonText: string
  exitIntentText: string
}

export interface AmBookPage {
  announcementBarText: string
  headline: HeadlineSegment[]
  subheadline: string
}

export interface AmThankYouPage {
  headline: HeadlineSegment[]
  subheadline: string
  stepsHeading: string
  aboutHeading: string
  aboutBody: string
}

export interface AmCommunityPage {
  eyebrowCopy: string
  headline: HeadlineSegment[]
  subheadline: string
  priceText: string
  ctaButtonText: string
  features: string[]
}

export interface AmSettingsSocial {
  youtube: string
  instagram: string
  tiktok: string
}

export interface AmSettings {
  announcementBarText: string
  urgencyBarText: string
  calendlyUrl: string
  social: AmSettingsSocial
}

export interface VideoLibrary {
  vslVideoId: string
  thankYouWelcomeVideoId: string
  thankYouTrainingVideoId: string
}

/** Map of every singleton type — keys are the Sanity `_type`/`documentId`. */
export interface SanityPageMap {
  amHomePage: AmHomePage
  amResultsPage: AmResultsPage
  amVslPage: AmVslPage
  amBookPage: AmBookPage
  amThankYouPage: AmThankYouPage
  amCommunityPage: AmCommunityPage
  amSettings: AmSettings
  videoLibrary: VideoLibrary
}
