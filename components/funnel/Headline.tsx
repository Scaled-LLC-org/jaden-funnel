import { Fragment } from 'react'
import type { HeadlineSegment } from '@/lib/sanity/types'

/**
 * Renders a CMS headline (`HeadlineSegment[]`) as inline content. Highlighted
 * segments get the funnel's accent treatment (`<em className="am-italic">`,
 * matching the existing hardcoded emphasis); the rest render as plain text.
 * Server component — drop it inside the page's own `<h1>`/`<h2>` wrapper.
 */
export function Headline({ segments }: { segments: HeadlineSegment[] }) {
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <em key={seg._key ?? i} className='am-italic'>
            {seg.text}
          </em>
        ) : (
          <Fragment key={seg._key ?? i}>{seg.text}</Fragment>
        ),
      )}
    </>
  )
}
