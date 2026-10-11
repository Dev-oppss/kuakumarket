import type { Config } from "tailwindcss"

/**
 * Couleurs et polices reprises telles quelles de la maquette validée par
 * la propriétaire — ne pas improviser de nouvelles teintes ici, le design
 * est déjà tranché. Si une couleur manque, la chercher dans
 * kuakumarket_maquette.html avant d'en inventer une.
 */
const config: Config = {
  // Les effets hover: ne s'appliquent que sur les appareils avec souris :
  // sur téléphone/tablette ils restaient "collés" après un tap.
  future: { hoverOnlyWhenSupported: true },
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: "#E23B6B",
          deep: "#B32552",
          soft: "#FCE4EE",
        },
        teal: {
          DEFAULT: "#1EA5C3",
          soft: "#DCF3F6",
        },
        // Bleu du logo (mesuré sur le mot "Market"). "deep" = même teinte, plus
        // sombre, pour les textes qui doivent rester très lisibles.
        "logo-blue": {
          DEFAULT: "#33A4AE",
          deep: "#267B82",
        },
        blush: "#FFF3F6",
        cream: "#FFFDFB",
        ink: {
          DEFAULT: "#2B1524",
          soft: "#6E5560",
        },
        gold: "#D9A441",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-manrope)", "sans-serif"],
      },
      borderRadius: {
        lg2: "28px",
        md2: "18px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        marquee: "marquee 26s linear infinite",
        floatSlow: "floatSlow 5s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 20px 45px -20px rgba(226,59,105,0.45)",
      },
    },
  },
  plugins: [],
}

export default config
