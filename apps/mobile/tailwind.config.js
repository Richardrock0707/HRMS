/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: {
          primary: "#FFFFFF",
          subtle: "#F8FAFC",
          muted: "#F1F5F9",
        },
        border: {
          hairline: "#E2E8F0",
        },
        ink: {
          primary: "#0F172A",
          secondary: "#334155",
          muted: "#64748B",
        },
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        status: {
          present: "#16A34A",
          presentBg: "#F0FDF4",
          late: "#D97706",
          lateBg: "#FFFBEB",
          absent: "#DC2626",
          absentBg: "#FEF2F2",
        },
      },
    },
  },
  plugins: [],
};
