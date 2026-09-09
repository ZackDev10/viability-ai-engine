import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "border-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(6,182,212,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(6,182,212,0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        "float-glow": {
          "0%, 100%": {
            transform: "translateY(0px)",
            boxShadow: "0 0 30px rgba(6,182,212,0.15)",
          },
          "50%": {
            transform: "translateY(-16px)",
            boxShadow: "0 0 50px rgba(6,182,212,0.35)",
          },
        },
      },
      animation: {
        "border-pulse": "border-pulse 1.5s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "float-glow": "float-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
