/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'voxel-bg': '#F4F3EF', // Light cream/stone
        'pikachu-yellow': '#FFDE00',
        'pokeball-red': '#FF1C1C',
        'emerald-green': '#00AA00',
        'ink-navy': '#1E1E24',
      },
      boxShadow: {
        'voxel': '4px 4px 0px #1E1E24',
        'press': '0px 0px 0px #1E1E24',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'arcade-press': 'arcadePress 0.1s forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        arcadePress: {
          '0%': { transform: 'translate(0, 0)', boxShadow: '4px 4px 0px #1E1E24' },
          '100%': { transform: 'translate(4px, 4px)', boxShadow: '0px 0px 0px #1E1E24' },
        },
      },
    },
  },
  plugins: [],
}