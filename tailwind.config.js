/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        'gold-dark': '#B8860B',
        'warcraft-bg': '#1a0f0a',
      },
      fontFamily: {
        fantasy: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
}
