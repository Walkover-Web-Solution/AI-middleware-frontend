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

          // Primary - Rich sapphire blue with depth
          "primary": "oklch(58% 0.22 235)",
          "primary-content": "oklch(98% 0.005 235)",

          // Secondary - Warm pearl gray
          "secondary": "oklch(72% 0.03 45)",
          "secondary-content": "oklch(22% 0.015 45)",

          // Accent - Sophisticated emerald
          "accent": "oklch(62% 0.18 155)",
          "accent-content": "oklch(18% 0.025 155)",

          // Neutral - Rich charcoal with warmth
          "neutral": "oklch(45% 0.02 235)",
          "neutral-content": "oklch(96% 0.008 235)",

          // Base - Luxurious off-whites and soft grays
          "base-100": "oklch(98% 0.002 247.839)",
          "base-200": "oklch(96% 0.003 264.542)",
          "base-300": "oklch(92% 0.006 264.531)",
          "base-content": "oklch(21% 0.034 264.665)",   // Rich dark text with subtle blue

          // Status colors - refined and sophisticated
          "info": "oklch(68% 0.20 215)",
          "info-content": "oklch(18% 0.03 215)",

          "success": "oklch(58% 0.20 145)",
          "success-content": "oklch(18% 0.03 145)",

          "warning": "oklch(72% 0.18 65)",
          "warning-content": "oklch(22% 0.05 65)",

          "error": "oklch(62% 0.22 12)",
          "error-content": "oklch(18% 0.05 12)",

          // Enhanced styling
          "--rounded-box": "0.875rem",
          "--rounded-btn": "0.625rem",
          "--rounded-badge": "0.75rem",
          "--border-btn": "1.5px",
          "--tab-radius": "0.875rem"
        },

        dark: {
          "color-scheme": "dark",

          // Primary - Luminous royal blue
          "primary": "oklch(72% 0.20 240)",
          "primary-content": "oklch(12% 0.01 240)",

          // Secondary - Sophisticated slate
          "secondary": "oklch(58% 0.06 235)",
          "secondary-content": "oklch(12% 0.01 235)",

          // Accent - Refined mint with richness
          "accent": "oklch(68% 0.14 158)",
          "accent-content": "oklch(12% 0.01 158)",

          // Neutral - Deep sophisticated blue-gray
          "neutral": "oklch(28% 0.025 235)",
          "neutral-content": "oklch(88% 0.01 235)",

          // Base - Rich, deep navy with subtle variations
          "base-100": "oklch(28% 0.020 270)",       // Much lighter rich navy - main background
          "base-200": "oklch(25% 0.030 268)",       // Slightly darker for cards/elevated surfaces  
          "base-300": "oklch(36% 0.045 265)",       // Even lighter border for perfect visibility
          "base-content": "oklch(96% 0.010 230)",   // Soft warm white text

          // Status colors - vibrant yet sophisticated for dark theme
          "info": "oklch(72% 0.17 218)",
          "info-content": "oklch(12% 0.02 218)",

          "success": "oklch(68% 0.16 148)",
          "success-content": "oklch(12% 0.02 148)",

          "warning": "oklch(78% 0.20 68)",
          "warning-content": "oklch(12% 0.04 68)",

          "error": "oklch(72% 0.20 18)",
          "error-content": "oklch(12% 0.04 18)",

          // Enhanced styling
          "--rounded-box": "0.875rem",
          "--rounded-btn": "0.625rem",
          "--rounded-badge": "0.75rem",
          "--border-btn": "1.5px",
          "--tab-radius": "0.875rem"
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
