/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1F4072',
          secondary: '#FFF6F0',
          cream: '#FFF6F0',
          blueTint: 'rgba(31, 64, 114, 0.15)',
          sand: '#E8E4DC',
          dark: '#0F172A',
          muted: '#64748B',
          border: '#E2E8F0',
          emerald: '#10B981',
          saffron: '#F97316',
        },
        primary: {
          DEFAULT: '#1F4072',
          foreground: '#FFFFFF',
          hover: '#163056',
        },
        secondary: {
          DEFAULT: '#FFF6F0',
          foreground: '#1F4072',
          border: '#F5E6DA',
        },
        accent: {
          DEFAULT: 'rgba(31, 64, 114, 0.15)',
          foreground: '#1F4072',
          sand: '#E8E4DC',
        }
      },
      fontFamily: {
        outfit: ['"Outfit"', 'sans-serif'],
        sora: ['"Outfit"', 'sans-serif'],
        primary: ['"Outfit"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        heading: ['"Outfit"', 'sans-serif'],
        brand: ['"Outfit"', 'sans-serif'],
        dmsans: ['"DM Sans"', 'sans-serif'],
        secondary: ['"DM Sans"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
