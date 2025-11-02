/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0055a5',
          50: '#e6f2ff',
          100: '#cce5ff',
          200: '#99cbff',
          300: '#66b0ff',
          400: '#3396ff',
          500: '#0055a5',
          600: '#004488',
          700: '#00336b',
          800: '#00224d',
          900: '#001130',
        },
        bees: {
          yellow: '#ffd43b',
          gold: '#fff0b8',
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
          },
          light: {
            bg: '#ffffff',
            card: '#f9fafb',
            border: '#e5e7eb',
            hover: '#f3f4f6',
          }
        },
        success: '#10b981',
        warning: '#ffd43b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
