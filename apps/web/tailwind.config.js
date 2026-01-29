// placeholder
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070A12",
        panel: "#0B1020"
      },
      boxShadow: {
        glowViolet:
          "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -28px rgba(99,102,241,0.9)",
        glowCyan:
          "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -28px rgba(34,211,238,0.8)"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.75" }
        }
      },
      animation: {
        floaty: "floaty 8s ease-in-out infinite",
        pulseGlow: "pulseGlow 4.5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
