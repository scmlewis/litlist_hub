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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Deep brown library palette - leather and aged paper
        primary: {
          50: '#faf6f1',
          100: '#f5ebe0',
          200: '#e8d5bd',
          300: '#d4b896',
          400: '#c9a66b',
          500: '#8b5a2b',
          600: '#704214',
          700: '#5c3610',
          800: '#4a2c0d',
          900: '#3d240b',
          950: '#2d1810',
        },
        accent: {
          50: '#fdf8f3',
          100: '#f9ede0',
          200: '#f2d9bf',
          300: '#e8bf94',
          400: '#d9a066',
          500: '#b87333',
          600: '#a05a1c',
          700: '#854a17',
          800: '#6d3d16',
          900: '#5a3315',
        },
      },
    },
  },
  plugins: [],
};
