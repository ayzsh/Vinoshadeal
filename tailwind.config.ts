import type { Config } from "tailwindcss";

/**
 * Vinoshadeal design system.
 * All brand colors live HERE. Change a value once and the whole site updates.
 * Light/dark surfaces come from CSS variables defined in app/globals.css.
 */
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#FF3333", // primary / CTA, sale badges, active states
          "red-dark": "#D91F1F", // hover state + red TEXT on white (passes WCAG AA)
          purple: "#330066", // header, footer (always dark purple)
          "purple-soft": "#4B1C8C", // hover on purple
        },
        success: "#16A34A",
        gold: "#F5A623",
        // Theme-aware colors (switch automatically in dark mode)
        page: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        tint: "rgb(var(--tint) / <alpha-value>)",
        line: "rgb(var(--border) / <alpha-value>)",
        heading: "rgb(var(--heading) / <alpha-value>)", // purple in light, lilac in dark
        redtext: "rgb(var(--redtext) / <alpha-value>)",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        field: "12px",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(51, 0, 102, 0.07)",
        lift: "0 10px 28px rgba(51, 0, 102, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
