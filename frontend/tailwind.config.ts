/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0e1a",
          secondary: "#0f172a",
          editor: "#0d1117",
          panel: "#111827",
          card: "#1a2235",
        },
        accent: {
          blue: "#3b82f6",
          cyan: "#06b6d4",
          purple: "#8b5cf6",
        },
        error: {
          red: "#ef4444",
          orange: "#f97316",
        },
        success: "#10b981",
        warning: "#f59e0b",
        text: {
          primary: "#e5e7eb",
          secondary: "#9ca3af",
          muted: "#6b7280",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "glow": "glow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(59,130,246,0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(59,130,246,0.6)" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
        "hero-gradient":
          "radial-gradient(ellipse at top, rgba(59,130,246,0.15) 0%, transparent 60%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [],
};
