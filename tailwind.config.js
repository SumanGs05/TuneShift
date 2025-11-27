/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#E9ECEF",
        input: "#E9ECEF",
        ring: "#4A90E2",
        background: "#FFFFFF",
        foreground: "#212529",
        primary: {
          DEFAULT: "#4A90E2",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F8F9FA",
          foreground: "#6C757D",
        },
        destructive: {
          DEFAULT: "#DC3545",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F8F9FA",
          foreground: "#6C757D",
        },
        accent: {
          DEFAULT: "#4A90E2",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#212529",
        },
        card: {
          DEFAULT: "#F8F9FA",
          foreground: "#212529",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      transitionDuration: {
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease': 'ease',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}


