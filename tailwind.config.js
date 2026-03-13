/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Original brand mappings
        brand: {
          black: 'var(--primary)',
          gray: 'var(--secondary)',
          bg: 'var(--background)',
          paper: 'var(--paper)',
          border: 'var(--accent)',
          // New Swell-inspired accent color
          orange: "#ff7d1a", 
        }
      },
      boxShadow: {
        // High-end glow effect for buttons and active states
        'glow-orange': '0 0 20px rgba(255, 125, 26, 0.35)', 
      },
      fontFamily: {
        mono: ['monospace'], 
      },
    },
  },
  plugins: [],
}
