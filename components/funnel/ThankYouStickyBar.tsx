"use client";

import { useEffect, useState } from "react";

/** Client island — sticky confirm bar that slides up a few seconds after load. */
export function ThankYouStickyBar() {
  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSticky(true), 3500);
    return () => clearTimeout(t);
  }, []);

  if (!sticky) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, animation: "amBarUp 0.4s ease-out" }}>
      <div style={{ maxWidth: 940, margin: "0 auto", background: "var(--ink)", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 13, color: "var(--on-dark-soft)", fontWeight: 300, margin: 0 }}>Watch the videos before your call.</p>
        <a href="#" style={{ padding: "9px 20px", background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 500, textDecoration: "none", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>Confirm My Call</a>
      </div>
    </div>
  );
}
