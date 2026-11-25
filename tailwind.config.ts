import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sky-blue': '#0EA5E9',
        'sky-dark': '#0C4A6E',
        'persia-gold': '#F59E0B',
      },
    },
  },
  plugins: [],
}
export default config
