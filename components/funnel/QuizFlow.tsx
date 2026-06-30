'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'
import { getUtmParams } from '@/hooks/useUtmParams'
import { submitLead } from '@/lib/lead-submit'
import { CheckIcon } from '@/components/funnel/icons'
import { StatGrid } from '@/components/funnel/StatGrid'

/* =========================================================================
   JADEN QUIZ — WarriorBabe-style mechanics, adapted to natural physique.
   Screen types: intro | single | multi | proof | analyzing | email
   Inherently interactive, so this is a client island. The server still
   prerenders its initial HTML (the intro screen) before hydration.
   ========================================================================= */

type Opt = { emoji?: string; label: string; sub?: string; value: string }
type Screen =
  | { type: 'intro'; q: string; opts: Opt[] }
  | { type: 'single'; key: string; q: string; why: string; opts: Opt[] }
  | { type: 'multi'; key: string; q: string; why: string; opts: Opt[] }
  | { type: 'proof'; stat: string; headline: string; body: string; quote: string; cite: string; stats: { n: string; l: string }[] }
  | { type: 'analyzing' }
  | { type: 'email' }

const SCREENS: Screen[] = [
  {
    type: 'intro',
    q: 'First, where are you today?',
    opts: [
      { label: 'Skinny-fat', sub: 'Soft, not much muscle yet', value: 'skinnyfat' },
      { label: 'Carrying extra weight', sub: 'Ready to lean down', value: 'overweight' },
      { label: 'Train already, but stuck', sub: 'Plateaued, not seeing change', value: 'plateau' },
      { label: 'In good shape', sub: 'Want to look elite', value: 'advanced' },
    ],
  },
  {
    type: 'single',
    key: 'age',
    q: 'How old are you?',
    why: 'Your age shapes how we structure training, recovery, and nutrition.',
    opts: [
      { label: '18–24', value: '18-24' },
      { label: '25–34', value: '25-34' },
      { label: '35–44', value: '35-44' },
      { label: '45+', value: '45+' },
    ],
  },
  {
    type: 'multi',
    key: 'goals',
    q: 'Select the areas you want to improve',
    why: 'Choose all that apply — we build the plan around what you actually want.',
    opts: [
      { emoji: '💪', label: 'Build muscle', sub: 'Add lean size & shape', value: 'muscle' },
      { emoji: '⚖️', label: 'Lose body fat', sub: 'Get lean and defined', value: 'fat' },
      { emoji: '👔', label: 'Look good in clothes', sub: 'Fit better, feel confident', value: 'aesthetic' },
      { emoji: '⚡', label: 'More energy', sub: 'Fix the daily drag', value: 'energy' },
      { emoji: '🧬', label: 'Optimize naturally', sub: 'Hormones & health, no gear', value: 'natural' },
    ],
  },
  {
    type: 'proof',
    stat: '💪',
    headline: 'Hundreds of guys have built their dream physique — naturally',
    body: 'Men with careers, families, and zero interest in peptides discovered the system that finally got them lean, strong, and proud of how they look.',
    quote: '“No gear, no shortcuts. People stop me constantly asking how I did it.”',
    cite: '— Anthony, +12 lbs of muscle in 4 months',
    stats: [
      { n: '100%', l: 'Natural' },
      { n: '300+', l: 'Workouts' },
      { n: '1:1', l: 'With Jaden' },
    ],
  },
  {
    type: 'single',
    key: 'situation',
    q: 'What best describes your current situation?',
    why: 'Pick the one that resonates most.',
    opts: [
      { emoji: '🏋️', label: "I train but I'm spinning my wheels", value: 'stuck' },
      { emoji: '📱', label: 'I follow random programs off Instagram', value: 'random' },
      { emoji: '🍴', label: 'My nutrition is all over the place', value: 'nutrition' },
      { emoji: '🤷', label: "I've tried everything and nothing sticks", value: 'tried-everything' },
      { emoji: '😔', label: 'Not sure where to even start', value: 'lost' },
    ],
  },
  {
    type: 'single',
    key: 'frequency',
    q: 'How often can you realistically train?',
    why: 'The Peak Aesthetic Split is built to work around a real schedule.',
    opts: [
      { emoji: '🪑', label: '1–2 days', sub: 'Very time-poor right now', value: '1-2' },
      { emoji: '🚶', label: '3–4 days', sub: 'A few focused sessions', value: '3-4' },
      { emoji: '🏃', label: '5–6 days', sub: 'I can commit most days', value: '5-6' },
      { emoji: '🔥', label: 'Whatever it takes', sub: 'All in', value: 'max' },
    ],
  },
  {
    type: 'single',
    key: 'natural',
    q: 'How do you feel about peptides & enhancement?',
    why: "Jaden's entire system is 100% natural. We want clients aligned with that.",
    opts: [
      { emoji: '🌱', label: '100% natural, all the way', value: 'natural' },
      { emoji: '🤔', label: 'Natural for now, curious about the rest', value: 'curious' },
      { emoji: '💊', label: 'Already enhanced / not a priority', value: 'enhanced' },
    ],
  },
  {
    type: 'single',
    key: 'commit',
    q: 'How ready are you to commit to a proven plan?',
    why: "Be honest — there's no judgment here.",
    opts: [
      { emoji: '🔥', label: "I'm ready NOW — I need this to work", value: 'now' },
      { emoji: '✅', label: 'Ready within the next week or two', value: 'soon' },
      { emoji: '🤔', label: 'Exploring — want to learn more first', value: 'exploring' },
      { emoji: '😊', label: 'Skeptical but willing to hear you out', value: 'skeptical' },
    ],
  },
  { type: 'analyzing' },
  { type: 'email' },
]

/* ---------- country dial codes ---------- */
const COUNTRIES = [
  { c: 'US', d: '+1', f: '🇺🇸' },
  { c: 'CA', d: '+1', f: '🇨🇦' },
  { c: 'GB', d: '+44', f: '🇬🇧' },
  { c: 'AU', d: '+61', f: '🇦🇺' },
  { c: 'IE', d: '+353', f: '🇮🇪' },
  { c: 'NZ', d: '+64', f: '🇳🇿' },
  { c: 'DE', d: '+49', f: '🇩🇪' },
  { c: 'FR', d: '+33', f: '🇫🇷' },
  { c: 'ES', d: '+34', f: '🇪🇸' },
  { c: 'IT', d: '+39', f: '🇮🇹' },
  { c: 'NL', d: '+31', f: '🇳🇱' },
  { c: 'SE', d: '+46', f: '🇸🇪' },
  { c: 'NO', d: '+47', f: '🇳🇴' },
  { c: 'DK', d: '+45', f: '🇩🇰' },
  { c: 'CH', d: '+41', f: '🇨🇭' },
  { c: 'AE', d: '+971', f: '🇦🇪' },
  { c: 'SG', d: '+65', f: '🇸🇬' },
  { c: 'ZA', d: '+27', f: '🇿🇦' },
  { c: 'MX', d: '+52', f: '🇲🇽' },
  { c: 'BR', d: '+55', f: '🇧🇷' },
  { c: 'IN', d: '+91', f: '🇮🇳' },
]

/* ---------- progress count (only the answerable + email screens) ---------- */
const STEP_TYPES = new Set(['intro', 'single', 'multi', 'email'])

export function QuizFlow() {
  const router = useRouter()
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [multi, setMulti] = useState<string[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dialCode, setDialCode] = useState('+1')
  const leadValid = name.trim().length > 1 && email.includes('@') && phone.replace(/\D/g, '').length >= 7

  const screen = SCREENS[i]
  const totalSteps = SCREENS.filter(s => STEP_TYPES.has(s.type)).length
  const stepNum = SCREENS.slice(0, i + 1).filter(s => STEP_TYPES.has(s.type)).length
  const pct = Math.round((stepNum / totalSteps) * 100)

  const next = () => setI(n => Math.min(n + 1, SCREENS.length - 1))
  const back = () => {
    logger.debug('quiz_back', { from: screen.type })
    setMulti([])
    setI(n => Math.max(n - 1, 0))
  }

  const pick = (key: string | undefined, value: string) => {
    if (key) setAnswers(a => ({ ...a, [key]: value }))
    logger.info('quiz_answer', { key: key ?? 'intro', value })
    setTimeout(next, 160)
  }

  const toggleMulti = (value: string) => setMulti(m => (m.includes(value) ? m.filter(v => v !== value) : [...m, value]))

  const submitMulti = (key: string) => {
    setAnswers(a => ({ ...a, [key]: multi.join(',') }))
    logger.info('quiz_answer', { key, value: multi.join(',') })
    setMulti([])
    next()
  }

  useEffect(() => {
    logger.info('quiz_start')
  }, [])

  // analyzing auto-advance
  useEffect(() => {
    if (screen.type === 'analyzing') {
      const t = setTimeout(next, 3200)
      return () => clearTimeout(t)
    }
  }, [i, screen.type])

  const [submitting, setSubmitting] = useState(false)

  const finish = async () => {
    if (submitting) return
    setSubmitting(true)
    logger.info('quiz_lead_submitted', { dialCode, answerKeys: Object.keys(answers) })

    const fullPhone = `${dialCode} ${phone}`.trim()
    const [firstName, ...rest] = name.trim().split(/\s+/)
    const lastName = rest.join(' ')
    const utms = getUtmParams()
    const urlParams = typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search)) : {}

    // Lead capture → analytics + Pipedream + Supabase (designed never to throw);
    // guard anyway so an unexpected failure never strands the user mid-funnel.
    try {
      await submitLead({
        url: typeof window !== 'undefined' ? window.location.href : '',
        email,
        name,
        firstName,
        lastName: lastName || undefined,
        phone: fullPhone,
        formData: { ...answers },
        utms,
        urlParams,
      })
    } catch (err) {
      logger.error('quiz_lead_submit_failed', { message: err instanceof Error ? err.message : 'unknown' })
    }

    const params = new URLSearchParams({ ...answers, name, email, phone: fullPhone }).toString()
    router.push(`/results?${params}`)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* header + progress */}
      <header style={{ borderBottom: '1px solid var(--rule)' }}>
        <div className='am-wrap' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px', position: 'relative' }}>
          <span className='am-eyebrow' style={{ color: 'var(--ink-deep)' }}>
            Aesthetic Mastery
          </span>
        </div>
        {screen.type !== 'intro' && (
          <div style={{ height: 4, background: 'var(--rule)' }}>
            <div style={{ height: '100%', width: `${Math.max(pct, 8)}%`, background: 'var(--accent)', transition: 'width .35s ease' }} />
          </div>
        )}
      </header>

      <section
        style={{
          flex: 1,
          display: 'flex',
          alignItems: screen.type === 'analyzing' ? 'center' : 'flex-start',
          justifyContent: 'center',
          padding: '40px 0 64px',
        }}
      >
        <div className='am-wrap am-fade' key={i} style={{ maxWidth: 600, width: '100%' }}>
          {/* INTRO */}
          {screen.type === 'intro' && (
            <div style={{ textAlign: 'center' }}>
              <p className='am-eyebrow' style={{ marginBottom: 14 }}>
                Get your personalized
              </p>
              <h1 className='am-h1' style={{ fontSize: 40, margin: '0 0 12px' }}>
                Natural <em className='am-italic'>Physique</em> Plan
              </h1>
              <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.6, maxWidth: 460, margin: '0 auto 22px' }}>
                The exact training, nutrition, and recovery to build a peak aesthetic physique — the natural way.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 22, flexWrap: 'wrap', marginBottom: 34, fontSize: 13, color: 'var(--ink-soft)' }}>
                <span>🎯 Personalized to you</span>
                <span>⏱️ Takes 60 seconds</span>
                <span>📊 Detailed plan</span>
              </div>
              <p className='am-serif' style={{ fontSize: 20, fontWeight: 500, color: 'var(--ink-deep)', marginBottom: 18 }}>
                {screen.q}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', maxWidth: 460, margin: '0 auto' }}>
                {screen.opts.map(o => (
                  <OptCard key={o.value} o={o} onClick={() => pick(undefined, o.value)} />
                ))}
              </div>
              <p style={{ marginTop: 30, fontSize: 13, color: 'var(--ink-mute)' }}>🔥 Built on Jaden Levin&apos;s natural method</p>
            </div>
          )}

          {/* SINGLE */}
          {screen.type === 'single' && (
            <div>
              <h2 className='am-h2' style={{ fontSize: 30, margin: '0 0 10px' }}>
                {screen.q}
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.55, margin: '0 0 28px' }}>{screen.why}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {screen.opts.map(o => (
                  <OptCard key={o.value} o={o} selected={answers[screen.key] === o.value} onClick={() => pick(screen.key, o.value)} />
                ))}
              </div>
              <BackBtn onClick={back} />
            </div>
          )}

          {/* MULTI */}
          {screen.type === 'multi' && (
            <div>
              <h2 className='am-h2' style={{ fontSize: 30, margin: '0 0 10px' }}>
                {screen.q}
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.55, margin: '0 0 28px' }}>{screen.why}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {screen.opts.map(o => (
                  <OptCard key={o.value} o={o} selected={multi.includes(o.value)} multi onClick={() => toggleMulti(o.value)} />
                ))}
              </div>
              <button
                disabled={multi.length === 0}
                onClick={() => submitMulti(screen.key)}
                className='am-btn'
                style={{ width: '100%', marginTop: 18, opacity: multi.length === 0 ? 0.4 : 1, cursor: multi.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                Continue &rarr;
              </button>
              <BackBtn onClick={back} />
            </div>
          )}

          {/* PROOF INTERSTITIAL */}
          {screen.type === 'proof' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 34, marginBottom: 14 }}>{screen.stat}</div>
              <h2 className='am-h2' style={{ fontSize: 28, margin: '0 0 14px' }}>
                {screen.headline}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 300, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 26px' }}>{screen.body}</p>
              <StatGrid items={screen.stats.map(s => ({ value: s.n, label: s.l }))} />
              <div
                style={{
                  border: '1px solid var(--rule)',
                  borderTop: '1px solid var(--ink)',
                  borderRadius: 10,
                  background: 'var(--paper)',
                  padding: '20px 22px',
                  maxWidth: 460,
                  margin: '0 auto 28px',
                }}
              >
                <p className='am-serif' style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--ink-deep)', lineHeight: 1.5, margin: '0 0 8px' }}>
                  {screen.quote}
                </p>
                <p style={{ fontSize: 13, color: 'var(--accent)', margin: 0 }}>{screen.cite}</p>
              </div>
              <button onClick={next} className='am-btn'>
                See what&apos;s possible for you &rarr;
              </button>
              <BackBtn onClick={back} />
            </div>
          )}

          {/* ANALYZING */}
          {screen.type === 'analyzing' && <Analyzing />}

          {/* EMAIL CAPTURE */}
          {screen.type === 'email' && (
            <div style={{ textAlign: 'center' }}>
              <p className='am-eyebrow' style={{ marginBottom: 14, color: 'var(--accent)' }}>
                Your plan is ready
              </p>
              <h2 className='am-h2' style={{ fontSize: 30, margin: '0 0 10px' }}>
                Where should we send your <em className='am-italic'>personalized plan</em>?
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', fontWeight: 300, margin: '0 0 26px' }}>
                Get instant access to your custom plan + training video.
              </p>

              {/* before/after proof cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 26 }}>
                {[
                  { name: 'Chris', stat: 'Reshaped his body in 3 months', poster: '/posters/t-chris.svg' },
                  { name: 'Kaleb', stat: 'Lost fat + gained muscle running his company', poster: '/posters/t-caleb.svg' },
                ].map(t => (
                  <div key={t.name} style={{ border: '1px solid var(--rule)', borderRadius: 10, overflow: 'hidden', background: 'var(--soft)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.poster} alt='' style={{ width: '100%', display: 'block', aspectRatio: '3/4', objectFit: 'cover' }} />
                    <div style={{ padding: '10px 12px', textAlign: 'left' }}>
                      <p className='am-serif' style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-deep)', margin: 0 }}>
                        {t.name}
                      </p>
                      <p style={{ fontSize: 11.5, color: 'var(--accent)', margin: '2px 0 0' }}>{t.stat}</p>
                    </div>
                  </div>
                ))}
              </div>

              {(() => {
                const fieldStyle = {
                  width: '100%',
                  boxSizing: 'border-box' as const,
                  padding: '15px 16px',
                  fontSize: 15,
                  fontFamily: 'var(--sans)',
                  border: '1px solid var(--rule-strong)',
                  borderRadius: 8,
                  marginBottom: 12,
                  color: 'var(--ink-deep)',
                  outlineColor: 'var(--accent)',
                }
                return (
                  <>
                    <input type='text' value={name} onChange={e => setName(e.target.value)} placeholder='Your name' autoComplete='name' style={fieldStyle} />
                    <input
                      type='email'
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder='Your best email address'
                      autoComplete='email'
                      style={fieldStyle}
                    />
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <select
                        value={dialCode}
                        onChange={e => setDialCode(e.target.value)}
                        style={{
                          flexShrink: 0,
                          padding: '15px 10px',
                          fontSize: 15,
                          fontFamily: 'var(--sans)',
                          border: '1px solid var(--rule-strong)',
                          borderRadius: 8,
                          color: 'var(--ink-deep)',
                          background: 'var(--bg)',
                          cursor: 'pointer',
                          outlineColor: 'var(--accent)',
                        }}
                      >
                        {COUNTRIES.map((c, idx) => (
                          <option key={`${c.c}-${idx}`} value={c.d}>
                            {c.f} {c.c} {c.d}
                          </option>
                        ))}
                      </select>
                      <input
                        type='tel'
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder='Your phone number'
                        autoComplete='tel'
                        style={{ ...fieldStyle, marginBottom: 0, flex: 1 }}
                      />
                    </div>
                  </>
                )
              })()}
              <button
                onClick={finish}
                disabled={!leadValid || submitting}
                className='am-btn'
                style={{ width: '100%', opacity: leadValid && !submitting ? 1 : 0.4, cursor: leadValid && !submitting ? 'pointer' : 'not-allowed' }}
              >
                {submitting ? 'Building your plan…' : 'Get My Free Plan →'}
              </button>
              <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 12 }}>🔒 We respect your privacy. Unsubscribe anytime.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

/* ---------- shared bits ---------- */
function OptCard({ o, selected, multi, onClick }: { o: Opt; selected?: boolean; multi?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        textAlign: 'left',
        padding: '16px 18px',
        cursor: 'pointer',
        borderRadius: 10,
        background: selected ? 'var(--accent-soft)' : 'var(--bg)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--rule)'}`,
        fontFamily: 'var(--sans)',
        transition: 'border-color .15s, background .15s',
      }}
      onMouseEnter={e => {
        if (!selected) e.currentTarget.style.borderColor = 'var(--rule-strong)'
      }}
      onMouseLeave={e => {
        if (!selected) e.currentTarget.style.borderColor = 'var(--rule)'
      }}
    >
      {o.emoji && <span style={{ fontSize: 22, flexShrink: 0 }}>{o.emoji}</span>}
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 15.5, fontWeight: 500, color: 'var(--ink-deep)' }}>{o.label}</span>
        {o.sub && <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-mute)', fontWeight: 300, marginTop: 2 }}>{o.sub}</span>}
      </span>
      <span
        style={{
          flexShrink: 0,
          width: 22,
          height: 22,
          borderRadius: multi ? 5 : '50%',
          border: `2px solid ${selected ? 'var(--accent)' : 'var(--rule-strong)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && (multi ? <CheckIcon size={12} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />)}
      </span>
    </button>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ marginTop: 24, background: 'none', border: 0, color: 'var(--ink-mute)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--sans)' }}
    >
      &larr; Back
    </button>
  )
}

function Analyzing() {
  const items = [
    'Analyzing your current approach and goals…',
    'Identifying your biggest physique bottleneck…',
    'Customizing your transformation roadmap…',
    'Preparing your personalized training…',
  ]
  const [done, setDone] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setDone(d => Math.min(d + 1, items.length)), 750)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ textAlign: 'center', maxWidth: 440, margin: '0 auto' }}>
      <div
        style={{
          width: 44,
          height: 44,
          border: '3px solid var(--rule)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          margin: '0 auto 22px',
          animation: 'amSpin 0.9s linear infinite',
        }}
      />
      <h2 className='am-h2' style={{ fontSize: 24, margin: '0 0 24px' }}>
        Analyzing your physique profile…
      </h2>
      <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: idx < done ? 1 : 0.4, transition: 'opacity .3s' }}>
            <span
              style={{
                flexShrink: 0,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: idx < done ? 'var(--accent)' : 'transparent',
                border: idx < done ? '0' : '2px solid var(--rule-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {idx < done && <CheckIcon size={11} color='#fff' />}
            </span>
            <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{it}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
