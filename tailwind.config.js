/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
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
          // Updated to use dynamic variable
          orange: "var(--brand-orange)", 
        }
      },
      boxShadow: {
        // Updated to use dynamic variable for the glow effect
        'glow-orange': '0 0 20px var(--brand-orange)', 
      },
      fontFamily: {
        mono: ['monospace'], 
      },
    },
  },
  plugins: [],
}
