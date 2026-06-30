/** Shared inline SVG glyphs used across funnel surfaces. Server-safe (no hooks). */

/** Triangular play glyph. `fill` defaults to `currentColor` so callers can color via CSS. */
export function PlayIcon({ size = 22, fill = 'currentColor' }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill={fill}>
      <path d='M8 5v14l11-7z' />
    </svg>
  )
}

/** Checkmark glyph (stroked). `color` sets the stroke. */
export function CheckIcon({ size = 12, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke={color} strokeWidth='3.5' strokeLinecap='round'>
      <path d='M5 13l4 4L19 7' />
    </svg>
  )
}
