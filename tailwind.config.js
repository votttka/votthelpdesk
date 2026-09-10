export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      colors: {
        bg: '#F6F8FC',
        surface: '#FFFFFF',
        muted: '#F3F6FB',
        hover: '#F8FAFF',
        border: '#E6EBF2',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        textMuted: '#9CA3AF',
        primary: '#2563EB',
        primaryHover: '#1D4ED8',
        primarySoft: '#EFF6FF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444'
      },
      boxShadow: {
        xs: '0 1px 2px rgba(17,24,39,.04)',
        sm: '0 4px 12px rgba(17,24,39,.06)',
        md: '0 12px 32px rgba(17,24,39,.08)'
      },
      borderRadius: {
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        'pill': '999px'
      }
    }
  },
  plugins: []
}
