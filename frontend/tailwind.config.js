/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3a86ff',
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36adf6',
          500: '#0c91e6',
          600: '#0074c4',
          700: '#005d9e',
          800: '#064f83',
          900: '#0a426d',
          950: '#072a49',
        },
        secondary: {
          DEFAULT: '#ff006e',
          50: '#fff0f7',
          100: '#ffe1ef',
          200: '#ffc2df',
          300: '#ff93c3',
          400: '#ff5499',
          500: '#ff1a6c',
          600: '#ff0055',
          700: '#d70046',
          800: '#b3003b',
          900: '#960035',
          950: '#56001a',
        },
        accent: {
          DEFAULT: '#8338ec',
          50: '#f6f3ff',
          100: '#ede8ff',
          200: '#dbd0ff',
          300: '#c2a9ff',
          400: '#a475ff',
          500: '#8b42ff',
          600: '#8338ec',
          700: '#6d1cd4',
          800: '#5a19ad',
          900: '#4b188c',
          950: '#2e0d5e',
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUp: 'slideUp 0.5s ease-out forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        sosPulse: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};