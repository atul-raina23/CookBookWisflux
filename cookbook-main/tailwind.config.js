/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./component/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionDuration: {
        '2000': '2000ms',
      },
      animation: {
        'fade-up': 'fadeUp 2s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)' 
          },
          '100%': { 
            opacity: '0', 
            transform: 'translateY(-80px) scale(1.1)' 
          },
        },
      },
    },
  },
  plugins: [],
}