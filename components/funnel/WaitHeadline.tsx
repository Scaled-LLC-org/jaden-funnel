"use client";

import { useCallWhen } from "@/hooks/useCallWhen";

/** Client island — the thank-you H1 whose date clause localizes to the viewer's timezone. */
export function WaitHeadline({
  firstName,
  iso,
  callDate,
  callTime,
}: {
  firstName: string;
  iso: string;
  callDate: string;
  callTime: string;
}) {
  const when = useCallWhen(iso);

  return (
    <h1 style={{ fontWeight: 800, fontSize: 34, lineHeight: 1.15, color: "var(--ink-deep)", margin: "0 0 14px", letterSpacing: "-0.02em" }}>
      {firstName ? `${firstName}, watch ` : "Watch "}this short video below so your call{" "}
      {when ? (
        <>on <em style={{ color: "var(--accent)", fontStyle: "italic" }}>{when.day} at {when.time}</em>{" "}</>
      ) : callDate ? (
        <>on <em style={{ color: "var(--accent)", fontStyle: "italic" }}>{callDate}{callTime && ` at ${callTime}`}</em>{" "}</>
      ) : null}
      doesn&apos;t get <em style={{ color: "var(--accent)", fontStyle: "italic" }}>cancelled</em>
    </h1>
  );
}
