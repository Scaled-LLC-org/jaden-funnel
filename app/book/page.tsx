"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const CALENDLY_URL = "https://calendly.com/your-jaden-link/strategy-call"; // TODO: real link

function BookContent() {
  const sp = useSearchParams();
  const goal = sp.get("goal") || "";

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* urgency */}
      <div style={{ borderBottom: "1px solid var(--rule)", background: "var(--paper)" }}>
        <div className="am-wrap" style={{ textAlign: "center", padding: "10px 24px" }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-soft)" }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", marginRight: 8, verticalAlign: "middle" }} />
            Limited strategy-call spots this week
          </p>
        </div>
      </div>

      <header className="am-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}>
        <span className="am-eyebrow" style={{ color: "var(--ink-deep)" }}>Aesthetic Mastery</span>
        <span className="am-serif" style={{ fontStyle: "italic", fontSize: 13, color: "var(--ink-mute)" }}>Jaden Levin</span>
      </header>

      <section style={{ padding: "48px 0 16px", textAlign: "center" }}>
        <div className="am-wrap" style={{ maxWidth: 680 }}>
          <p className="am-eyebrow" style={{ marginBottom: 14, color: "var(--accent)" }}>You&apos;re a fit &mdash; last step</p>
          <h1 className="am-h1" style={{ fontSize: 34, margin: "0 0 14px" }}>
            Book your <em className="am-italic">free strategy call</em>
          </h1>
          <p style={{ fontSize: 15.5, color: "var(--ink-soft)", fontWeight: 300, lineHeight: 1.6, maxWidth: 540, margin: "0 auto" }}>
            Pick a time below. We&apos;ll map out exactly how to build your{goal ? ` ${goal === "cut" ? "lean, defined" : goal === "build" ? "stronger" : "aesthetic"} ` : " "}
            physique naturally, on your schedule. No pressure, no hard sell.
          </p>
        </div>
      </section>

      {/* Calendly inline */}
      <section style={{ padding: "20px 0 64px" }}>
        <div className="am-wrap" style={{ maxWidth: 760 }}>
          <div className="calendly-inline-widget" data-url={CALENDLY_URL} style={{ minWidth: 320, height: 680, border: "1px solid var(--rule)", borderRadius: 10, overflow: "hidden", background: "var(--soft)" }} />
        </div>
      </section>

      <footer style={{ background: "var(--ink)", padding: "40px 0 32px" }}>
        <div className="am-wrap" style={{ textAlign: "center" }}>
          <p className="am-eyebrow" style={{ color: "var(--on-dark)", marginBottom: 10 }}>Aesthetic Mastery</p>
          <p style={{ fontSize: 11.5, color: "var(--on-dark-soft)", margin: 0 }}>&copy; {new Date().getFullYear()} Jaden Levin. Results vary. Not medical advice.</p>
        </div>
      </footer>
    </main>
  );
}

export default function BookPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#fff" }} />}><BookContent /></Suspense>;
}
