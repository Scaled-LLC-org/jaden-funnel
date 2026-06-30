/**
 * Section eyebrow + heading pair, the repeated block on the thank-you surfaces.
 * `children` is the `<h2>` content (wrap accented spans in `<Accent/>`).
 * Server component. */
export function SectionHeading({
  eyebrow,
  eyebrowAccent = false,
  fontSize = 30,
  marginBottom = 32,
  children,
}: {
  eyebrow: string
  eyebrowAccent?: boolean
  fontSize?: number
  marginBottom?: number
  children: React.ReactNode
}) {
  return (
    <>
      <p className='am-eyebrow' style={{ marginBottom: 12, ...(eyebrowAccent ? { color: 'var(--accent)' } : {}) }}>
        {eyebrow}
      </p>
      <h2 style={{ fontWeight: 500, fontSize, color: 'var(--ink-deep)', margin: `0 0 ${marginBottom}px`, letterSpacing: '-0.01em' }}>{children}</h2>
    </>
  )
}
