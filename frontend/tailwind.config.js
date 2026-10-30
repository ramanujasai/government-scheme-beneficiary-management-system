/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0e0e14',
        darkCard: '#161622',
        darkCardBorder: '#232336',
        darkInput: '#1b1b2a',
        darkInputBorder: '#2f2f47',
        primaryBlue: '#1d4ed8',
        primaryBlueHover: '#1e40af',
        btnBlue: '#2563eb',
      }
    },
  },
  plugins: [],
}
