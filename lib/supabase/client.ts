import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config } from '@/lib/config'
import type { Database } from '@/lib/supabase/types'

/**
 * Lazily-created, singleton Supabase client scoped to the `scaled_landings`
 * schema. supabase-js runs in both the server and the browser; creating it on
 * first use (rather than at module load) keeps it SSR-safe and avoids spinning
 * up a client when the funnel never touches Supabase (e.g. placeholder config).
 */
let client: SupabaseClient<Database> | null = null

export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    client = createClient<Database>(config.supabase.url, config.supabase.anonKey, {
      db: { schema: config.supabase.schema },
    })
  }
  return client
}
