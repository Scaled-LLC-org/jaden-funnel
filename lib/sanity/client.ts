import { createClient } from '@sanity/client'
import { config } from '@/lib/config'

/**
 * Server-side Sanity read client. Next.js fetches funnel content on the server
 * (no browser-only prefetch cache), so this is a plain published-perspective
 * client. When the project id is still a `PLACEHOLDER_*` sentinel the client is
 * never actually called — see `getPageContent` in `content.ts`.
 */
export const sanityClient = createClient({
  projectId: config.sanity.projectId,
  dataset: config.sanity.dataset,
  apiVersion: config.sanity.apiVersion,
  useCdn: config.sanity.useCdn,
})
