/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        severity: {
          low: "#22c55e",
          medium: "#f59e0b",
          high: "#f97316",
          critical: "#ef4444",
        },
        panel: {
          bg: "#0f1117",
          card: "#1a1d27",
          border: "#2a2d3a",
          hover: "#252836",
        },
      },
      animation: {
        "pulse-alert": "pulseAlert 2s ease-in-out infinite",
      },
      keyframes: {
        pulseAlert: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.8)" },
        },
      },
    },
  },
  plugins: [],
};
