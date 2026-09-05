/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        archive: {
          bg: '#0b0d10',
          surface: '#12161c',
          card: '#161b22',
          border: '#21262d',
          subtle: '#30363d',
          text: '#f0f6fc',
          muted: '#8b949e',
          faint: '#484f58',
          accent: '#e1306c',
          accentHover: '#c13584',
          nila: '#f43f5e',
          nilaBg: 'rgba(244, 63, 94, 0.12)',
          farhan: '#38bdf8',
          farhanBg: 'rgba(56, 189, 248, 0.12)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        editorial: [
          'Newsreader',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
      },
      backgroundImage: {
        'ig-gradient': 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        'subtle-glow': 'radial-gradient(ellipse at top, rgba(225, 48, 108, 0.08), transparent 70%)',
      },
    },
  },
  plugins: [],
};
