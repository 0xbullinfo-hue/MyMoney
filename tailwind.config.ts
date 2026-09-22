import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E3A2F',
          container: '#3C4B3D',
          dark: '#1B241C',
        },
        secondary: {
          DEFAULT: '#6B7F5B',
          fixed: '#8EA27E',
        },
        tertiary: {
          DEFAULT: '#D9C9B2',
          container: '#EFE6D8',
        },
        accent: {
          DEFAULT: '#C96F4F',
          dark: '#B0593B',
        },
        surface: {
          DEFAULT: '#F8F6EE',
          lowest: '#FFFFFF',
          low: '#F0EDE4',
          high: '#E3DDD0',
        },
        outline: {
          DEFAULT: '#D9C9B2',
          variant: 'rgba(217, 201, 178, 0.5)',
        },
        'on-surface': {
          DEFAULT: '#2E3A2F',
          variant: '#5E695B',
        },
      },
      fontFamily: {
        headline: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        enclave: '0 8px 32px 0 rgba(46, 58, 47, 0.08)',
        glow: '0 0 20px 0 rgba(107, 127, 91, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
