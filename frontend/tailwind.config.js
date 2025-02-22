/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'fade-in-out': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '10%': { opacity: '1', transform: 'translateY(0)' },
          '90%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        }
      },
      animation: {
        'fade-in-out': 'fade-in-out 2s ease-in-out'
      }
    },
  },
  plugins: [],
}
