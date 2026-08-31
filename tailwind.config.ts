import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1440px' } },
    extend: {
      colors: {
        // Thesis branding
        brand: {
          DEFAULT: '#213c4e',
          50: '#f2f6f8',
          100: '#e3ebf0',
          200: '#c6d7e0',
          300: '#9bb8c8',
          400: '#6994ab',
          500: '#2E6B8A',
          600: '#2a5d78',
          700: '#264e64',
          800: '#213c4e',
          900: '#1a2f3d',
          950: '#111f29',
        },
        accent: { DEFAULT: '#2E6B8A', foreground: '#ffffff' },
        surface: '#F5F7F9',
        ink: '#333333',
        hairline: '#CCCCCC',
        success: { DEFAULT: '#22c55e', soft: '#dcfce7', ink: '#15803d' },
        warning: { DEFAULT: '#f59e0b', soft: '#fef3c7', ink: '#b45309' },
        danger: { DEFAULT: '#ef4444', soft: '#fee2e2', ink: '#b91c1c' },
        info: { DEFAULT: '#2E6B8A', soft: '#e3ebf0', ink: '#213c4e' },
        muted: { DEFAULT: '#F5F7F9', foreground: '#64748b' },
        border: '#CCCCCC',
        background: '#ffffff',
        foreground: '#333333',
        ring: '#2E6B8A',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Times New Roman', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: { lg: '0.6rem', md: '0.45rem', sm: '0.3rem' },
      boxShadow: {
        card: '0 1px 2px rgba(33,60,78,0.06), 0 1px 3px rgba(33,60,78,0.04)',
        lift: '0 4px 14px rgba(33,60,78,0.10)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'none' } },
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
      },
      animation: { 'fade-in': 'fade-in 180ms ease-out' },
    },
  },
  plugins: [],
};

export default config;
