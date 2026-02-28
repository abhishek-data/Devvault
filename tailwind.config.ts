import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            keyframes: {
                "block-highlight": {
                    "0%": { boxShadow: "0 0 0 2px rgba(59,130,246,0.6)" },
                    "100%": { boxShadow: "0 0 0 2px rgba(59,130,246,0)" },
                },
            },
            animation: {
                "block-highlight": "block-highlight 2s ease-out forwards",
            },
        },
    },
    plugins: [tailwindcssAnimate],
};

export default config;
