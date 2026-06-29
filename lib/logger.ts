/* Structured, dependency-free funnel logger. The single seam for funnel
   analytics. Dev: console. Prod: pushes to window.dataLayer (GTM/GA4) and
   still consoles warn/error. NEVER pass PII (name/email/phone/tokens). */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const isDev = process.env.NODE_ENV !== "production";

function emit(level: LogLevel, event: string, context?: LogContext): void {
  if (level === "debug" && !isDev) return;
  const payload = { event, ts: new Date().toISOString(), ...context };

  if (isDev || level === "warn" || level === "error") {
    const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    sink(`[funnel:${level}] ${event}`, context ?? {});
  }

  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push(payload);
  }
}

export const logger = {
  debug: (event: string, context?: LogContext) => emit("debug", event, context),
  info: (event: string, context?: LogContext) => emit("info", event, context),
  warn: (event: string, context?: LogContext) => emit("warn", event, context),
  error: (event: string, context?: LogContext) => emit("error", event, context),
};
