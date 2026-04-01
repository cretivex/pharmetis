/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#171717',
        brand: {
          DEFAULT: '#171717',
          hover: '#262626',
          muted: '#404040',
        },
        accent: '#404040',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        card: 'var(--card)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        xl: 'var(--radius-xl, 1.25rem)',
        '2xl': 'var(--radius-2xl, 1.5rem)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 16px 48px -8px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(1.03)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'glow-pulse': 'glow-pulse 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
