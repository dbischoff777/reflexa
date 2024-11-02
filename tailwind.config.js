/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'scaleIn': 'scaleIn 0.3s ease-out forwards',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .8 }
        },
        float: {
          '0%, 100%': { transform: 'translate(-50%, 0)' },
          '50%': { transform: 'translate(-50%, -4px)' }
        },
        scaleIn: {
          '0%': { transform: 'translate(-50%, -20px) scale(0)' },
          '100%': { transform: 'translate(-50%, 0) scale(1)' }
        },
      },
    },
  },
  // enable the opacity and backdrop-blur utilities
  plugins: [],
};