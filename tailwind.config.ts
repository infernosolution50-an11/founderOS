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
        "os-border-strong": "var(--os-border-strong)",
        "os-indigo": "var(--os-indigo)",
        "os-indigo-dim": "var(--os-indigo-dim)",
        "os-amber": "var(--os-amber)",
        "os-green": "var(--os-green)",
        "os-red": "var(--os-red)",
        "os-muted": "var(--os-muted)",
        "os-text": "var(--os-text)",
        "os-sub": "var(--os-sub)",
        "os-overlay": "var(--os-overlay)"
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"]
      },
      fontSize: {
        "os-xs": ["0.6875rem", { lineHeight: "1rem" }],
        "os-sm": ["0.8125rem", { lineHeight: "1.25rem" }],
        "os-base": ["0.9375rem", { lineHeight: "1.5rem" }]
      },
      borderRadius: {
        "os-sm": "0.5rem",
        "os-md": "0.75rem",
        "os-lg": "1rem",
        "os-xl": "1.5rem"
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "touch": "2.75rem",
        "touch-lg": "3rem"
      },
      zIndex: {
        shell: "20",
        overlay: "50",
        modal: "60",
        command: "70"
      },
      boxShadow: {
        glow: "0 0 40px var(--os-glow)"
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" }
        },
        "score-flash": {
          "0%, 100%": { boxShadow: "0 0 0 0 transparent" },
          "50%": { boxShadow: "0 0 0 4px var(--os-glow)" }
        }
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "sheet-up": "sheet-up 180ms ease-out",
        "score-flash": "score-flash 420ms ease-out"
      }
    }
  },
  plugins: []
};

export default config;
