/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yt: {
          red: '#ff0000',
          black: '#0f0f0f',
          dark: '#212121',
          border: {
            light: '#e5e5e5',
            dark: '#3f3f3f'
          },
          text: {
            light: '#0f0f0f',
            dark: '#f1f1f1',
            secondary: {
              light: '#606060',
              dark: '#aaa'
            }
          },
          bg: {
            light: '#ffffff',
            dark: '#0f0f0f',
            hover: {
              light: '#f2f2f2',
              dark: '#272727'
            }
          }
        },
        ink: {
          950: '#07111f',
          900: '#0b1628',
          800: '#12213a',
          700: '#1e3355',
        },
        ember: {
          500: '#ff6b3d',
          600: '#ea5828',
        },
        sand: {
          50: '#fffaf6',
          100: '#fff1e6',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(7, 17, 31, 0.22)',
      },
    },
  },
  plugins: [],
};