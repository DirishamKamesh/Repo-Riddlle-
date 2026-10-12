import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core surfaces (elevation hierarchy)
        canvas: '#0B0E12',
        'surface-primary': '#11161D',
        'surface-elevated': '#171E27',
        'surface-hover': '#1D2732',
        border: '#2A3441',
        'border-subtle': 'rgba(42, 52, 65, 0.4)',

        // Text hierarchy
        'text-primary': '#E8EDF5',
        'text-secondary': '#A2ADBD',
        'text-muted': '#737F90',

        // Semantic accents
        'accent-blue': '#5B8CFF',
        'accent-blue-hover': '#4B7CF6',
        'accent-blue-dim': '#B2C5FF',
        'accent-emerald': '#39D6A0',
        'accent-emerald-dim': '#04BF8B',
        'accent-amber': '#F4BD58',
        'accent-amber-container': '#B98828',
        'accent-violet': '#A78BFA',
        'accent-teal': '#43C9D9',
        'accent-slate': '#8190A5',
        'accent-util': '#9099A6',
        'accent-error': '#F07178',
        'accent-error-bg': '#93000A',

        // Stitch design system direct mappings
        'ds-outline': '#8D909F',
        'ds-outline-variant': '#434653',
        'ds-surface-variant': '#30353D',
        'ds-surface-container-highest': '#30353D',
        'ds-surface-container-high': '#252A32',
        'ds-surface-container': '#1B2027',
        'ds-surface-container-low': '#171C23',
        'ds-surface-container-lowest': '#090E15',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'headline-xl': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em', fontWeight: '600' }],
        'headline-xl-mobile': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg-mobile': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em', fontWeight: '600' }],
        'headline-sm': ['1.125rem', { lineHeight: '1.5rem', letterSpacing: '-0.015em', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.005em', fontWeight: '400' }],
        'body-sm': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0', fontWeight: '400' }],
        'code-lg': ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0', fontWeight: '500' }],
        'code-md': ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0', fontWeight: '400' }],
        'code-sm': ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0', fontWeight: '400' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-code': ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.02em', fontWeight: '500' }],
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2rem',
        gutter: '1rem',
        'gutter-compact': '0.5rem',
        'margin-panel': '0.75rem',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        'elevation-3': '0 8px 24px -4px rgba(0, 0, 0, 0.45)',
        inner: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
