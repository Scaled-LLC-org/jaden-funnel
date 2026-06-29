export type CallWhen = { day: string; time: string };

/**
 * Format a Calendly ISO timestamp into the viewer's local day + time.
 * Must run on the client — it relies on the viewer's timezone.
 */
export function parseCallWhen(iso: string): CallWhen | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return {
    day: d.toLocaleDateString(undefined, { weekday: "long" }),
    time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toLowerCase().replace(" ", ""),
  };
}
