/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        surface: '#18181B',
        'surface-elevated': '#27272A',
        border: '#3F3F46',
        primary: '#3B82F6',
        'primary-hover': '#2563EB',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        'text-primary': '#FAFAFA',
        'text-secondary': '#A1A1AA',
        'text-muted': '#71717A',
        sport: {
          running: '#3B82F6',
          cycling: '#A855F7',
          swimming: '#06B6D4',
          gym: '#F59E0B',
          rest: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
      },
    },
  },
  plugins: [],
};
