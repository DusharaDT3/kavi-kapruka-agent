import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#09080F",
        surface: "#131020",
        "surface-2": "#1C1830",
        "surface-3": "#251F40",
        border: "#2D2650",
        primary: "#7C3AED",
        "primary-light": "#A855F7",
        accent: "#F59E0B",
        "accent-light": "#FCD34D",
        "text-primary": "#F3F0FF",
        "text-muted": "#8B85A8",
        "text-faint": "#5A5472",
        success: "#10B981",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        sinhala: ["var(--font-noto-sinhala)", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "kavi-gradient": "linear-gradient(135deg, #7C3AED, #A855F7)",
        "user-gradient": "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
