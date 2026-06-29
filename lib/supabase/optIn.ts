import { getSupabase } from '@/lib/supabase/client'
import type { Json } from '@/lib/supabase/types'
import { config, isPlaceholder } from '@/lib/config'
import { logger } from '@/lib/logger'

/**
 * Lead-capture payload for a single opt-in. Lead identity fields
 * (email / firstName / lastName / name / phone) are merged into the JSONB
 * `form_data` column alongside the arbitrary quiz answers — they are never
 * logged. `utms` and `urlParams` map to the JSONB `utms` / `url_params`
 * columns.
 */
export interface OptInData {
  url: string
  email?: string
  firstName?: string
  lastName?: string
  name?: string
  phone?: string
  /** Arbitrary quiz answers / extra fields. */
  formData?: Record<string, unknown>
  utms?: Record<string, string> | null
  urlParams?: Record<string, string> | null
}

/** Result of an opt-in attempt. Never throws — callers may safely ignore it. */
export interface OptInResult {
  ok: boolean
  /** True when the insert was skipped because Supabase is unconfigured. */
  skipped?: boolean
  /** Non-PII error message when `ok` is false and the call was attempted. */
  error?: string
}

/**
 * Insert a lead into `scaled_landings.opt_ins`. Designed to never block funnel
 * navigation: when Supabase is unconfigured it no-ops, and any runtime failure
 * is caught and returned as a result rather than thrown.
 */
export async function insertOptIn({ url, email, firstName, lastName, name, phone, formData, utms, urlParams }: OptInData): Promise<OptInResult> {
  // Skip the network entirely while credentials are still placeholders.
  if (isPlaceholder(config.supabase.url) || isPlaceholder(config.supabase.anonKey)) {
    logger.debug('supabase_skipped_placeholder')
    return { ok: false, skipped: true }
  }

  // Fold lead identity fields into form_data (the JSONB sink for quiz answers).
  const mergedFormData = {
    ...(formData ?? {}),
    ...(email !== undefined ? { email } : {}),
    ...(firstName !== undefined ? { firstName } : {}),
    ...(lastName !== undefined ? { lastName } : {}),
    ...(name !== undefined ? { name } : {}),
    ...(phone !== undefined ? { phone } : {}),
  }

  const row = {
    url,
    workspace_id: config.workspaceId,
    form_data: mergedFormData as Json,
    utms: (utms ?? null) as Json | null,
    url_params: (urlParams ?? null) as Json | null,
  }

  // PII-free: log field keys and counts only, never values.
  logger.debug('supabase_optin_request', {
    table: 'opt_ins',
    schema: config.supabase.schema,
    formDataKeys: Object.keys(mergedFormData),
    utmsCount: utms ? Object.keys(utms).length : 0,
    urlParamsCount: urlParams ? Object.keys(urlParams).length : 0,
  })

  try {
    const { error } = await getSupabase().from('opt_ins').insert(row)

    if (error) {
      logger.error('supabase_optin_failed', { message: error.message })
      return { ok: false, error: error.message }
    }

    logger.info('supabase_optin_success')
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('supabase_optin_failed', { message })
    return { ok: false, error: message }
  }
}
