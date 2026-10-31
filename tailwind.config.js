/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#faf8ff',
          100: '#f1ebff',
          200: '#e5d9ff',
          300: '#d2bdff',
          400: '#b99aff',
          500: '#9b78f5',
          600: '#8058df',
          700: '#6842bd',
          800: '#55389a',
        },
      },
      boxShadow: {
        soft: '0 12px 35px rgba(104, 66, 189, 0.08)',
      },
    },
  },
  plugins: [],
}