/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        primary: "#199C90",
        secondary: "#F46A5E", 
        accent: "#F89E32",
        info: "#4AA9E9",
      },
      animation: {
        'fill-money': 'fillMoney 2s ease-in-out infinite',
        'shine': 'shine 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
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
        fadeIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
    },
  },
  plugins: [],
}