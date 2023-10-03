/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          500: 'rgba(142, 142, 160, var(--tw-text-opacity))',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
