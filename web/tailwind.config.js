/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#D8F3DC',
          200: '#74C69D',
          300: '#40916C',
          400: '#2D6A4F',
          500: '#1B4332',
          600: '#163729',
        },
        accent: { 500: '#F77F00', 400: '#FCBF49' },
        success: '#06D6A0',
        warning: '#FFB703',
        danger:  '#EF233C',
        info:    '#4CC9F0',
      },
    },
  },
  plugins: [],
};
