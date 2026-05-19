import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-base": "#0a0d1a",
        "bg-card": "#12172b",
        "bg-elevated": "#1a2240",
        border: "#252d4a",
        accent: "#7c5af6",
        "accent-soft": "#3d2f8f",
        income: "#22c55e",
        expense: "#f43f5e",
        "text-primary": "#f1f5f9",
        "text-muted": "#64748b",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        btn: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
