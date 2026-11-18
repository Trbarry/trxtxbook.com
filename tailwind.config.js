import typography from '@tailwindcss/typography';

const petrol = {
  50: '#edf7f5',
  100: '#d5eae6',
  200: '#b0d7d0',
  300: '#87beb7',
  400: '#64a8a0',
  500: '#287976',
  600: '#12605f',
  700: '#104f50',
  800: '#113f40',
  900: '#102f31',
  950: '#0a2022',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Assure-toi que cette ligne est bien là pour le switch jour/nuit
  theme: {
    extend: {
      colors: {
        // Les pages existantes utilisent encore ces noms pour l’accent du site.
        'cyber-violet': petrol,
        violet: petrol,
        purple: petrol,
        indigo: petrol,
        petrol,
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'night-900': '#191c1c',
      },
      backgroundImage: {
        'halo-violet': 'radial-gradient(ellipse at 70% 0%, rgb(var(--accent) / 0.05), transparent 65%)',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      maxWidth: {
        'xxs': '16rem',
      },
      minHeight: {
        'screen-75': '75vh',
      },
    },
  },
  plugins: [typography],
};
