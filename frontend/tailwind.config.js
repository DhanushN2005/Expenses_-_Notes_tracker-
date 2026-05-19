/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep modern dark-theme primary and secondary tones
        darkbg: "#0B0F19",
        darkcard: "#151D30",
        darkborder: "#22314E",
      }
    },
  },
  plugins: [],
}
