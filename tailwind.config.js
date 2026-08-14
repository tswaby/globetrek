/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0f172a", // ensures dark:bg-slate-950/xx works
        },
      },
    },
  },

  safelist: [
    // Arbitrary background gradients
    { pattern: /bg-

\[.*\]

/ },
    { pattern: /dark:bg-

\[.*\]

/ },

    // Arbitrary background sizes
    { pattern: /bg-

\[size:.*\]

/ },

    // Arbitrary opacity modifiers
    { pattern: /bg-.*\/.*/ },
    { pattern: /text-.*\/.*/ },
    { pattern: /border-.*\/.*/ },
    { pattern: /dark:bg-.*\/.*/ },
    { pattern: /dark:text-.*\/.*/ },
    { pattern: /dark:border-.*\/.*/ },
  ],

  plugins: [],
};
