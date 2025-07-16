<<<<<<< HEAD
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'fill-money': 'fillMoney 2s ease-in-out infinite',
        'shine': 'shine 2s ease-in-out infinite',
      },
      keyframes: {
        fillMoney: {
          '0%': { 
            transform: 'translateX(-100%)',
            opacity: '0.3'
          },
          '50%': { 
            transform: 'translateX(0%)',
            opacity: '0.7'
          },
          '100%': { 
            transform: 'translateX(100%)',
            opacity: '0.3'
          },
        },
        shine: {
          '0%': { 
            transform: 'translateX(-100%) skewX(-15deg)',
            opacity: '0'
          },
          '50%': { 
            transform: 'translateX(0%) skewX(-15deg)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateX(100%) skewX(-15deg)',
            opacity: '0'
          },
        },
      },
    },
  },
  plugins: [],
=======
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
>>>>>>> b6edc436f335720c99a16a18d5742a7a43024dba
}