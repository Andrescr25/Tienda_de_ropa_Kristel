/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: scan all app & component files
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    './store/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Brand Palette ──────────────────────────────────
        gs: {
          black:    '#FFFFFF', // Used for button texts (now white on pink)
          white:    '#1A1114', // Used for main text (now dark)
          green:    '#FF6B98', // Hot vibrant pink
          'green-dim': '#E55B8B', 
          bg:       '#FCFAFA', // Warm off-white background
          card:     '#FFFFFF', // Pure white cards
          surface:  '#FFF0F3', // Very light blush surface
          border:   '#EBDDE0', // Soft borders
          muted:    '#88797D', // Muted text
          subtle:   '#D1C0C4', // Subtle elements
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
