import Link from 'next/link'
import { BrandHeader } from '@/components/funnel/BrandHeader'
import { SiteFooter } from '@/components/funnel/SiteFooter'
import { ScoreRing } from '@/components/funnel/ScoreRing'
import { Countdown } from '@/components/funnel/Countdown'
import { readCtx, scorePillars, band } from '@/lib/quiz-scoring'
import { firstParam, toQuery, type SearchParams } from '@/lib/search-params'
import { logger } from '@/lib/logger'
import { getPageContent } from '@/lib/sanity/content'

export default async function ResultsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const content = await getPageContent('amResultsPage')
  const ctx = readCtx(sp)
  const { scored, overall, top } = scorePillars(ctx)
  logger.info('results_scored', { overall, top: top.key })
  const firstName = firstParam(sp.name).split(' ')[0]
  const query = toQuery(sp)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <BrandHeader centered withName={false} />

      <div className='am-wrap' style={{ maxWidth: 720, paddingBottom: 80 }}>
        {/* ===== TOP GRAPHIC: overall score ring ===== */}
        <section style={{ textAlign: 'center', padding: '44px 0 8px' }}>
          <p className='am-eyebrow' style={{ color: 'var(--accent)', marginBottom: 18 }}>
            {content.eyebrowCopy}
          </p>
          <ScoreRing value={overall} />
          <h1 className='am-h1' style={{ fontSize: 30, margin: '8px 0 10px' }}>
            {firstName ? `${firstName}, here's your ` : "Here's your "}
            <span className='am-accent'>physique blueprint</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 400, lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
            We analyzed your answers and scored the 4 pillars that decide whether your body actually changes. Your biggest opportunity right now is{' '}
            <strong style={{ color: 'var(--ink-deep)' }}>{top.title}</strong>.
          </p>
        </section>

        {/* ===== "what's possible" bullets ===== */}
        <section style={{ padding: '28px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', maxWidth: 540, margin: '0 auto' }}>
            {content.bullets.map(b => (
              <div key={b} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>{b}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SCORED PILLAR CARDS ===== */}
        <section style={{ padding: '16px 0' }}>
          <p className='am-eyebrow' style={{ textAlign: 'center', marginBottom: 22 }}>
            Your priority scores
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {scored.map(p => {
              const b = band(p.value)
              return (
                <div
                  key={p.key}
                  style={{
                    display: 'flex',
                    gap: 18,
                    alignItems: 'flex-start',
                    background: 'var(--bg)',
                    border: '1px solid var(--rule)',
                    borderTop: `3px solid ${b.color}`,
                    borderRadius: 10,
                    padding: '20px 22px',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: b.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 22,
                      fontFamily: 'var(--sans)',
                    }}
                  >
                    {p.value}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: b.color }}>
                      {p.secret} · {b.label}
                    </p>
                    <h3 style={{ margin: '3px 0 6px', fontSize: 17, fontWeight: 800, color: 'var(--ink-deep)', letterSpacing: '-0.01em' }}>{p.title}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{p.copy}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ===== SUMMARY ===== */}
        <section style={{ padding: '28px 0' }}>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 12, padding: '26px 28px' }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 19, fontWeight: 800, color: 'var(--ink-deep)' }}>{content.summaryHeading}</h2>
            <p style={{ margin: 0, fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
              You scored <strong style={{ color: 'var(--accent)' }}>{top.value}/100</strong> on {top.title} — that&apos;s your highest-leverage fix right now.
              The good news? Every one of these is 100% fixable, naturally, with the exact system Jaden walks you through next. No peptides. No shortcuts.
            </p>
          </div>
        </section>

        {/* ===== TIMER + CTA ===== */}
        <section style={{ textAlign: 'center', padding: '12px 0 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{content.countdownText}</span>
            <Countdown />
          </div>
          <Link
            href={`/vsl?${query}`}
            className='am-btn'
            style={{ display: 'block', width: '100%', maxWidth: 460, margin: '0 auto', fontSize: 14, padding: '18px 28px' }}
          >
            {content.ctaButtonText}
          </Link>
          <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 12 }}>Tailored to your age, situation, and goals. Free to watch.</p>
        </section>
      </div>

      <SiteFooter />
    </main>
  )
}
