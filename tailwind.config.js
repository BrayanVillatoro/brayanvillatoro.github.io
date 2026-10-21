/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan every page + the runtime-injected classes in script.js so the
  // compiled stylesheet includes exactly the utilities the site uses.
  content: ['./*.html', './script.js'],
  theme: {
    extend: {
      colors: {
        brand: { dark: '#1d1d1f', secondary: '#86868b', light: '#fafafa' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
