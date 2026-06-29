import { BrandHeader } from '@/components/funnel/BrandHeader'
import { SiteFooter } from '@/components/funnel/SiteFooter'
import { CalendlyEmbed } from '@/components/funnel/CalendlyEmbed'
import { UrgencyBar } from '@/components/funnel/UrgencyBar'
import { Headline } from '@/components/funnel/Headline'
import { getPageContent } from '@/lib/sanity/content'
import { firstParam, type SearchParams } from '@/lib/search-params'

export default async function BookPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const content = await getPageContent('amBookPage')
  const goal = firstParam(sp.goal)
  const goalWord = goal === 'cut' ? 'lean, defined' : goal === 'build' ? 'stronger' : 'aesthetic'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* urgency */}
      <UrgencyBar>{content.announcementBarText}</UrgencyBar>

      <BrandHeader />

      <section style={{ padding: '48px 0 16px', textAlign: 'center' }}>
        <div className='am-wrap' style={{ maxWidth: 680 }}>
          <p className='am-eyebrow' style={{ marginBottom: 14, color: 'var(--accent)' }}>
            You&apos;re a fit &mdash; last step
          </p>
          <h1 className='am-h1' style={{ fontSize: 34, margin: '0 0 14px' }}>
            <Headline segments={content.headline} />
          </h1>
          <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
            Pick a time below. We&apos;ll map out exactly how to build your{goal ? ` ${goalWord} ` : ' '}
            physique naturally, on your schedule. No pressure, no hard sell.
          </p>
        </div>
      </section>

      {/* Calendly inline */}
      <section style={{ padding: '20px 0 64px' }}>
        <div className='am-wrap' style={{ maxWidth: 760 }}>
          <CalendlyEmbed />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
