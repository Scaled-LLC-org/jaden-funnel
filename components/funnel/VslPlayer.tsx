'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import { captureEvent } from '@/lib/analytics/posthog'

const PRECALL_POSTER = '/posters/vsl.svg'

/** Client island — the VSL video with a click-to-pause exit-intent overlay. */
export function VslPlayer({ bookHref }: { bookHref: string }) {
  const [paused, setPaused] = useState(false)

  const toggle = () => {
    const resuming = paused
    logger.info(resuming ? 'vsl_play' : 'vsl_exit_intent_shown')
    if (resuming) captureEvent('video_watched', { video: 'vsl', action: 'play' })
    setPaused(p => !p)
  }

  return (
    <div className='am-vid' style={{ aspectRatio: '16/9', margin: '0 auto', cursor: 'pointer' }} onClick={toggle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={PRECALL_POSTER} alt='' style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div className='am-vid-play'>
        <svg width='26' height='26' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M8 5v14l11-7z' />
        </svg>
      </div>
      {paused && (
        <div
          className='am-fade'
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(12,20,24,0.93)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 5,
          }}
        >
          <p style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Before you go…</p>
          <p style={{ color: 'var(--on-dark-soft)', fontSize: 14, margin: '0 0 22px', textAlign: 'center', maxWidth: 360 }}>
            Book your free body assessment call. If we&apos;re a fit, we&apos;ll show you how to start. If not, you walk with a free roadmap.
          </p>
          <Link href={bookHref} className='am-btn' onClick={() => logger.info('vsl_cta_click', { source: 'exit_intent' })}>
            Book My Free Call
          </Link>
        </div>
      )}
    </div>
  )
}
