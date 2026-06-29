/* Structured, dependency-free funnel logger — the single seam for funnel
   analytics. Console output is gated by an active log level; funnel events are
   pushed to window.dataLayer (GTM/GA4) for analytics. NEVER pass PII
   (name/email/phone/tokens).

   Crank console verbosity without a redeploy (e.g. to debug live in prod):
     ?debug in the URL              → debug level (this page load)
     localStorage.am_debug = 'true' → debug level (sticky across reloads)
     localStorage.am_log_level = 'debug' | 'info' | 'warn' | 'error'
                                    → explicit level override
   Default level: dev = debug, prod = info. */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogContext = Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

const LEVEL_PRIORITY: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const hasWindow = typeof window !== 'undefined'
const isDev = process.env.NODE_ENV !== 'production'

/** Read a level override from the URL (?debug) or localStorage. Client-only. */
function readOverride(): LogLevel | null {
  if (!hasWindow) return null
  try {
    if (new URLSearchParams(window.location.search).has('debug')) return 'debug'
    const stored = localStorage.getItem('am_log_level') as LogLevel | null
    if (stored && stored in LEVEL_PRIORITY) return stored
    if (localStorage.getItem('am_debug') === 'true') return 'debug'
  } catch {
    // localStorage can throw in private mode / disabled cookies — ignore.
  }
  return null
}

const OVERRIDE = readOverride()
const MIN_LEVEL: LogLevel = OVERRIDE ?? (isDev ? 'debug' : 'info')

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL]
}

/** Short HH:MM:SS.mmm timestamp — readable in the console. */
function ts(): string {
  const d = new Date()
  return d.toTimeString().slice(0, 8) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

const STYLES: Record<string, string> = {
  ts: 'color:#888;font-weight:normal',
  ns: 'color:#0086a8;font-weight:bold', // brand accent
  debug: 'color:#888',
  info: 'color:#0086a8',
  warn: 'color:#caa53d',
  error: 'color:#d64545;font-weight:bold',
}

function emit(level: LogLevel, event: string, context?: LogContext): void {
  // Console (diagnostics) — gated by the active level. `?debug` cranks it open.
  if (shouldLog(level)) {
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : level === 'info' ? console.info : console.log
    const prefix = `%c${ts()} %c[funnel] %c${level.toUpperCase()}`
    if (context === undefined) {
      fn(`${prefix} ${event}`, STYLES.ts, STYLES.ns, STYLES[level])
    } else {
      fn(`${prefix} ${event}`, STYLES.ts, STYLES.ns, STYLES[level], context)
    }
  }

  // dataLayer (analytics) — info+ always; debug only when the level allows it.
  if (hasWindow && window.dataLayer && (LEVEL_PRIORITY[level] >= LEVEL_PRIORITY.info || shouldLog(level))) {
    window.dataLayer.push({ event, ts: new Date().toISOString(), ...context })
  }
}

export const logger = {
  debug: (event: string, context?: LogContext) => emit('debug', event, context),
  info: (event: string, context?: LogContext) => emit('info', event, context),
  warn: (event: string, context?: LogContext) => emit('warn', event, context),
  error: (event: string, context?: LogContext) => emit('error', event, context),
}

/** Active minimum log level — surfaced by the boot banner / diagnostics. */
export function getLogLevel(): LogLevel {
  return MIN_LEVEL
}

/** True when the level was forced via `?debug` or localStorage. */
export function isLogOverridden(): boolean {
  return OVERRIDE !== null
}
