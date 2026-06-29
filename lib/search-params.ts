/** Shape of a resolved Next.js App Router searchParams object. */
export type SearchParams = Record<string, string | string[] | undefined>

/** Coerce a searchParams value (`string | string[] | undefined`) to a single string. */
export function firstParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? '' : v ?? ''
}

/** Rebuild a query string from a Next.js searchParams object (to forward state between funnel steps). */
export function toQuery(sp: SearchParams): string {
  return new URLSearchParams(
    Object.entries(sp).flatMap(([k, v]) => (v === undefined ? [] : Array.isArray(v) ? v.map(x => [k, x] as [string, string]) : [[k, v] as [string, string]])),
  ).toString()
}
