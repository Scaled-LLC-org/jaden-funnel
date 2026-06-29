"use client";

import { useCallWhen } from "@/hooks/useCallWhen";

/** Client island — the little calendar graphic on the thank-you page (date localizes to viewer). */
export function ThankYouCalendar({ iso }: { iso: string }) {
  const when = useCallWhen(iso);

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
