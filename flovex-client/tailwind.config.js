/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic tokens — swap via CSS variables on .dark
        cream:  'rgb(var(--color-cream)  / <alpha-value>)',
        dark:   'rgb(var(--color-dark)   / <alpha-value>)',
        card:   'rgb(var(--color-card)   / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        muted:  'rgb(var(--color-muted)  / <alpha-value>)',
        // Static brand palette
        indigo: {
          flovex: '#5046E4',
          light: '#7B72F0',
          dim: '#3D34C8',
        },
        sage: '#7DB89A',
        amber: { flovex: '#E8B84B' },
        rose: { flovex: '#E86B6B' },
        slate: { flovex: '#2E2E3A' },
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', '"Clash Display"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(26,26,31,0.06)',
        'card-hover': '0 8px 32px 0 rgba(80,70,228,0.13)',
        glow: '0 0 24px 4px rgba(80,70,228,0.18)',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};
