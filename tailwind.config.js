/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media', // 👈 auto-detect from OS
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'media', // ✅ based on user system preference
  theme: {
    extend: {
      colors: {
        dornRed: {
          DEFAULT: '#e53935',
          dark: '#c62828',
        },
        dornBg: '#121212',
        dornBox: '#1a1a1a',
        dornBody: '#cccccc',
        dornHint: '#999999',
        dornBorder: '#444444',
        dornBorderAlt: '#555555',
      },
      boxShadow: {
        dornSoft: '0 0 4px rgba(229, 57, 53, 0.15)',
      },
      backgroundImage: {
        'playful-gradient': 'linear-gradient(90deg, #e53935 0%, #c62828 100%)',
      },
    },
  },
  plugins: [],
}