"use client";

import React, { Suspense } from "react";

const SKOOL_URL = "https://www.skool.com/your-jaden-community"; // TODO: real link

function CommunityContent() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header className="am-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}>
        <span className="am-eyebrow" style={{ color: "var(--ink-deep)" }}>Aesthetic Mastery</span>
        <span className="am-serif" style={{ fontStyle: "italic", fontSize: 13, color: "var(--ink-mute)" }}>Jaden Levin</span>
      </header>

      <section style={{ padding: "64px 0", textAlign: "center" }}>
        <div className="am-wrap" style={{ maxWidth: 640 }}>
          <p className="am-eyebrow" style={{ marginBottom: 14, color: "var(--accent)" }}>The best place to start</p>
          <h1 className="am-h1" style={{ fontSize: 38, margin: "0 0 16px" }}>
            Start with <em className="am-italic">Aesthetic Mastery</em>
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", fontWeight: 300, lineHeight: 1.65, maxWidth: 540, margin: "0 auto 32px" }}>
            Based on your answers, the smartest first move is the Aesthetic Mastery community. Get Jaden&apos;s full natural system, the app, the 300+ workout library, and the Peak Aesthetic Splits &mdash; for less than the price of a month at most gyms.
          </p>

          <div style={{ border: "1px solid var(--rule)", borderTop: "1px solid var(--ink)", borderRadius: 10, background: "var(--paper)", padding: "32px 28px", maxWidth: 460, margin: "0 auto 28px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 18 }}>
              <span className="am-serif" style={{ fontSize: 40, fontWeight: 600, color: "var(--ink-deep)" }}>$97</span>
              <span style={{ fontSize: 14, color: "var(--ink-mute)" }}>/month</span>
            </div>
            {[
              "Jaden's full natural nutrition + training system",
              "The proprietary app + AI calorie/protein tracking",
              "300+ workout video library",
              "3 pre-built Peak Aesthetic Splits",
              "Weekly meal-plan generation",
              "Private community + monthly group calls",
            ].map((f) => (
              <div key={f} style={{ display: "flex", gap: 10, marginBottom: 11 }}>
                <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 300 }}>{f}</span>
              </div>
            ))}
          </div>

          <a href={SKOOL_URL} target="_blank" rel="noopener noreferrer" className="am-btn" style={{ fontSize: 16, padding: "16px 40px" }}>
            Join Aesthetic Mastery &rarr;
          </a>
          <p style={{ fontSize: 12.5, color: "var(--ink-mute)", marginTop: 14 }}>Cancel anytime &middot; Upgrade to 1:1 coaching whenever you&apos;re ready</p>
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

export default function CommunityPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#fff" }} />}><CommunityContent /></Suspense>;
}
