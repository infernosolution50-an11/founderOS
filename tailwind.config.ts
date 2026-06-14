import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "os-bg": "var(--os-bg)",
        "os-surface": "var(--os-surface)",
        "os-panel": "var(--os-panel)",
        "os-border": "var(--os-border)",
        "os-indigo": "var(--os-indigo)",
        "os-indigo-dim": "var(--os-indigo-dim)",
        "os-amber": "var(--os-amber)",
        "os-green": "var(--os-green)",
        "os-red": "var(--os-red)",
        "os-muted": "var(--os-muted)",
        "os-text": "var(--os-text)",
        "os-sub": "var(--os-sub)"
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(108, 99, 255, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;
