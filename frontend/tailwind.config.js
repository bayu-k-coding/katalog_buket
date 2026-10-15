/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#93384B',
          hover: '#7D2A3B',
          light: '#FFD9DD',
          container: '#B25062',
          subtle: '#FFF1F2'
        },
        secondary: {
          DEFAULT: '#41674C',
          hover: '#31513A',
          light: '#C2EDCB',
          container: '#466D52',
          subtle: '#EAF5EC'
        },
        surface: {
          DEFAULT: '#FBF9F6',
          dim: '#EFEEEB',
          dark: '#1B1C1A'
        },
        borderMuted: '#DAC0C2',
        textMuted: '#6B5A5C'
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(147, 56, 75, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 12px 32px -4px rgba(147, 56, 75, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)'
      }
    },
  },
  plugins: [],
}
