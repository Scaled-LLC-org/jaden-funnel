/**
 * The brand stat trio (e.g. 100% Natural · 300+ · 1:1). Two variants:
 *   `inline` — centered flex row, accent numbers (quiz proof screen)
 *   `card`   — 3-col grid of bordered cards, ink numbers (thank-you about)
 * Server component. */
export type Stat = { value: string; label: string }

export function StatGrid({ items, variant = 'inline' }: { items: Stat[]; variant?: 'inline' | 'card' }) {
  if (variant === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {items.map(s => (
          <div
            key={s.label}
            style={{ borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--rule)', background: 'var(--bg)', padding: '22px 14px' }}
          >
            <p style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 30, color: 'var(--ink-deep)', margin: '0 0 6px' }}>{s.value}</p>
            <p className='am-eyebrow' style={{ fontSize: 9 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 26 }}>
      {items.map(s => (
        <div key={s.label}>
          <p className='am-serif' style={{ fontSize: 26, fontWeight: 600, color: 'var(--accent)', margin: 0 }}>
            {s.value}
          </p>
          <p className='am-eyebrow' style={{ fontSize: 9 }}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  )
}
