import type { MetadataRoute } from 'next'
import { FUNNEL } from '@/lib/funnel-map'
import { getSiteUrl } from '@/lib/site-url'

/**
 * SEO sitemap → served at /sitemap.xml, regenerated on every build/deploy.
 * Includes every funnel route (per project decision), derived from the single
 * funnel topology in lib/funnel-map.ts so it never drifts from the app.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const lastModified = new Date()

  return FUNNEL.steps.map(step => ({
    url: `${base}${step.path === '/' ? '' : step.path}`,
    lastModified,
    changeFrequency: step.sitemap.changeFrequency,
    priority: step.sitemap.priority,
  }))
}
