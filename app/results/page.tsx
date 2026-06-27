"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/* =========================================================================
   DYNAMIC RESULTS — scores the 4 pillars from quiz answers (WB-style)
   Reads params: goal, age, goals (csv), situation, frequency, natural, commit, name
   ========================================================================= */

type Pillar = {
  key: string;
  secret: string;
  title: string;
  desc: (ctx: Ctx) => string;
  score: (ctx: Ctx) => number;
};
type Ctx = {
  goal: string; age: string; goals: string[]; situation: string;
  frequency: string; natural: string; commit: string;
};

function clamp(n: number) { return Math.max(34, Math.min(97, Math.round(n))); }

const PILLARS: Pillar[] = [
  {
    key: "nutrition",
    secret: "Pillar 1",
    title: "The Macro Calibration System",
    desc: (c) =>
      c.situation === "nutrition"
        ? "Your nutrition is the #1 thing holding your physique back. Dialing in your maintenance, calorie, and protein targets changes everything fast."
        : "Most guys never learn their real numbers. Getting maintenance, calories, and protein right is what makes the body actually change.",
    score: (c) => {
      let s = 58;
      if (c.situation === "nutrition") s += 30;
      if (c.goals.includes("fat")) s += 14;
      if (c.goal === "overweight") s += 12;
      if (c.goal === "skinnyfat") s += 8;
      return clamp(s);
    },
  },
  {
    key: "training",
    secret: "Pillar 2",
    title: "The Controlled Intensity Method",
    desc: (c) =>
      c.situation === "stuck"
        ? "You're training hard but spinning your wheels. Real mind-to-muscle connection and controlled form is the unlock you've been missing."
        : "Ego lifting builds nothing. Mastering form and tempo is what separates guys who look like they lift from guys who just train.",
    score: (c) => {
      let s = 55;
      if (c.situation === "stuck") s += 28;
      if (c.situation === "random") s += 20;
      if (c.goals.includes("muscle")) s += 14;
      if (c.frequency === "5-6" || c.frequency === "max") s += 8;
      return clamp(s);
    },
  },
  {
    key: "recovery",
    secret: "Pillar 3",
    title: "The Winning Weeks Framework",
    desc: (c) =>
      c.frequency === "1-2"
        ? "Your schedule is tight, so consistency is everything. The adaptive framework wins by averaging good weeks, not chasing perfect ones."
        : "Consistency beats intensity. The adaptive system flexes around travel, work, and life so you never fully fall off.",
    score: (c) => {
      let s = 48;
      if (c.frequency === "1-2") s += 30;
      if (c.frequency === "3-4") s += 14;
      if (c.situation === "tried-everything") s += 16;
      if (c.goals.includes("energy")) s += 10;
      return clamp(s);
    },
  },
  {
    key: "coaching",
    secret: "Pillar 4",
    title: "The 1:1 Accountability Accelerator",
    desc: (c) =>
      c.commit === "now"
        ? "You're ready now, and that's exactly when 1:1 coaching compounds fastest. Direct form review and accountability is the ultimate edge."
        : "Information isn't the problem. Personalized coaching, form review, and real accountability is what turns knowledge into a physique.",
    score: (c) => {
      let s = 60;
      if (c.commit === "now") s += 30;
      if (c.commit === "soon") s += 20;
      if (c.situation === "tried-everything") s += 14;
      if (c.situation === "lost") s += 12;
      if (c.natural === "natural") s += 6;
      return clamp(s);
    },
  },
];

function band(score: number) {
  if (score >= 85) return { label: "CRITICAL PRIORITY", color: "#0086a8" };
  if (score >= 70) return { label: "NEEDS ATTENTION", color: "#1f9e7a" };
  if (score >= 55) return { label: "WORTH ADDRESSING", color: "#caa53d" };
  return { label: "BENEFICIAL", color: "#7a8893" };
}

function ResultsInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const name = sp.get("name") || "";
  const firstName = name.split(" ")[0];

  const ctx: Ctx = useMemo(() => ({
    goal: sp.get("goal") || "",
    age: sp.get("age") || "",
    goals: (sp.get("goals") || "").split(",").filter(Boolean),
    situation: sp.get("situation") || "",
    frequency: sp.get("frequency") || "",
    natural: sp.get("natural") || "",
    commit: sp.get("commit") || "",
  }), [sp]);

  const scored = useMemo(
    () => PILLARS.map((p) => ({ ...p, value: p.score(ctx), copy: p.desc(ctx) })).sort((a, b) => b.value - a.value),
    [ctx]
  );
  const top = scored[0];
  const overall = Math.round(scored.reduce((s, p) => s + p.value, 0) / scored.length);

  // animated overall ring
  const [ring, setRing] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1100, 1);
      setRing(Math.round(overall * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [overall]);

  // countdown
  const [secs, setSecs] = useState(7 * 60);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  const toVsl = () => router.push(`/vsl?${sp.toString()}`);

  const C = 2 * Math.PI * 52;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header className="am-wrap" style={{ textAlign: "center", padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}>
        <span className="am-eyebrow" style={{ color: "var(--ink-deep)" }}>Aesthetic Mastery</span>
      </header>

      <div className="am-wrap" style={{ maxWidth: 720, paddingBottom: 80 }}>

        {/* ===== TOP GRAPHIC: overall score ring ===== */}
        <section style={{ textAlign: "center", padding: "44px 0 8px" }}>
          <p className="am-eyebrow" style={{ color: "var(--accent)", marginBottom: 18 }}>Your assessment is ready</p>
          <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto 10px" }}>
            <svg width="180" height="180" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--rule)" strokeWidth="9" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" strokeWidth="9" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C - (C * ring) / 100} style={{ transition: "stroke-dashoffset .1s linear" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--sans)", fontWeight: 900, fontSize: 46, color: "var(--ink-deep)", lineHeight: 1, letterSpacing: "-0.03em" }}>{ring}</span>
              <span className="am-eyebrow" style={{ fontSize: 9, marginTop: 2 }}>out of 100</span>
            </div>
          </div>
          <h1 className="am-h1" style={{ fontSize: 30, margin: "8px 0 10px" }}>
            {firstName ? `${firstName}, here's your ` : "Here's your "}<span className="am-accent">physique blueprint</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", fontWeight: 400, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
            We analyzed your answers and scored the 4 pillars that decide whether your body actually changes. Your biggest opportunity right now is <strong style={{ color: "var(--ink-deep)" }}>{top.title}</strong>.
          </p>
        </section>

        {/* ===== "what's possible" bullets ===== */}
        <section style={{ padding: "28px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", maxWidth: 540, margin: "0 auto" }}>
            {["Build visible, lasting muscle", "Get lean without misery", "Look like you actually lift", "Train smarter, not all day", "100% natural, no shortcuts", "Energy that lasts all day"].map((b) => (
              <div key={b} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>{b}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SCORED PILLAR CARDS ===== */}
        <section style={{ padding: "16px 0" }}>
          <p className="am-eyebrow" style={{ textAlign: "center", marginBottom: 22 }}>Your priority scores</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {scored.map((p, idx) => {
              const b = band(p.value);
              return (
                <div key={p.key} style={{ display: "flex", gap: 18, alignItems: "flex-start", background: "var(--bg)", border: "1px solid var(--rule)", borderTop: `3px solid ${b.color}`, borderRadius: 10, padding: "20px 22px" }}>
                  <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: "50%", background: b.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, fontFamily: "var(--sans)" }}>{p.value}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: b.color }}>{p.secret} · {b.label}</p>
                    <h3 style={{ margin: "3px 0 6px", fontSize: 17, fontWeight: 800, color: "var(--ink-deep)", letterSpacing: "-0.01em" }}>{p.title}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55 }}>{p.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== SUMMARY ===== */}
        <section style={{ padding: "28px 0" }}>
          <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: 12, padding: "26px 28px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 800, color: "var(--ink-deep)" }}>Your assessment summary</h2>
            <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.65 }}>
              You scored <strong style={{ color: "var(--accent)" }}>{top.value}/100</strong> on {top.title} — that&apos;s your highest-leverage fix right now. The good news? Every one of these is 100% fixable, naturally, with the exact system Jaden walks you through next. No peptides. No shortcuts.
            </p>
          </div>
        </section>

        {/* ===== TIMER + CTA ===== */}
        <section style={{ textAlign: "center", padding: "12px 0 0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>Your personalized training expires in</span>
            <span style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: 16, color: "var(--accent)" }}>{mm}:{ss}</span>
          </div>
          <button onClick={toVsl} className="am-btn" style={{ width: "100%", maxWidth: 460, fontSize: 14, padding: "18px 28px" }}>
            Watch My Personalized Training Now &rarr;
          </button>
          <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 12 }}>Tailored to your age, situation, and goals. Free to watch.</p>
        </section>
      </div>

      <footer style={{ background: "var(--ink)", padding: "36px 0 30px" }}>
        <div className="am-wrap" style={{ textAlign: "center" }}>
          <p className="am-eyebrow" style={{ color: "var(--on-dark)", marginBottom: 8 }}>Aesthetic Mastery</p>
          <p style={{ fontSize: 11.5, color: "var(--on-dark-soft)", margin: 0 }}>&copy; {new Date().getFullYear()} Jaden Levin. Results vary. Not medical advice.</p>
        </div>
      </footer>
    </main>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#fff" }} />}><ResultsInner /></Suspense>;
}
