/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1a1a2e',
        surface: '#1e293b',
        gold: '#f59e0b',
      },
    },
  },
  plugins: [],
}
