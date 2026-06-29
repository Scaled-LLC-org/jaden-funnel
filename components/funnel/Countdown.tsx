'use client'

import { useEffect, useState } from 'react'

/** Client island — mm:ss countdown shown above the results CTA. */
export function Countdown({ seconds = 7 * 60 }: { seconds?: number }) {
  const [secs, setSecs] = useState(seconds)

  useEffect(() => {
    const t = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  return (
    <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 16, color: 'var(--accent)' }}>
      {mm}:{ss}
    </span>
  )
}
