/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F0B90B',
        success: '#0ECB81',
        danger: '#F6465D',
      }
    },
  },
  plugins: [],
}
