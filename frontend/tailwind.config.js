// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", // ✅ enables dark mode via `class="dark"`
  theme: {
    extend: {
      colors: {
        twitter: {
          blue: "#1DA1F2",   // Twitter brand blue
          dark: "#15202B",   // Twitter dark background
          light: "#F5F8FA",  // Twitter light background
          gray: "#657786",   // Twitter gray text
        },
      },
    },
  },
  plugins: [],
}
