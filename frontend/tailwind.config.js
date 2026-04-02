/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fffaf4",
          100: "#fbf3e8",
          200: "#f2dfc6",
          300: "#e3c49a",
          400: "#d1a86c",
          500: "#b88749",
          600: "#946537",
          700: "#6b4828",
          800: "#48311e",
          900: "#2a1c12",
        },
      },
      boxShadow: {
        glow: "0 24px 60px rgba(96, 60, 25, 0.12)",
        soft: "0 10px 30px rgba(96, 60, 25, 0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      backgroundImage: {
        "hero-wash":
          "radial-gradient(circle at 0% 0%, rgba(236,208,176,0.55), transparent 28%), radial-gradient(circle at 100% 10%, rgba(255,228,199,0.68), transparent 25%), linear-gradient(180deg, #fbf4ea 0%, #fffdf9 36%, #f8efe3 100%)",
        "gold-pill": "linear-gradient(135deg, #c89761, #8c6338)",
      },
    },
  },
  plugins: [],
};
