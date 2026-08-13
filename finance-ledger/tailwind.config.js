export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0a1628', 800: '#0f1f38', 700: '#162a4a', 600: '#1e3a5f' },
        cyan: { 400: '#00e5ff', 500: '#00bcd4' },
        ledger: { green: '#22c55e', red: '#ef4444', amber: '#f59e0b', blue: '#3b82f6' }
      }
    }
  },
  plugins: []
}
