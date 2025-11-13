/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in-scale": {
          "0%": { opacity: 0, transform: "scale(0.98)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "fadeIn": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "scaleIn": {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in-scale": "fade-in-scale 300ms ease-out",
        "fadeIn": "fadeIn 300ms ease-out",
        "scaleIn": "scaleIn 300ms ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("daisyui")],

  daisyui: {
    themes: [
      {
        light: {
          "color-scheme": "light",

          /* Light: canvas soft warm gray, cards white, borders gentle gray */
          "base-100": "oklch(99% 0.005 95)",  // canvas (very soft gray)
          "base-200": "oklch(98% 0 0)",       // cards/panels (white-ish)
          "base-300": "oklch(93.5% 0 0)",     // borders/dividers
          "base-400": "oklch(100% 0 0)",
          "base-content": "oklch(26% 0 0)",   // soft dark gray text

          /* Neutral brand (no color cast) */
          "primary": "oklch(0.4912 0.3096 275.75)",
          "primary-content": "oklch(98% 0 0)",
          "secondary": "oklch(40% 0 0)",
          "secondary-content": "oklch(98% 0 0)",
          "accent": "oklch(34% 0 0)",
          "accent-content": "oklch(98% 0 0)",
          "neutral": "oklch(22% 0 0)",
          "neutral-content": "oklch(96% 0 0)",

          "info": "oklch(58% 0.05 235)",
          "info-content": "oklch(16% 0 235)",
          "success": "oklch(56% 0.07 150)",
          "success-content": "oklch(16% 0 150)",
          "warning": "oklch(64% 0.08 80)",
          "warning-content": "oklch(18% 0.05 80)",
          "error": "oklch(55% 0.12 30)",
          "error-content": "oklch(16% 0.06 30)",

          "--rounded-box": "0.3rem",
          "--rounded-btn": "0.3rem",
          "--rounded-badge": "0.3rem",
          "--border-btn": "0.3px",
          "--tab-radius": "0.3rem",
          "--btn-text-case": "none",
        },
      },
      {
        "dark": {
          "color-scheme": "dark",
      
          /* Background layering */
          "base-100": "oklch(25% 0 0)",   // lighter dark (canvas, main background)
          "base-200": "oklch(22% 0 0)",   // slightly darker (cards, panels)
          "base-300": "oklch(18% 0 0)",   // darkest (borders, separators)
          "base-400": "oklch(16% 0 0)",
          "base-content": "oklch(85% 0 0)", // dull white text
      
          /* Brand neutrals */
          "primary": "oklch(78% 0 0)",   // light gray for highlights
          "primary-content": "oklch(14% 0 0)",
          "secondary": "oklch(60% 0 0)",
          "secondary-content": "oklch(12% 0 0)",
          "accent": "oklch(85% 0 0)",
          "accent-content": "oklch(14% 0 0)",
          "neutral": "oklch(32% 0 0)",
          "neutral-content": "oklch(92% 0 0)",
      
          /* Status (muted but visible) */
          "info": "oklch(65% 0.04 240)",
          "info-content": "oklch(12% 0 240)",
          "success": "oklch(62% 0.05 150)",
          "success-content": "oklch(12% 0 150)",
          "warning": "oklch(68% 0.07 80)",
          "warning-content": "oklch(12% 0.05 80)",
          "error": "oklch(60% 0.10 30)",
          "error-content": "oklch(12% 0.06 30)",
      
          /* Shape/borders */
          "--rounded-box": "0.3rem",
          "--rounded-btn": "0.3rem",
          "--rounded-badge": "0.3rem",
          "--border-btn": "0.3px",
          "--tab-radius": "0.3rem",
          "--btn-text-case": "none",
          "--border-select": "0.3px",
        }
      }
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
};
