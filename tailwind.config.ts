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
        plum: {
          dark: '#6B2C6B',
          medium: '#8B3A8B',
          light: '#F3E8FF',
        }
      }
    },
  },
  plugins: [],
}
export default config
