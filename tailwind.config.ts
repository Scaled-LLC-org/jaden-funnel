import type { Config } from 'tailwindcss'

/**
 * Tailwind v4 config — wiring only.
 * All design standards (colors, fonts) live in app/globals.css under @theme,
 * which is the single source of truth and generates the matching utilities.
 */
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
}

export default config
