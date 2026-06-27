import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'am-cyan': '#00D9FF',
        'am-blue': '#0099FF',
        'am-navy': '#001A3D',
        'am-dark': '#0D1B3D',
        'am-medium': '#0066CC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px #00D9FF, 0 0 20px #00D9FF40, 0 0 40px #0066CC30',
        'neon-lg': '0 0 15px #00D9FF, 0 0 30px #00D9FF50, 0 0 60px #0066CC40',
        'neon-btn': '0 0 20px #00D9FF80, 0 0 40px #00D9FF40',
      },
    },
  },
  plugins: [],
};
export default config;
