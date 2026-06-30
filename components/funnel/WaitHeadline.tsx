'use client'

import { useCallWhen } from '@/hooks/useCallWhen'
import { Accent } from '@/components/funnel/Accent'

/** Client island — the thank-you H1 whose date clause localizes to the viewer's timezone. */
export function WaitHeadline({ firstName, iso, callDate, callTime }: { firstName: string; iso: string; callDate: string; callTime: string }) {
  const when = useCallWhen(iso)

  return (
    <h1 style={{ fontWeight: 800, fontSize: 34, lineHeight: 1.15, color: 'var(--ink-deep)', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
      {firstName ? `${firstName}, watch ` : 'Watch '}this short video below so your call{' '}
      {when ? (
        <>
          on{' '}
          <Accent>
            {when.day} at {when.time}
          </Accent>{' '}
        </>
      ) : callDate ? (
        <>
          on{' '}
          <Accent>
            {callDate}
            {callTime && ` at ${callTime}`}
          </Accent>{' '}
        </>
      ) : null}
      doesn&apos;t get <Accent>cancelled</Accent>
    </h1>
  )
}
