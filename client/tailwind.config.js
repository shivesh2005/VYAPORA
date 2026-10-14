/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ejan: {
          bg: '#050B1B',
          bgSecondary: '#08132B',
          surface: '#0C1936',
          surfaceElevated: '#102044',
          violet: '#6345FF',
          blue: '#3478FF',
          cyan: '#35D7F2',
          text: '#F5F7FF',
          textMuted: '#A9B8D5',
          border: '#20365F',
        },
        brand: {
          navy: '#050B1B',
          dark: '#08132B',
          surface: '#0C1936',
          surfaceElevated: '#102044',
          violet: '#6345FF',
          violetLight: '#7C61FF',
          violetDark: '#502FE0',
          blue: '#3478FF',
          indigo: '#4F46E5',
          cyan: '#35D7F2',
          border: '#20365F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'ejan-glow': '0 0 25px -5px rgba(99, 69, 255, 0.25)',
        'ejan-blue-glow': '0 0 30px -5px rgba(52, 120, 255, 0.3)',
        'ejan-cyan-glow': '0 0 20px -5px rgba(53, 215, 242, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
};
