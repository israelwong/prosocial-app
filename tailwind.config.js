const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "2xl": "1600px", // Para monitores 2.7K/4K
      },
      animation: {
        "infinite-scroll": "infinite-scroll 100s linear infinite",
        rotate: "rotate 10s linear infinite",
      },
      keyframes: {
        "infinite-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        rotate: {
          "0%": { transform: "rotate(0deg) scale(10)" },
          "100%": { transform: "rotate(-360deg) scale(10)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        zinc: {
          750: "#3f3f46",
          850: "#27272a",
        },
      },
      fontFamily: {
        "Bebas-Neue": ["Bebas Neue", "sans-serif"],
        roboto: ["var(--font-roboto)", "Roboto", "sans-serif"],
        "FunnelSans-Bold": ["FunnelSans-Bold", "sans-serif"],
        "FunnelSans-BoldItalic": ["FunnelSans-BoldItalic", "sans-serif"],
        "FunnelSans-ExtraBold": ["FunnelSans-ExtraBold", "sans-serif"],
        "FunnelSans-Italic": ["FunnelSans-Italic", "sans-serif"],
        "FunnelSans-Light": ["FunnelSans-Light", "sans-serif"],
        "FunnelSans-LightItalic": ["FunnelSans-LightItalic", "sans-serif"],
        "FunnelSans-Medium": ["FunnelSans-Medium", "sans-serif"],
        "FunnelSans-MediumItalic": ["FunnelSans-MediumItalic", "sans-serif"],
        "FunnelSans-Regular": ["FunnelSans-Regular", "sans-serif"],
        "FunnelSans-SemiBold": ["FunnelSans-SemiBold", "sans-serif"],
        "FunnelSans-SemiBoldItalic": [
          "FunnelSans-SemiBoldItalic",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
