import { PlayIcon } from '@/components/funnel/icons'

/**
 * Poster image + centered play button — the shared still frame behind every
 * funnel video (`VideoPlayer`, `VslPlayer`). Render it inside an `.am-vid`
 * wrapper that owns the click/state. Server-safe. */
export function VideoPoster({ poster, iconSize = 22 }: { poster: string; iconSize?: number }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt='' style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div className='am-vid-play'>
        <PlayIcon size={iconSize} />
      </div>
    </>
  )
}
