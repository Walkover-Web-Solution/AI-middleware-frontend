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
        sans: ['"DM Sans"', 'sans-serif'], // override default
      },
       keyframes: {
        'fade-in-up': {
      '0%': { opacity: 0, transform: 'translateY(8px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
         animation: {
        'fade-in-scale': 'fade-in-scale 300ms ease-out',
        },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("daisyui")],
  // daisyui: {
  //   themes: [  "light"],
  // },
  daisyui: {
    themes: [
      {
        light: {
          "color-scheme": "light",
          "primary": "#000000",
          "primary-content": "oklch(98% 0.031 120.757)",
          "secondary": "oklch(66% 0.295 322.15)",
          "secondary-content": "oklch(97% 0.017 320.058)",
          "accent": "oklch(60% 0.25 292.717)",
          "accent-content": "oklch(96% 0.016 293.756)",
          "neutral": "oklch(37% 0.034 259.733)",
          "neutral-content": "oklch(98% 0.002 247.839)",
          "base-100": "oklch(98% 0.002 247.839)",
          "base-200": "oklch(96% 0.003 264.542)",
          "base-300": "oklch(92% 0.006 264.531)",
          "base-content": "oklch(21% 0.034 264.665)",
          "info": "oklch(78% 0.154 211.53)",
          "info-content": "oklch(30% 0.056 229.695)",
          "success": "oklch(76% 0.177 163.223)",
          "success-content": "oklch(26% 0.051 172.552)",
          "warning": "oklch(75% 0.183 55.934)",
          "warning-content": "oklch(26% 0.079 36.259)",
          "error": "oklch(71% 0.194 13.428)",
          "error-content": "oklch(27% 0.105 12.094)",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "0.5rem",
          "--border-btn": "1px",
          "--tab-radius": "1rem"
        },
        dark: {
          "color-scheme": "dark",
          "primary": "#6366f1",
          "primary-content": "oklch(98% 0.031 120.757)",
          "secondary": "oklch(65% 0.28 322.15)",
          "secondary-content": "oklch(95% 0.017 320.058)",
          "accent": "oklch(72% 0.22 292.717)",
          "accent-content": "oklch(15% 0.016 293.756)",
          "neutral": "oklch(28% 0.025 259.733)",
          "neutral-content": "oklch(88% 0.008 247.839)",
          "base-100": "oklch(22% 0.015 240)",
          "base-200": "oklch(18% 0.018 240)",
          "base-300": "oklch(14% 0.020 240)",
          "base-content": "oklch(88% 0.025 264.665)",
          "info": "oklch(68% 0.18 220)",
          "info-content": "oklch(15% 0.056 229.695)",
          "success": "oklch(68% 0.19 155)",
          "success-content": "oklch(15% 0.051 172.552)",
          "warning": "oklch(72% 0.20 65)",
          "warning-content": "oklch(15% 0.079 36.259)",
          "error": "oklch(68% 0.21 15)",
          "error-content": "oklch(15% 0.105 12.094)",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "0.5rem",
          "--border-btn": "1px",
          "--tab-radius": "1rem"
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
  }
};
