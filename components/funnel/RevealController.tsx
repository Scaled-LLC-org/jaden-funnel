'use client'

import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'

/**
 * Mounts the scroll-reveal IntersectionObserver once, app-wide. Any element
 * with `className="reveal"` fades/slides in when scrolled into view
 * (`.reveal` → `.reveal.visible`). Renders nothing. Mounted in the root layout.
 */
export function RevealController() {
  useRevealOnScroll()
  return null
}
