/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // ✅ IMPORTANT : On active le mode manuel via une classe CSS
  theme: {
    extend: {
      colors: {
        // On remplace les couleurs fixes par des variables CSS
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        
        'cyber-violet': {
          50: '#f5f3ff',
          // ... tes autres couleurs restent inchangées
          500: '#8b5cf6',
          900: '#4c1d95',
        },
        // On garde ton night-900 pour les cas où tu veux FORCER le noir même en mode jour
        'night-900': '#0a0a0f',
      },
      // ... le reste de ta config
    },
  },
  plugins: [],
};