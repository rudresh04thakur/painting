/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FF3366',
          teal: '#4ECDC4',
          yellow: '#FFF01F',
          dark: '#111827',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'], // Assuming this or similar is loaded, otherwise falls back
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: []
}
