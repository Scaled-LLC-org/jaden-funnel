'use client'

import { useEffect, useState } from 'react'

/** Client island — the animated overall-score ring on /results. */
export function ScoreRing({ value }: { value: number }) {
  const [ring, setRing] = useState(0)

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1100, 1)
      setRing(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  const C = 2 * Math.PI * 52

  return (
    <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 10px' }}>
      <svg width='180' height='180' viewBox='0 0 120 120' style={{ transform: 'rotate(-90deg)' }}>
        <circle cx='60' cy='60' r='52' fill='none' stroke='var(--rule)' strokeWidth='9' />
        <circle
          cx='60'
          cy='60'
          r='52'
          fill='none'
          stroke='var(--accent)'
          strokeWidth='9'
          strokeLinecap='round'
          strokeDasharray={C}
          strokeDashoffset={C - (C * ring) / 100}
          style={{ transition: 'stroke-dashoffset .1s linear' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--sans)', fontWeight: 900, fontSize: 46, color: 'var(--ink-deep)', lineHeight: 1, letterSpacing: '-0.03em' }}>
          {ring}
        </span>
        <span className='am-eyebrow' style={{ fontSize: 9, marginTop: 2 }}>
          out of 100
        </span>
      </div>
    </div>
  )
}
