import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(3%, -4%) scale(1.05)" },
          "66%": { transform: "translate(-2%, 3%) scale(0.97)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(56, 189, 248, 0.35)" },
          "50%": { boxShadow: "0 0 0 22px rgba(56, 189, 248, 0)" },
        },
        "pulse-glow-codm": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(244, 63, 94, 0.4)" },
          "50%": { boxShadow: "0 0 0 22px rgba(244, 63, 94, 0)" },
        },
      },
      animation: {
        drift: "drift 26s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-out infinite",
        "pulse-glow-codm": "pulse-glow-codm 2.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
