import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary-indigo": "#1e1b4b",
                "accent-gold": "#fbbf24",
                "background-dark": "#0a0a14",
                // New Auth UI Colors
                "primary": "#f2b90d",
                "background-light": "#f8f8f5",
                "card-dark": "#181611",
            },
            fontFamily: {
                "sans": ["var(--font-poppins)", "sans-serif"],
                "serif-display": ["var(--font-playfair)", "serif"],
                "display": ["var(--font-poppins)", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
        function ({ addUtilities }: any) {
            addUtilities({
                '.no-scrollbar': {
                    '-ms-overflow-style': 'none',
                    'scrollbar-width': 'none',
                },
                '.no-scrollbar::-webkit-scrollbar': {
                    'display': 'none',
                },
                '.glassmorphism': {
                    'background': 'rgba(255, 255, 255, 0.03)',
                    'backdrop-filter': 'blur(16px)',
                    'border': '1px solid rgba(255, 255, 255, 0.1)',
                }
            })
        }
    ],
};
export default config;
