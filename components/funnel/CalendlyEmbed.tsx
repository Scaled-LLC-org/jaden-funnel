"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

const CALENDLY_URL = "https://calendly.com/your-jaden-link/strategy-call"; // TODO: real link

/** Client island — loads the Calendly widget script and renders the inline embed. */
export function CalendlyEmbed() {
  useEffect(() => {
    logger.info("booking_view");
    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    s.onload = () => logger.info("calendly_loaded");
    s.onerror = () => logger.error("calendly_load_failed");
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  return (
    <div
      className="calendly-inline-widget"
      data-url={CALENDLY_URL}
      style={{ minWidth: 320, height: 680, border: "1px solid var(--rule)", borderRadius: 10, overflow: "hidden", background: "var(--soft)" }}
    />
  );
}
