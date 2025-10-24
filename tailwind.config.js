/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#2563eb', // Blue 600
        'brand-dark': '#1d4ed8',   // Blue 700
        'neutral-light': '#f8fafc', // Slate 50
        'neutral-medium': '#64748b', // Slate 500
        'neutral-dark': '#1e293b',  // Slate 800
        'telegram': '#0088cc',      // Telegram Blue
        'telegram-hover': '#006ba6', // Darker Telegram Blue
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}