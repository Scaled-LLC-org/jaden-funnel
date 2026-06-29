"use client";

import { useEffect, useState } from "react";
import { parseCallWhen, type CallWhen } from "@/lib/call-when";
import { logger } from "@/lib/logger";

/** Localize a Calendly ISO timestamp to the viewer's timezone.
 *  Hydration-safe: returns null on first render (matches SSR), resolves after mount. */
export function useCallWhen(iso: string): CallWhen | null {
  const [when, setWhen] = useState<CallWhen | null>(null);

  useEffect(() => {
    const parsed = parseCallWhen(iso);
    if (iso && !parsed) logger.warn("call_when_parse_failed", { iso });
    setWhen(parsed);
  }, [iso]);

  return when;
}
