"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

/* =========================================================================
   DATA
   ========================================================================= */
const PRECALL = { youtubeId: "", poster: "/posters/precall.svg" };

const BREAKOUTS = [
  { n: "01", title: "Why natural beats enhanced", sub: "The real cost of peptides and gear, and why a natural physique lasts longer and looks better.", length: "6 min", youtubeId: "", poster: "/posters/breakout-01.svg" },
  { n: "02", title: "The system for a busy schedule", sub: "Nutrition calibration and the Peak Aesthetic Split, built around a real life. No living in the gym.", length: "8 min", youtubeId: "", poster: "/posters/breakout-02.svg" },
  { n: "03", title: "What working with Jaden looks like", sub: "Form-review breakdowns, the app, check-ins, and the exact path to your dream physique.", length: "7 min", youtubeId: "", poster: "/posters/breakout-03.svg" },
];

const TESTIMONIALS = [
  { name: "Anthony", age: "", headline: "+12 lbs muscle in 4 months", youtubeId: "", poster: "/posters/t-chris.svg" },
  { name: "Joshua", age: "", headline: "Dropped 40 lbs, kept it off", youtubeId: "", poster: "/posters/t-john.svg" },
  { name: "Kaleb", age: "", headline: "Leaner + bigger running his company", youtubeId: "", poster: "/posters/t-caleb.svg" },
  { name: "Jon", age: "38", headline: "Dialed in around a packed schedule", youtubeId: "", poster: "/posters/t-anthony.svg" },
];

const CHECKLIST = [
  "Add the call to your calendar using Step 1 above.",
  "Reply \u201CYES\u201D to our confirmation text so we know you\u2019re locked in.",
  "Show up somewhere quiet, on a laptop or with headphones.",
  "Watch the three breakdowns below so your call goes straight to your plan.",
];

/* =========================================================================
   STEP GRAPHICS — little on-brand mockups
   ========================================================================= */
function CalendarGraphic({ when }: { when: { day: string; time: string } | null }) {
  return (
    <div style={{ border: "1px solid var(--rule)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
      <div style={{ background: "var(--accent)", color: "#fff", textAlign: "center", padding: "8px 0" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>{when?.day?.slice(0, 3) || "Call"}</div>
        <div style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 22, lineHeight: 1 }}>{when?.time?.replace(/[^0-9]/g, "") ? when.time : "8:00"}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, padding: 8 }}>
        {Array.from({ length: 21 }).map((_, i) => (
          <div key={i} style={{ aspectRatio: "1", borderRadius: 2, background: i === 11 ? "var(--accent)" : "var(--accent-soft)" }} />
        ))}
      </div>
    </div>
  );
}

function MessageGraphic({ firstName }: { firstName: string }) {
  return (
    <div style={{ border: "1px solid var(--rule)", borderRadius: 8, background: "var(--paper)", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ alignSelf: "flex-start", maxWidth: "85%", background: "#fff", border: "1px solid var(--rule)", borderRadius: "12px 12px 12px 3px", padding: "7px 11px" }}>
        <p style={{ margin: 0, fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.4 }}>Hey{firstName ? ` ${firstName}` : ""}! Your call is confirmed. Reply YES to lock it in.</p>
      </div>
      <div style={{ alignSelf: "flex-end", background: "var(--accent)", borderRadius: "12px 12px 3px 12px", padding: "7px 14px" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#fff", fontWeight: 600 }}>YES</p>
      </div>
    </div>
  );
}

function VideoGraphic() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {[68, 100, 84].map((w, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--rule)", borderRadius: 6, padding: "6px 8px", background: i === 0 ? "var(--accent-soft)" : "#fff" }}>
          <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "var(--accent)" : "var(--rule-strong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span style={{ height: 5, borderRadius: 3, background: "var(--rule)", width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   VIDEO
   ========================================================================= */
function Video({ poster, youtubeId, ratio = "16/9" }: { poster: string; youtubeId?: string; ratio?: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div
      onClick={() => youtubeId && setPlaying(true)}
      className="vid"
      style={{ aspectRatio: ratio, cursor: youtubeId ? "pointer" : "default" }}
    >
      {playing && youtubeId ? (
        <iframe style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`} allow="autoplay; encrypted-media" allowFullScreen />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="vid-play"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></div>
        </>
      )}
    </div>
  );
}

/* =========================================================================
   PAGE
   ========================================================================= */
function Content() {
  const sp = useSearchParams();
  const firstName = sp.get("invitee_first_name") || sp.get("name") || "";
  const callTime = sp.get("time") || "";
  const callDate = sp.get("date") || "";

  // Dynamic day + time, auto-localized to the viewer's timezone.
  // Calendly passes an ISO timestamp as event_start_time (fallback: ?start= / ?iso=).
  const isoStart = sp.get("event_start_time") || sp.get("start") || sp.get("iso") || "";
  const [when, setWhen] = useState<{ day: string; time: string } | null>(null);
  useEffect(() => {
    if (!isoStart) return;
    const d = new Date(isoStart);
    if (isNaN(d.getTime())) return;
    setWhen({
      day: d.toLocaleDateString(undefined, { weekday: "long" }),
      time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toLowerCase().replace(" ", ""),
    });
  }, [isoStart]);

  const [sticky, setSticky] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSticky(true), 3500); return () => clearTimeout(t); }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Caveat:wght@500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
        :root {
          --bg: #ffffff; --soft: #f4f7f9; --paper: #f9fbfc;
          --ink: #0c1418; --ink-deep: #15232b; --ink-soft: #4a5b65; --ink-mute: #788893;
          --rule: rgba(13,40,52,0.12); --rule-strong: rgba(13,40,52,0.26);
          --accent: #0086a8;            /* deep teal-cyan = matches AM logo, readable on white */
          --accent-bright: #00b4d8;
          --accent-soft: #e6f4f8;
          --on-dark: #eef6f9; --on-dark-soft: #b6c7cf;
          --serif: 'Inter', system-ui, sans-serif;
          --sans: 'Inter', system-ui, sans-serif;
          --script: 'Caveat', cursive;
          --mono: 'JetBrains Mono', monospace;
        }
        body { margin: 0; background: var(--bg); color: var(--ink-deep); font-family: var(--sans); }
        body::before { content:''; position:fixed; inset:0; pointer-events:none; z-index:0; mix-blend-mode:multiply; opacity:0.5;
          background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.03 0'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>"); }
        .wrap { max-width: 940px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 2; }
        .eyebrow { font-family: var(--sans); font-weight: 500; font-size: 11px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--ink-mute); }
        h1,h2,h3 { font-family: var(--serif); }
        .vid { position: relative; width: 100%; overflow: hidden; border-radius: 6px; border: 1px solid var(--rule); background: var(--soft); }
        .vid-play { position:absolute; inset:0; margin:auto; width:60px; height:60px; border-radius:50%; background:rgba(255,255,255,0.92); border:1px solid var(--rule-strong); display:flex; align-items:center; justify-content:center; color:var(--ink); transition: transform .25s; }
        .vid:hover .vid-play { transform: scale(1.08); }
        @keyframes barUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        .bounce { animation: bounce 1.5s ease-in-out infinite; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
        {/* header */}
        <header className="wrap" style={{ borderBottom: "1px solid var(--rule)", padding: "20px 24px", maxWidth: 940 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="eyebrow" style={{ color: "var(--ink-deep)" }}>Aesthetic Mastery</span>
            <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13, color: "var(--ink-mute)" }}>Jaden Levin</span>
          </div>
        </header>

        {/* WAIT */}
        <section style={{ padding: "56px 0 8px", textAlign: "center" }}>
          <div className="wrap">
            <p style={{ fontFamily: "var(--sans)", fontWeight: 900, fontSize: 52, color: "var(--accent)", lineHeight: 1, margin: "0 0 16px", letterSpacing: "-0.02em" }}>WAIT!</p>
            <h1 style={{ fontWeight: 800, fontSize: 34, lineHeight: 1.15, color: "var(--ink-deep)", margin: "0 0 14px", letterSpacing: "-0.02em" }}>
              {firstName ? `${firstName}, watch ` : "Watch "}this short video below so your call{" "}
              {when ? (
                <>on <em style={{ color: "var(--accent)", fontStyle: "italic" }}>{when.day} at {when.time}</em>{" "}</>
              ) : callDate ? (
                <>on <em style={{ color: "var(--accent)", fontStyle: "italic" }}>{callDate}{callTime && ` at ${callTime}`}</em>{" "}</>
              ) : null}
              doesn&apos;t get <em style={{ color: "var(--accent)", fontStyle: "italic" }}>cancelled</em>
            </h1>
          </div>
        </section>

        {/* PRE-CALL VSL */}
        <section style={{ padding: "24px 0 56px" }}>
          <div className="wrap" style={{ maxWidth: 680 }}>
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <p className="bounce" style={{ fontFamily: "var(--script)", fontSize: 30, color: "var(--accent)", margin: 0 }}>Watch this!</p>
            </div>
            <Video poster={PRECALL.poster} youtubeId={PRECALL.youtubeId} />
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-mute)", marginTop: 14 }}>Add the call to your calendar and reply &quot;YES&quot; to confirm.</p>
          </div>
        </section>

        {/* 3 STEPS */}
        <section style={{ padding: "56px 0", borderTop: "1px solid var(--rule)", background: "var(--paper)" }}>
          <div className="wrap">
            <p className="eyebrow" style={{ marginBottom: 12 }}>Before your call</p>
            <h2 style={{ fontWeight: 500, fontSize: 30, color: "var(--ink-deep)", margin: "0 0 32px", letterSpacing: "-0.01em" }}>Do these <em style={{ fontStyle: "italic", color: "var(--accent)" }}>three things.</em></h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {[
                { n: "1", t: "Add to Calendar", d: "Lock the time in so life doesn\u2019t get in the way.", btn: true, graphic: <CalendarGraphic when={when} /> },
                { n: "2", t: "Reply YES to our text", d: "We\u2019ll text within 10 minutes. Reply YES to hold your spot.", graphic: <MessageGraphic firstName={firstName} /> },
                { n: "3", t: "Watch the videos below", d: "Three breakdowns plus client stories. Come in with context.", graphic: <VideoGraphic /> },
              ].map((s) => (
                <div key={s.n} style={{ background: "var(--bg)", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--rule)", padding: "26px 22px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", fontSize: 12, fontFamily: "var(--mono)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.n}</span>
                    <span style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 17, color: "var(--ink-deep)" }}>{s.t}</span>
                  </div>
                  <p style={{ fontWeight: 300, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 16px" }}>{s.d}</p>
                  <div style={{ marginTop: "auto", marginBottom: s.btn ? 16 : 0 }}>{s.graphic}</div>
                  {s.btn && <button style={{ width: "100%", padding: "11px", background: "var(--accent)", color: "#fff", border: 0, borderRadius: 6, fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13, letterSpacing: "0.02em", cursor: "pointer" }}>Add to Calendar</button>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WATCH BEFORE WE TALK (2-col) */}
        <section style={{ padding: "64px 0" }}>
          <div className="wrap">
            <p className="eyebrow" style={{ color: "var(--accent)", marginBottom: 12 }}>\u2713 Your call is booked</p>
            <h2 style={{ fontWeight: 500, fontSize: 30, color: "var(--ink-deep)", margin: "0 0 32px", letterSpacing: "-0.01em" }}>Watch this <em style={{ fontStyle: "italic", color: "var(--accent)" }}>before we talk</em></h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44, alignItems: "center" }}>
              <Video poster={PRECALL.poster} youtubeId={PRECALL.youtubeId} />
              <div>
                <p style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 16, color: "var(--ink-deep)", marginBottom: 16 }}>What to do before we talk:</p>
                {CHECKLIST.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", fontSize: 11, fontFamily: "var(--mono)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</span>
                    <span style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 300, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3 BREAKOUTS */}
        <section style={{ padding: "64px 0", borderTop: "1px solid var(--rule)", background: "var(--paper)" }}>
          <div className="wrap">
            <p className="eyebrow" style={{ marginBottom: 12 }}>Watch in order · 20 minutes total</p>
            <h2 style={{ fontWeight: 500, fontSize: 30, color: "var(--ink-deep)", margin: "0 0 36px", letterSpacing: "-0.01em" }}>The three breakdowns to watch <em style={{ fontStyle: "italic", color: "var(--accent)" }}>before we talk</em></h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
              {BREAKOUTS.map((b) => (
                <div key={b.n}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em" }}>VIDEO {b.n}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>{b.length}</span>
                  </div>
                  <h3 style={{ fontWeight: 500, fontSize: 18, color: "var(--ink-deep)", margin: "0 0 6px", lineHeight: 1.25 }}>{b.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 300, lineHeight: 1.55, margin: "0 0 14px" }}>{b.sub}</p>
                  <Video poster={b.poster} youtubeId={b.youtubeId} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding: "64px 0" }}>
          <div className="wrap">
            <p className="eyebrow" style={{ marginBottom: 12 }}>Real clients, real physiques</p>
            <h2 style={{ fontWeight: 500, fontSize: 30, color: "var(--ink-deep)", margin: "0 0 36px", letterSpacing: "-0.01em" }}>Hear it from the <em style={{ fontStyle: "italic", color: "var(--accent)" }}>guys who did it</em></h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
              {TESTIMONIALS.map((t) => (
                <div key={t.name}>
                  <Video poster={t.poster} youtubeId={t.youtubeId} ratio="3/4" />
                  <p style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 15, color: "var(--ink-deep)", margin: "12px 0 2px" }}>{t.name}{t.age && <span style={{ fontFamily: "var(--sans)", fontWeight: 300, fontSize: 12, color: "var(--ink-mute)" }}> · {t.age}</span>}</p>
                  <p style={{ fontSize: 12, color: "var(--accent)", margin: 0 }}>{t.headline}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section style={{ padding: "64px 0 80px", borderTop: "1px solid var(--rule)", background: "var(--soft)" }}>
          <div className="wrap" style={{ textAlign: "center", maxWidth: 720 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>Quick background</p>
            <h2 style={{ fontWeight: 500, fontSize: 28, color: "var(--ink-deep)", margin: "0 0 16px", letterSpacing: "-0.01em" }}>This call is a <em style={{ fontStyle: "italic", color: "var(--accent)" }}>conversation</em>, not a pitch</h2>
            <p style={{ fontSize: 15, color: "var(--ink-soft)", fontWeight: 300, lineHeight: 1.7, margin: "0 0 36px" }}>
              We&apos;ll look at where you&apos;re at, where you want your physique to go, and whether Aesthetic Mastery is the right fit. If it&apos;s not, we&apos;ll tell you. Either way you leave with a clear plan, built on a 100% natural approach.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {[{ num: "100%", label: "Natural Approach" }, { num: "300+", label: "Workout Library" }, { num: "1:1", label: "Coaching With Jaden" }].map((s) => (
                <div key={s.label} style={{ borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--rule)", background: "var(--bg)", padding: "22px 14px" }}>
                  <p style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, color: "var(--ink-deep)", margin: "0 0 6px" }}>{s.num}</p>
                  <p className="eyebrow" style={{ fontSize: 9 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer style={{ background: "var(--ink)", padding: "40px 0 32px" }}>
          <div className="wrap" style={{ textAlign: "center" }}>
            <p className="eyebrow" style={{ color: "var(--on-dark)", marginBottom: 8 }}>Aesthetic Mastery</p>
            <p style={{ fontSize: 12, color: "var(--on-dark-soft)", fontWeight: 300, margin: 0 }}>&copy; {new Date().getFullYear()} Jaden Levin. Individual results vary. Not medical advice.</p>
          </div>
        </footer>

        {sticky && (
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, animation: "barUp 0.4s ease-out" }}>
            <div style={{ maxWidth: 940, margin: "0 auto", background: "var(--ink)", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 13, color: "var(--on-dark-soft)", fontWeight: 300, margin: 0 }}>Watch the videos before your call.</p>
              <a href="#" style={{ padding: "9px 20px", background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 500, textDecoration: "none", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>Confirm My Call</a>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default function ThankYouPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#fff" }} />}><Content /></Suspense>;
}
