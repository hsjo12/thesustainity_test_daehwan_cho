import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        highlight: "#dcb441",
      },
      fontFamily: {
        bebas_neue: ["var(--bebas_neue)"],
        roboto: ["var(--roboto)"],
        fjalla_one: ["var(--fjalla_one)"],
      },
    },
  },
  plugins: [],
} satisfies Config;
