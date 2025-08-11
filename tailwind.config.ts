import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}", // Para el router 'pages' (si lo usas)
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}", // Para el App Router
		"./ui/**/*.{js,ts,jsx,tsx,mdx}", // ¡Asegúrate de que esta línea exista!
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
				"roboto": ['roboto', "sans-serif"],
				'Smooch': ['"Smooch"', "cursive"],
			},
		},
	},
};
export default config;
