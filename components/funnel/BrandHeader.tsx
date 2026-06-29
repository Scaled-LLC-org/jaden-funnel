/** Server component — shared brand header used across funnel surfaces. */
export function BrandHeader({ centered = false, border = true, withName = true }: { centered?: boolean; border?: boolean; withName?: boolean }) {
  return (
    <header
      className='am-wrap'
      style={{
        display: 'flex',
        justifyContent: centered ? 'center' : 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: border ? '1px solid var(--rule)' : undefined,
      }}
    >
      <span className='am-eyebrow' style={{ color: 'var(--ink-deep)' }}>
        Aesthetic Mastery
      </span>
      {withName && !centered && (
        <span className='am-serif' style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--ink-mute)', fontWeight: 400 }}>
          Jaden Levin
        </span>
      )}
    </header>
  )
}
