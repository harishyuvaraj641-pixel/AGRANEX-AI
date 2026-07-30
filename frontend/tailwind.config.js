/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agranex: {
          bg: '#080C14',
          card: 'rgba(15, 23, 42, 0.45)',
          border: 'rgba(255, 255, 255, 0.08)',
          primary: '#10B981', // Emerald
          secondary: '#3B82F6', // Blue
          accent: '#8B5CF6', // Purple
          healthy: '#10B981',
          stress: '#F59E0B',
          nutrient: '#EF4444',
          dead: '#6B7280'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
