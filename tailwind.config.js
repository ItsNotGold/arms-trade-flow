/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0c10",
        surface: "#13161e",
        border: "#1e2330",
        accent: "#3b82f6", // cold blue
        "text-primary": "#e2e8f0",
        "text-muted": "#64748b",
      },
    },
  },
  plugins: [],
}
