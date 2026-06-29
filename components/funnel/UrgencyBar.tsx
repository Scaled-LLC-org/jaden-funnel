/** Server component — thin urgency strip above the fold (vsl, book). */
export function UrgencyBar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid var(--rule)', background: 'var(--paper)' }}>
      <div className='am-wrap' style={{ textAlign: 'center', padding: '10px 24px' }}>
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 500 }}>
          <span
            style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', marginRight: 8, verticalAlign: 'middle' }}
          />
          {children}
        </p>
      </div>
    </div>
  )
}
