import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-outfit)", "var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "var(--font-dmsans)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        // Sleek/Glassmorphism Theme Palette
        "bg-0": "var(--bg-0)",
        "bg-1": "var(--bg-1)",
        "bg-2": "var(--bg-2)",
        "surface": "var(--surface)",
        "surface-strong": "var(--surface-strong)",
        "line": "var(--line)",
        "line-strong": "var(--line-strong)",
        "text": "var(--text)",
        "text-dim": "var(--text-dim)",
        "text-mute": "var(--text-mute)",
        "indigo-sleek": "var(--indigo)",
        "indigo-2": "var(--indigo-2)",
        "violet-sleek": "var(--violet)",
        "cyan-sleek": "var(--cyan)",
        "cyan-2": "var(--cyan-2)",
        "amber-sleek": "var(--amber)",
        "amber-2": "var(--amber-2)",
        "rose-sleek": "var(--rose)",
        "green-sleek": "var(--green)",

        // Chaotic Growth Palette - Saturated & Vibrant
        neon: {
          pink: "#FF006E",
          purple: "#8338EC",
          lime: "#3EFF4D",
          cyan: "#00D9FF",
          gold: "#FFB700",
          orange: "#FF5722",
        },
        // CSS Variable colors
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "border-color": "var(--border-color)",
        // Dark background tokens
        dark: {
          bg: "#070710",
          card: "#0b0b16",
          border: "rgba(255, 255, 255, 0.07)",
        },
        // Light background tokens
        light: {
          bg: "#FAFAFA",
          card: "#FFFFFF",
          border: "#E5E5EA",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "breathe": "breathe 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float-up": "floatUp 3s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "stagger-1": "fadeIn 0.3s ease-out 0.1s both",
        "stagger-2": "fadeIn 0.3s ease-out 0.2s both",
        "stagger-3": "fadeIn 0.3s ease-out 0.3s both",
        "stagger-4": "fadeIn 0.3s ease-out 0.4s both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        breathe: {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(1.05)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px 0 rgba(255, 0, 110, 0.5)" },
          "50%": { boxShadow: "0 0 30px 0 rgba(255, 0, 110, 0.8)" },
        },
        floatUp: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
      boxShadow: {
        "glow-pink": "0 0 30px rgba(255, 0, 110, 0.5)",
        "glow-purple": "0 0 30px rgba(131, 56, 236, 0.5)",
        "glow-cyan": "0 0 30px rgba(0, 217, 255, 0.5)",
        "card-depth": "0 20px 40px rgba(0, 0, 0, 0.2)",
        "card-sm": "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    // Noise texture plugin
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".noise": {
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3CfeColorMatrix in='noise' type='saturate' values='0.3' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        },
        ".grain": {
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "0",
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23grain)' opacity='0.05'/%3E%3C/svg%3E")`,
            pointerEvents: "none",
            mixBlendMode: "multiply",
          },
        },
      });
    }),
  ],
};

export default config;
