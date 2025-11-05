/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },
        secondary: "#64748b",
      },
      borderRadius: {
        container: "0.75rem",
      },
      spacing: {
        section: "2rem",
      },
    },
  },
  plugins: [],
};
