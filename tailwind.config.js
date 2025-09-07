/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#3B82F6',
        'accent-dark': '#2563EB',
        'background': 'var(--background)',
        'foreground': 'var(--foreground)',
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
