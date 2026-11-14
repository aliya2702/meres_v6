/** @type {import('tailwindcss').Config} */
// Palette derived from supplied MERES colour sheets + identity board; confirm in design review.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: { md: '768px', lg: '1024px', xl: '1440px' },
    extend: {
      colors: {
        linen: { DEFAULT: '#F4EFE6', deep: '#E9DDCD' },
        taupe: { DEFAULT: '#A39286', deep: '#907E73' },
        green: { DEFAULT: '#586F4C' },
        forest: { DEFAULT: '#2D372C', deep: '#1F2620' },
        ink: '#1E1F1B',
      },
      fontFamily: {
        display: ['"Libre Caslon Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { btn: '2px' },
    },
  },
  plugins: [],
};
