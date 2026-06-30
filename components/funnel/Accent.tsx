/**
 * Inline accent emphasis — italic + accent color. Matches the hardcoded
 * `<em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>` emphasis used on
 * the thank-you surfaces. Distinct from the `.am-italic` CMS treatment (which is
 * NOT italic). Server-safe; usable inside client components. */
export function Accent({ children }: { children: React.ReactNode }) {
  return <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{children}</em>
}
