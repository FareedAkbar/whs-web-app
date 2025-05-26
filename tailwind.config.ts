import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
    darkMode: 'class', // NOT 'media'
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-family)", ...fontFamily.sans],
      },
      colors: {
        primary: "rgb(var(--primary-color) / <alpha-value>)",
      }
    },
  },
  plugins: [],
} satisfies Config;
