/* =========================================================================
   Pure scoring logic for the results page. No React, no "use client" —
   runs on the server so /results can render scores in its initial HTML.
   ========================================================================= */

import { firstParam, type SearchParams } from '@/lib/search-params'

export type Ctx = {
  goal: string
  age: string
  goals: string[]
  situation: string
  frequency: string
  natural: string
  commit: string
}

export type ScoredPillar = {
  key: string
  secret: string
  title: string
  value: number
  copy: string
}

type Pillar = {
  key: string
  secret: string
  title: string
  desc: (ctx: Ctx) => string
  score: (ctx: Ctx) => number
}

function clamp(n: number) {
  return Math.max(34, Math.min(97, Math.round(n)))
}

const PILLARS: Pillar[] = [
  {
    key: 'nutrition',
    secret: 'Pillar 1',
    title: 'The Macro Calibration System',
    desc: c =>
      c.situation === 'nutrition'
        ? 'Your nutrition is the #1 thing holding your physique back. Dialing in your maintenance, calorie, and protein targets changes everything fast.'
        : 'Most guys never learn their real numbers. Getting maintenance, calories, and protein right is what makes the body actually change.',
    score: c => {
      let s = 58
      if (c.situation === 'nutrition') s += 30
      if (c.goals.includes('fat')) s += 14
      if (c.goal === 'overweight') s += 12
      if (c.goal === 'skinnyfat') s += 8
      return clamp(s)
    },
  },
  {
    key: 'training',
    secret: 'Pillar 2',
    title: 'The Controlled Intensity Method',
    desc: c =>
      c.situation === 'stuck'
        ? "You're training hard but spinning your wheels. Real mind-to-muscle connection and controlled form is the unlock you've been missing."
        : 'Ego lifting builds nothing. Mastering form and tempo is what separates guys who look like they lift from guys who just train.',
    score: c => {
      let s = 55
      if (c.situation === 'stuck') s += 28
      if (c.situation === 'random') s += 20
      if (c.goals.includes('muscle')) s += 14
      if (c.frequency === '5-6' || c.frequency === 'max') s += 8
      return clamp(s)
    },
  },
  {
    key: 'recovery',
    secret: 'Pillar 3',
    title: 'The Winning Weeks Framework',
    desc: c =>
      c.frequency === '1-2'
        ? 'Your schedule is tight, so consistency is everything. The adaptive framework wins by averaging good weeks, not chasing perfect ones.'
        : 'Consistency beats intensity. The adaptive system flexes around travel, work, and life so you never fully fall off.',
    score: c => {
      let s = 48
      if (c.frequency === '1-2') s += 30
      if (c.frequency === '3-4') s += 14
      if (c.situation === 'tried-everything') s += 16
      if (c.goals.includes('energy')) s += 10
      return clamp(s)
    },
  },
  {
    key: 'coaching',
    secret: 'Pillar 4',
    title: 'The 1:1 Accountability Accelerator',
    desc: c =>
      c.commit === 'now'
        ? "You're ready now, and that's exactly when 1:1 coaching compounds fastest. Direct form review and accountability is the ultimate edge."
        : "Information isn't the problem. Personalized coaching, form review, and real accountability is what turns knowledge into a physique.",
    score: c => {
      let s = 60
      if (c.commit === 'now') s += 30
      if (c.commit === 'soon') s += 20
      if (c.situation === 'tried-everything') s += 14
      if (c.situation === 'lost') s += 12
      if (c.natural === 'natural') s += 6
      return clamp(s)
    },
  },
]

export function band(score: number) {
  if (score >= 85) return { label: 'CRITICAL PRIORITY', color: '#0086a8' }
  if (score >= 70) return { label: 'NEEDS ATTENTION', color: '#1f9e7a' }
  if (score >= 55) return { label: 'WORTH ADDRESSING', color: '#caa53d' }
  return { label: 'BENEFICIAL', color: '#7a8893' }
}

export function readCtx(sp: SearchParams): Ctx {
  return {
    goal: firstParam(sp.goal),
    age: firstParam(sp.age),
    goals: firstParam(sp.goals).split(',').filter(Boolean),
    situation: firstParam(sp.situation),
    frequency: firstParam(sp.frequency),
    natural: firstParam(sp.natural),
    commit: firstParam(sp.commit),
  }
}

export function scorePillars(ctx: Ctx): { scored: ScoredPillar[]; overall: number; top: ScoredPillar } {
  const scored = PILLARS.map(p => ({ key: p.key, secret: p.secret, title: p.title, value: p.score(ctx), copy: p.desc(ctx) })).sort((a, b) => b.value - a.value)
  const overall = Math.round(scored.reduce((s, p) => s + p.value, 0) / scored.length)
  return { scored, overall, top: scored[0] }
}
