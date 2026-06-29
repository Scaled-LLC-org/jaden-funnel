import { BrandHeader } from '@/components/funnel/BrandHeader'
import { SiteFooter } from '@/components/funnel/SiteFooter'
import { VideoPlayer } from '@/components/funnel/VideoPlayer'
import { WaitHeadline } from '@/components/funnel/WaitHeadline'
import { ThankYouCalendar } from '@/components/funnel/ThankYouCalendar'
import { ThankYouStickyBar } from '@/components/funnel/ThankYouStickyBar'
import { firstParam, type SearchParams } from '@/lib/search-params'
import { getPageContent } from '@/lib/sanity/content'

/* =========================================================================
   DATA
   ========================================================================= */
const PRECALL = { youtubeId: '', poster: '/posters/precall.svg' }

const BREAKOUTS = [
  {
    n: '01',
    title: 'Why natural beats enhanced',
    sub: 'The real cost of peptides and gear, and why a natural physique lasts longer and looks better.',
    length: '6 min',
    youtubeId: '',
    poster: '/posters/breakout-01.svg',
  },
  {
    n: '02',
    title: 'The system for a busy schedule',
    sub: 'Nutrition calibration and the Peak Aesthetic Split, built around a real life. No living in the gym.',
    length: '8 min',
    youtubeId: '',
    poster: '/posters/breakout-02.svg',
  },
  {
    n: '03',
    title: 'What working with Jaden looks like',
    sub: 'Form-review breakdowns, the app, check-ins, and the exact path to your dream physique.',
    length: '7 min',
    youtubeId: '',
    poster: '/posters/breakout-03.svg',
  },
]

const TESTIMONIALS = [
  { name: 'Anthony', age: '', headline: '+12 lbs muscle in 4 months', youtubeId: '', poster: '/posters/t-chris.svg' },
  { name: 'Joshua', age: '', headline: 'Dropped 40 lbs, kept it off', youtubeId: '', poster: '/posters/t-john.svg' },
  { name: 'Kaleb', age: '', headline: 'Leaner + bigger running his company', youtubeId: '', poster: '/posters/t-caleb.svg' },
  { name: 'Jon', age: '38', headline: 'Dialed in around a packed schedule', youtubeId: '', poster: '/posters/t-anthony.svg' },
]

const CHECKLIST = [
  'Add the call to your calendar using Step 1 above.',
  'Reply “YES” to our confirmation text so we know you’re locked in.',
  'Show up somewhere quiet, on a laptop or with headphones.',
  'Watch the three breakdowns below so your call goes straight to your plan.',
]

/* =========================================================================
   STEP GRAPHICS — static, server-rendered mockups
   ========================================================================= */
function MessageGraphic({ firstName }: { firstName: string }) {
  return (
    <div
      style={{
        border: '1px solid var(--rule)',
        borderRadius: 8,
        background: 'var(--paper)',
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          alignSelf: 'flex-start',
          maxWidth: '85%',
          background: '#fff',
          border: '1px solid var(--rule)',
          borderRadius: '12px 12px 12px 3px',
          padding: '7px 11px',
        }}
      >
        <p style={{ margin: 0, fontSize: 11, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
          Hey{firstName ? ` ${firstName}` : ''}! Your call is confirmed. Reply YES to lock it in.
        </p>
      </div>
      <div style={{ alignSelf: 'flex-end', background: 'var(--accent)', borderRadius: '12px 12px 3px 12px', padding: '7px 14px' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#fff', fontWeight: 600 }}>YES</p>
      </div>
    </div>
  )
}

function VideoGraphic() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[68, 100, 84].map((w, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid var(--rule)',
            borderRadius: 6,
            padding: '6px 8px',
            background: i === 0 ? 'var(--accent-soft)' : '#fff',
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: i === 0 ? 'var(--accent)' : 'var(--rule-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width='9' height='9' viewBox='0 0 24 24' fill='#fff'>
              <path d='M8 5v14l11-7z' />
            </svg>
          </span>
          <span style={{ height: 5, borderRadius: 3, background: 'var(--rule)', width: `${w}%` }} />
        </div>
      ))}
    </div>
  )
}

/* =========================================================================
   PAGE
   ========================================================================= */
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const content = await getPageContent('amThankYouPage')
  const firstName = firstParam(sp.invitee_first_name) || firstParam(sp.name)
  const callTime = firstParam(sp.time)
  const callDate = firstParam(sp.date)
  // Calendly passes an ISO timestamp as event_start_time (fallback: ?start= / ?iso=).
  const isoStart = firstParam(sp.event_start_time) || firstParam(sp.start) || firstParam(sp.iso)

  const steps = [
    { n: '1', t: 'Add to Calendar', d: 'Lock the time in so life doesn’t get in the way.', btn: true, graphic: <ThankYouCalendar iso={isoStart} /> },
    { n: '2', t: 'Reply YES to our text', d: 'We’ll text within 10 minutes. Reply YES to hold your spot.', graphic: <MessageGraphic firstName={firstName} /> },
    { n: '3', t: 'Watch the videos below', d: 'Three breakdowns plus client stories. Come in with context.', graphic: <VideoGraphic /> },
  ]

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <BrandHeader />

      {/* WAIT */}
      <section style={{ padding: '56px 0 8px', textAlign: 'center' }}>
        <div className='am-wrap'>
          <p
            style={{
              fontFamily: 'var(--sans)',
              fontWeight: 900,
              fontSize: 52,
              color: 'var(--accent)',
              lineHeight: 1,
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
            }}
          >
            WAIT!
          </p>
          <WaitHeadline firstName={firstName} iso={isoStart} callDate={callDate} callTime={callTime} />
        </div>
      </section>

      {/* PRE-CALL VSL */}
      <section style={{ padding: '24px 0 56px' }}>
        <div className='am-wrap' style={{ maxWidth: 680 }}>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <p className='am-bounce' style={{ fontFamily: 'var(--script)', fontSize: 30, color: 'var(--accent)', margin: 0 }}>
              Watch this!
            </p>
          </div>
          <VideoPlayer poster={PRECALL.poster} youtubeId={PRECALL.youtubeId} />
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-mute)', marginTop: 14 }}>{content.subheadline}</p>
        </div>
      </section>

      {/* 3 STEPS */}
      <section style={{ padding: '56px 0', borderTop: '1px solid var(--rule)', background: 'var(--paper)' }}>
        <div className='am-wrap'>
          <p className='am-eyebrow' style={{ marginBottom: 12 }}>
            Before your call
          </p>
          <h2 style={{ fontWeight: 500, fontSize: 30, color: 'var(--ink-deep)', margin: '0 0 32px', letterSpacing: '-0.01em' }}>
            Do these <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>three things.</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {steps.map(s => (
              <div
                key={s.n}
                style={{
                  background: 'var(--bg)',
                  borderTop: '1px solid var(--ink)',
                  borderBottom: '1px solid var(--rule)',
                  padding: '26px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'var(--ink)',
                      color: 'var(--bg)',
                      fontSize: 12,
                      fontFamily: 'var(--mono)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {s.n}
                  </span>
                  <span style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 17, color: 'var(--ink-deep)' }}>{s.t}</span>
                </div>
                <p style={{ fontWeight: 300, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 16px' }}>{s.d}</p>
                <div style={{ marginTop: 'auto', marginBottom: s.btn ? 16 : 0 }}>{s.graphic}</div>
                {s.btn && (
                  <button
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: 'var(--accent)',
                      color: '#fff',
                      border: 0,
                      borderRadius: 6,
                      fontFamily: 'var(--sans)',
                      fontWeight: 600,
                      fontSize: 13,
                      letterSpacing: '0.02em',
                      cursor: 'pointer',
                    }}
                  >
                    Add to Calendar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WATCH BEFORE WE TALK (2-col) */}
      <section style={{ padding: '64px 0' }}>
        <div className='am-wrap'>
          <p className='am-eyebrow' style={{ color: 'var(--accent)', marginBottom: 12 }}>
            ✓ Your call is booked
          </p>
          <h2 style={{ fontWeight: 500, fontSize: 30, color: 'var(--ink-deep)', margin: '0 0 32px', letterSpacing: '-0.01em' }}>
            Watch this <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>before we talk</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center' }}>
            <VideoPlayer poster={PRECALL.poster} youtubeId={PRECALL.youtubeId} />
            <div>
              <p style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 16, color: 'var(--ink-deep)', marginBottom: 16 }}>
                What to do before we talk:
              </p>
              {CHECKLIST.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      fontSize: 11,
                      fontFamily: 'var(--mono)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 BREAKOUTS */}
      <section style={{ padding: '64px 0', borderTop: '1px solid var(--rule)', background: 'var(--paper)' }}>
        <div className='am-wrap'>
          <p className='am-eyebrow' style={{ marginBottom: 12 }}>
            Watch in order · 20 minutes total
          </p>
          <h2 style={{ fontWeight: 500, fontSize: 30, color: 'var(--ink-deep)', margin: '0 0 36px', letterSpacing: '-0.01em' }}>
            The three breakdowns to watch <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>before we talk</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
            {BREAKOUTS.map(b => (
              <div key={b.n}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em' }}>VIDEO {b.n}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{b.length}</span>
                </div>
                <h3 style={{ fontWeight: 500, fontSize: 18, color: 'var(--ink-deep)', margin: '0 0 6px', lineHeight: 1.25 }}>{b.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.55, margin: '0 0 14px' }}>{b.sub}</p>
                <VideoPlayer poster={b.poster} youtubeId={b.youtubeId} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '64px 0' }}>
        <div className='am-wrap'>
          <p className='am-eyebrow' style={{ marginBottom: 12 }}>
            Real clients, real physiques
          </p>
          <h2 style={{ fontWeight: 500, fontSize: 30, color: 'var(--ink-deep)', margin: '0 0 36px', letterSpacing: '-0.01em' }}>
            Hear it from the <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>guys who did it</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name}>
                <VideoPlayer poster={t.poster} youtubeId={t.youtubeId} ratio='3/4' />
                <p style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 15, color: 'var(--ink-deep)', margin: '12px 0 2px' }}>
                  {t.name}
                  {t.age && <span style={{ fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 12, color: 'var(--ink-mute)' }}> · {t.age}</span>}
                </p>
                <p style={{ fontSize: 12, color: 'var(--accent)', margin: 0 }}>{t.headline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ padding: '64px 0 80px', borderTop: '1px solid var(--rule)', background: 'var(--soft)' }}>
        <div className='am-wrap' style={{ textAlign: 'center', maxWidth: 720 }}>
          <p className='am-eyebrow' style={{ marginBottom: 12 }}>
            Quick background
          </p>
          <h2 style={{ fontWeight: 500, fontSize: 28, color: 'var(--ink-deep)', margin: '0 0 16px', letterSpacing: '-0.01em' }}>
            This call is a <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>conversation</em>, not a pitch
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.7, margin: '0 0 36px' }}>{content.aboutBody}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { num: '100%', label: 'Natural Approach' },
              { num: '300+', label: 'Workout Library' },
              { num: '1:1', label: 'Coaching With Jaden' },
            ].map(s => (
              <div
                key={s.label}
                style={{ borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--rule)', background: 'var(--bg)', padding: '22px 14px' }}
              >
                <p style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 30, color: 'var(--ink-deep)', margin: '0 0 6px' }}>{s.num}</p>
                <p className='am-eyebrow' style={{ fontSize: 9 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter>
        <p style={{ fontSize: 12, color: 'var(--on-dark-soft)', fontWeight: 300, margin: 0 }}>
          &copy; {new Date().getFullYear()} Jaden Levin. Individual results vary. Not medical advice.
        </p>
      </SiteFooter>

      <ThankYouStickyBar />
    </main>
  )
}
