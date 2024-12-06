import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {

			animation: {
				'infinite-scroll': 'infinite-scroll 100s linear infinite',
				rotate: 'rotate 10s linear infinite',
			},
			keyframes: {
			'infinite-scroll': {
				from: { transform: 'translateX(0)' },
				to: { transform: 'translateX(-100%)' },
			},
			rotate: {
				'0%': { transform: 'rotate(0deg) scale(10)' },
				'100%': { transform: 'rotate(-360deg) scale(10)' },
			},
			},
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
				"Bebas-Neue": ['Bebas Neue', "sans-serif"],
				'Smooch': ['"Smooch"', "cursive"],
			},
    },
  },
  plugins: [],
};
export default config;
