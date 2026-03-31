import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Lato', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        // Legacy aliases — all map to correct Mārama fonts
        inter: ['"Plus Jakarta Sans"', 'sans-serif'],
        outfit: ['"Plus Jakarta Sans"', 'sans-serif'],
        syne: ['Lato', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        'mono-jb': ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Whenua palette
        whenua: {
          kowhai: '#D4A843',
          'kowhai-light': '#F0D078',
          pounamu: '#3A7D6E',
          'pounamu-light': '#5AADA0',
          tangaroa: '#1A3A5C',
          'tangaroa-light': '#3A6A9C',
          rust: '#C85A54',
        },
        // Assembl brand surfaces
        assembl: {
          bg: '#09090F',
          surface: '#0F0F1A',
          'surface-2': '#16162A',
        },
        // Legacy neon aliases → mapped to Whenua
        neon: {
          green: "#D4A843",
          pink: "#C85A54",
          cyan: "#5AADA0",
          orange: "#D4A843",
          lime: "#5AADA0",
          red: "#C85A54",
          gold: "#D4A843",
          teal: "#3A7D6E",
          blue: "#3A6A9C",
          amber: "#F0D078",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "bounce-dot": {
          "0%, 80%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-6px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "sparkle": {
          "0%, 100%": { opacity: "0", transform: "scale(0) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1) rotate(180deg)" },
        },
        "shimmer-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "float-orb": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(10px, -20px)" },
          "50%": { transform: "translate(-10px, -10px)" },
          "75%": { transform: "translate(15px, 10px)" },
        },
        "star-pulse": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "bounce-dot": "bounce-dot 1.4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "sparkle": "sparkle 3s ease-in-out infinite",
        "shimmer-sweep": "shimmer-sweep 4s ease-in-out infinite",
        "float-orb": "float-orb 12s ease-in-out infinite",
        "star-pulse": "star-pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;