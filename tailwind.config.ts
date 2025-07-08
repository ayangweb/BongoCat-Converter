import { heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
