/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // ADD THIS LINE
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: 'var(--primary)',
          gray: 'var(--secondary)',
          bg: 'var(--background)',
          paper: 'var(--paper)',
          border: 'var(--accent)',
          orange: "#ff7d1a", 
        }
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(255, 125, 26, 0.35)', 
      },
      fontFamily: {
        mono: ['monospace'], 
      },
    },
  },
  plugins: [],
}
