const defaultTheme = require("./public/themes/default-user-theme.json");
const embedTheme = require("./public/themes/embed-user-theme.json");

const shapeTokens = {
  "--rounded-box": "0.3rem",
  "--rounded-btn": "0.3rem",
  "--rounded-badge": "0.3rem",
  "--border-btn": "0.3px",
  "--tab-radius": "0.3rem",
  "--btn-text-case": "none",
};

const shapeTokensDark = {
  ...shapeTokens,
  "--border-select": "0.3px",
};

const buildTheme = (tokens, colorScheme = "light") => ({
  "color-scheme": colorScheme,
  ...tokens,
  ...(colorScheme === "dark" ? shapeTokensDark : shapeTokens),
});

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
        light: buildTheme(defaultTheme.light, "light"),
      },
      {
        dark: buildTheme(defaultTheme.dark, "dark"),
      },
      {
        embed: buildTheme(embedTheme.light, "light"),
      },
      {
        "embed-dark": buildTheme(embedTheme.dark, "dark"),
      },
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
