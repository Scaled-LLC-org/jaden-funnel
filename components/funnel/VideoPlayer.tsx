'use client'

import { useState } from 'react'
import { logger } from '@/lib/logger'
import { captureEvent } from '@/lib/analytics/posthog'
import { VideoPoster } from '@/components/funnel/VideoPoster'

/** Client island — poster thumbnail that swaps to a YouTube embed on click. */
export function VideoPlayer({ poster, youtubeId, ratio = '16/9' }: { poster: string; youtubeId?: string; ratio?: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div
      onClick={() => {
        if (youtubeId) {
          logger.info('video_play', { youtubeId })
          captureEvent('video_watched', { youtubeId, action: 'play' })
          setPlaying(true)
        }
      }}
      className='am-vid'
      style={{ aspectRatio: ratio, cursor: youtubeId ? 'pointer' : 'default' }}
    >
      {playing && youtubeId ? (
        <iframe
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
          allow='autoplay; encrypted-media'
          allowFullScreen
        />
      ) : (
        <VideoPoster poster={poster} />
      )}
    </div>
  )
}
