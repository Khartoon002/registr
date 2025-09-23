
import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#0B64D8',
        brand2: '#084CA6',
        surface: '#0F172A',
        ink: '#E6EDF7'
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,.25)',
        glow: '0 24px 80px rgba(11,100,216,.25)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
export default config
