/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./src/app/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#113e47",
          "secondary": "#a48976",
          "accent": "#0b5456",
          "neutral": "#2a323c",
          "base-100": "#1d232a",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
}

