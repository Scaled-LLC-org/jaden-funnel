import { buildFunnelMap } from '@/lib/funnel-map'
import { getSiteUrl } from '@/lib/site-url'

/**
 * Machine-readable funnel topology → served at /funnelmap.json.
 *
 * `force-static` makes Next prerender this at build time, so a fresh copy ships
 * with every deploy (the `generatedAt` stamp reflects build/deploy time).
 * Derived from the single source of truth in lib/funnel-map.ts.
 */
export const dynamic = 'force-static'

export function GET() {
  const map = buildFunnelMap({ siteUrl: getSiteUrl(), generatedAt: new Date().toISOString() })
  return Response.json(map)
}
