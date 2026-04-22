import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1180px" }
    },
    extend: {
      colors: {
        navy: {
          900: "#0b1d33",
          800: "#11294a",
          700: "#173659",
          600: "#1f4e79",
          500: "#2f6aa1"
        },
        denim: { 400: "#5b8bb8" },
        sky: {
          300: "#9bbfd8",
          200: "#c7dceb",
          100: "#e3edf4"
        },
        paper: {
          DEFAULT: "#f4ede0",
          deep: "#efe6d3"
        },
        ink: {
          DEFAULT: "#0e2238",
          soft: "#3a4a60"
        },
        muted: { DEFAULT: "#6b7a8c" },
        line: {
          DEFAULT: "#d9cfb8",
          soft: "#e6dcc6"
        },
        brass: {
          DEFAULT: "#c9a35a",
          dark: "#a6823f"
        },
        good: { DEFAULT: "#226a3f", soft: "#d6ead8" },
        bad: { DEFAULT: "#8a3a3a", soft: "#f0d8d3" },
        warn: { DEFAULT: "#b3641f", soft: "rgba(201,163,90,0.25)" }
      },
      fontFamily: {
        serif: ['"Fraunces"', '"Iowan Old Style"', "Georgia", "serif"],
        sans: ['"Inter"', "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"]
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "10px",
        md: "12px",
        lg: "14px",
        xl: "18px",
        "2xl": "22px"
      },
      boxShadow: {
        sm: "0 1px 2px rgba(11, 29, 51, 0.08)",
        DEFAULT: "0 10px 30px -12px rgba(11, 29, 51, 0.25)",
        lg: "0 30px 60px -25px rgba(11, 29, 51, 0.35)"
      },
      backgroundImage: {
        "paper-grain":
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.05  0 0 0 0 0.13  0 0 0 0 0.22  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"
      }
    }
  },
  plugins: []
};

export default config;
