import { buildFunnelMarkdown } from '@/lib/funnel-map'
import { getSiteUrl } from '@/lib/site-url'

/**
 * Human-readable funnel map → served at /funnelmap.md.
 *
 * Same single source of truth as /funnelmap.json (lib/funnel-map.ts), rendered as
 * Markdown so a human can eyeball which pages sit at which funnel level.
 * `force-static` prerenders it at build time, so a fresh copy ships every deploy.
 */
export const dynamic = 'force-static'

export function GET() {
  const md = buildFunnelMarkdown({ siteUrl: getSiteUrl(), generatedAt: new Date().toISOString() })
  return new Response(md, {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  })
}
