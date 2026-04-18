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
          black:    '#000000',
          white:    '#FFFFFF',
          green:    '#00FF87', // Signature neon green
          'green-dim': '#00CC6A',
          bg:       '#0A0A0A', // App background
          card:     '#141414', // Card surface
          surface:  '#1E1E1E', // Elevated surface
          border:   '#2A2A2A', // Subtle borders
          muted:    '#666666', // Secondary text
          subtle:   '#3A3A3A', // Subtle elements
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
