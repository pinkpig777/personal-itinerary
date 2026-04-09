/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aggie-maroon': '#500000',
        'cowboy-leather': '#8B5A2B',
        'texas-sand': '#F4EFEA',
        'denim-blue': '#2C3E50',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
