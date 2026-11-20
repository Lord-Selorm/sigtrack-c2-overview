/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',  // ← enables .dark class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS variable-based colors for dark/light mode support
        sigtrack: {
          bg:          'var(--bg-primary)',
          surface:     'var(--bg-secondary)',
          panel:       'var(--bg-tertiary)',
          border:      'var(--border-color)',
          'border-h':  'var(--bg-tertiary)',
          text:        'var(--text-primary)',
          muted:       'var(--text-muted)',
          dim:         'var(--text-secondary)',
          // Fixed accent colours (same in both modes)
          primary:     '#2563EB',
          primaryHover:'#1D4ED8',
          sky:         '#38BDF8',
          amber:       '#F59E0B',
          red:         '#EF4444',
          emerald:     '#10B981',
          purple:      '#8B5CF6',
        },
        // Map old bg-sigtrack-* to CSS variables
        'sigtrack-bg': 'var(--bg-primary)',
        'sigtrack-surface': 'var(--bg-secondary)',
        'sigtrack-panel': 'var(--bg-tertiary)',
        'sigtrack-border': 'var(--border-color)',
      },
      fontFamily: {
        sans: ['"Chakra Petch"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
