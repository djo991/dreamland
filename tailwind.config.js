/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  // Remove the 'presets' array entirely
  theme: {
    extend: {
      colors: {
        primary: "#1337ec",
        "background-light": "#f6f6f8",
        "background-dark": "#101322",
        "card-dark": "#1c1d27",
        "sidebar-dark": "#111218",
        "input-dark": "#282b39",
        "text-secondary": "#9da1b9",
      },
      fontFamily: {
        display: ["Inter_400Regular"], // Adjust if you change fonts later
      },
    },
  },
  plugins: [],
};