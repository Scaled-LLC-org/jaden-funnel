/**
 * Resolve the deployment's public base URL — absolute, protocol-qualified, no
 * trailing slash. Used by the sitemap and funnelmap to emit absolute URLs.
 *
 * Priority:
 *   1. NEXT_PUBLIC_SITE_URL        — explicit override (set this for the real domain)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's stable production domain
 *   3. VERCEL_URL                  — the per-deployment URL (preview builds)
 *   4. http://localhost:3000       — local dev fallback
 */
function withProtocol(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const vercel = process.env.VERCEL_URL

  const raw = explicit ? withProtocol(explicit) : vercelProd ? withProtocol(vercelProd) : vercel ? withProtocol(vercel) : 'http://localhost:3000'

  return raw.replace(/\/+$/, '')
}
