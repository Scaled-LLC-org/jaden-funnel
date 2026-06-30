'use client'

import { useMemo } from 'react'
import { logger } from '@/lib/logger'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const
const SESSION_KEY = 'am_utms'

export interface UtmParams {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  /** All values are strings, so a UtmParams is also a plain string map (assignable to Record<string, string>). */
  [key: string]: string
}

/** Merge current URL search params with stored params and persist the result.
 *  Carries forward ALL persisted params (UTMs + click-ids like gclid/fbclid). */
function getMergedParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams()

  const current = new URLSearchParams(window.location.search)
  const beforeMerge = current.toString()
  let storedRaw: string | null = null
  const carriedKeys: string[] = []
  try {
    storedRaw = sessionStorage.getItem(SESSION_KEY)
    if (storedRaw) {
      const base = new URLSearchParams(storedRaw)
      // Carry forward stored params that aren't in the current URL
      base.forEach((val, key) => {
        if (!current.has(key)) {
          current.set(key, val)
          carriedKeys.push(key)
        }
      })
    }
    if (current.size > 0) {
      sessionStorage.setItem(SESSION_KEY, current.toString())
    }
  } catch (err) {
    logger.warn('sessionstorage_failed', { error: String(err) })
  }
  if (beforeMerge !== current.toString()) {
    logger.debug('params_merged', {
      fromUrl: beforeMerge || '(none)',
      fromStorage: storedRaw || '(none)',
      carriedFromStorage: carriedKeys,
      finalKeys: Array.from(current.keys()),
    })
  }
  return current
}

/** Pluck the four UTM keys off a params bag, defaulting each to ''. */
function pickUtms(params: URLSearchParams): UtmParams {
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
  }
}

/** React hook — returns UTM-specific params (for analytics payloads). */
export function useUtmParams(): UtmParams {
  return useMemo(() => {
    const utms = pickUtms(getMergedParams())
    logger.debug('useUtmParams_resolved', utms)
    return utms
  }, [])
}

/** Non-hook — returns UTM-specific params (for analytics payloads). */
export function getUtmParams(): UtmParams {
  return pickUtms(getMergedParams())
}

/** Build a query string with only UTM params (for analytics/webhook payloads). */
export function buildUtmQueryString(utms: UtmParams): string {
  const params = new URLSearchParams()
  UTM_KEYS.forEach(k => {
    if (utms[k]) params.set(k, utms[k])
  })
  const str = params.toString()
  return str ? `?${str}` : ''
}

/** Build a query string with ALL persisted search params (for navigation). */
export function buildPersistedSearch(options: { email?: string } = {}): string {
  const params = getMergedParams()
  const email = options.email?.trim() || params.get('email') || ''
  if (email) {
    params.set('email', email)
  }
  const str = params.toString()
  return str ? `?${str}` : ''
}
