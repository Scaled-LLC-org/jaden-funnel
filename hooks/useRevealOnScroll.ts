'use client'

import { useEffect } from 'react'

export function useRevealOnScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isMobile = window.matchMedia('(max-width: 768px)').matches

    if (isMobile) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'))
    }

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('visible')
          io.unobserve(entry.target)
        })
      },
      { threshold: 0.01, rootMargin: '0px 0px 35% 0px' },
    )

    // Watch for .reveal elements added after initial mount (child routes)
    const mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue
          if (node.classList.contains('reveal')) {
            isMobile ? node.classList.add('visible') : io.observe(node)
          }
          node.querySelectorAll?.('.reveal').forEach(el => {
            isMobile ? el.classList.add('visible') : io.observe(el)
          })
        }
      }
    })

    mo.observe(document.body, { childList: true, subtree: true })

    // Observe any .reveal elements already in the DOM
    if (!isMobile) {
      document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    }

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
