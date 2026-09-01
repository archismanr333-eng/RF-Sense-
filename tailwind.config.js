/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#080d12',
        space: '#0b1117',
        surface: {
          dim: '#0e1418',
          DEFAULT: '#101820',
          container: '#161c20',
          card: '#1a2024',
          high: '#252b2f',
          highest: '#30363a',
          bright: '#343a3e',
        },
        cyan: {
          neon: '#00bfff',
          electric: '#38e8ff',
          glow: '#7ad0ff',
          dim: '#004a65',
        },
        rf: {
          low: '#10b981',      // Green - Low activity / quiet
          medium: '#fbbf24',   // Amber - Moderate activity
          high: '#f97316',     // Orange - Elevated
          critical: '#ef4444', // Red - High congestion / intense
          snr: '#8b5cf6',      // Purple - SNR index
        },
        status: {
          online: '#10b981',
          warning: '#ffc857',
          error: '#ff5c5c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 191, 255, 0.35)',
        'neon-cyan-lg': '0 0 25px rgba(0, 191, 255, 0.55)',
        'neon-amber': '0 0 15px rgba(255, 200, 87, 0.35)',
        'neon-red': '0 0 15px rgba(255, 92, 92, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'glow-bounce': 'glowBounce 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        glowBounce: {
          '0%': { opacity: '0.4', transform: 'scale(0.98)' },
          '100%': { opacity: '0.9', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
