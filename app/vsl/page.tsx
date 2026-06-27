"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const PRECALL_POSTER = "/posters/vsl.svg";

function VSLInner() {
  const sp = useSearchParams();
  const [paused, setPaused] = useState(false);
  const bookHref = `/book?${sp.toString()}`;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* urgency bar */}
      <div style={{ borderBottom: "1px solid var(--rule)", background: "var(--paper)" }}>
        <div className="am-wrap" style={{ textAlign: "center", padding: "10px 24px" }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 500 }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", marginRight: 8, verticalAlign: "middle" }} />
            Please watch the full video below. Do not close this window.
          </p>
        </div>
      </div>

      {/* logo only */}
      <header className="am-wrap" style={{ textAlign: "center", padding: "18px 24px" }}>
        <span className="am-eyebrow" style={{ color: "var(--ink-deep)" }}>Aesthetic Mastery</span>
      </header>

      {/* BARE VSL — just the video */}
      <section style={{ flex: 1, padding: "12px 0 56px" }}>
        <div className="am-wrap" style={{ maxWidth: 820 }}>
          <div className="am-vid" style={{ aspectRatio: "16/9", margin: "0 auto", cursor: "pointer" }} onClick={() => setPaused((p) => !p)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PRECALL_POSTER} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div className="am-vid-play"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></div>
            {paused && (
              <div className="am-fade" style={{ position: "absolute", inset: 0, background: "rgba(12,20,24,0.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 5 }}>
                <p style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Before you go…</p>
                <p style={{ color: "var(--on-dark-soft)", fontSize: 14, margin: "0 0 22px", textAlign: "center", maxWidth: 360 }}>Book your free body assessment call. If we&apos;re a fit, we&apos;ll show you how to start. If not, you walk with a free roadmap.</p>
                <Link href={bookHref} className="am-btn">Book My Free Call</Link>
              </div>
            )}
          </div>

          {/* single CTA appears below the video */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href={bookHref} className="am-btn" style={{ fontSize: 14, padding: "18px 44px" }}>Book My Free Body Assessment Call</Link>
            <p style={{ fontSize: 12.5, color: "var(--ink-mute)", marginTop: 14 }}>Takes 30 seconds · If we&apos;re a fit we&apos;ll map your plan · If not, free roadmap. Either way you win.</p>
          </div>
        </div>
      </section>

      <footer style={{ background: "var(--ink)", padding: "34px 0 28px" }}>
        <div className="am-wrap" style={{ textAlign: "center" }}>
          <p className="am-eyebrow" style={{ color: "var(--on-dark)", marginBottom: 10 }}>Aesthetic Mastery</p>
          <p style={{ fontSize: 11.5, color: "var(--on-dark-soft)", fontWeight: 400, lineHeight: 1.7, maxWidth: 640, margin: "0 auto" }}>
            Results vary. Testimonials are not a guarantee of results. Not medical advice. &copy; {new Date().getFullYear()} Jaden Levin
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function VSLPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#fff" }} />}><VSLInner /></Suspense>;
}
