import { BrandHeader } from '@/components/funnel/BrandHeader'
import { SiteFooter } from '@/components/funnel/SiteFooter'
import { Headline } from '@/components/funnel/Headline'
import { getPageContent } from '@/lib/sanity/content'

const SKOOL_URL = 'https://www.skool.com/your-jaden-community' // TODO: real link

export default async function CommunityPage() {
  const content = await getPageContent('amCommunityPage')

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <BrandHeader />

      <section style={{ padding: '64px 0', textAlign: 'center' }}>
        <div className='am-wrap' style={{ maxWidth: 640 }}>
          <p className='am-eyebrow' style={{ marginBottom: 14, color: 'var(--accent)' }}>
            {content.eyebrowCopy}
          </p>
          <h1 className='am-h1' style={{ fontSize: 38, margin: '0 0 16px' }}>
            <Headline segments={content.headline} />
          </h1>
          <p style={{ fontSize: 16, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.65, maxWidth: 540, margin: '0 auto 32px' }}>
            {content.subheadline}
          </p>

          <div
            style={{
              border: '1px solid var(--rule)',
              borderTop: '1px solid var(--ink)',
              borderRadius: 10,
              background: 'var(--paper)',
              padding: '32px 28px',
              maxWidth: 460,
              margin: '0 auto 28px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
              <span className='am-serif' style={{ fontSize: 40, fontWeight: 600, color: 'var(--ink-deep)' }}>
                {content.priceText}
              </span>
              <span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>/month</span>
            </div>
            {content.features.map(f => (
              <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 11 }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 300 }}>{f}</span>
              </div>
            ))}
          </div>

          <a href={SKOOL_URL} target='_blank' rel='noopener noreferrer' className='am-btn' style={{ fontSize: 16, padding: '16px 40px' }}>
            {content.ctaButtonText}
          </a>
          <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 14 }}>Cancel anytime &middot; Upgrade to 1:1 coaching whenever you&apos;re ready</p>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
