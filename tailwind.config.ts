import type { Config } from "tailwindcss";

/**
 * Assembl — Feather Kete Design System
 * Palette: Mārama Whenua (warm light)
 * Typography: Cormorant Garamond + Inter + IBM Plex Mono
 */

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
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
        assembl: {
          mist: "#F7F3EE",
          cloud: "#EEE7DE",
          sand: "#D8C8B4",
          taupe: "#9D8C7D",
          "taupe-deep": "#6F6158",
          "sage-mist": "#C9D8D0",
          "soft-gold": "#D9BC7A",
          "text-primary": "#6F6158",
          "text-secondary": "#8E8177",
          "text-body": "#5F554F",
        },
        kete: {
          waihanga: "#CBB8A4", // Clay Sand — Construction
          manaaki: "#E6D8C6",  // Warm Linen — Hospitality
          pikau: "#B8C7B1",    // Soft Moss — Freight
          arataki: "#D5C0C8",  // Dusky Rose — Automotive
          auaha: "#C8DDD8",    // Pale Seafoam — Creative
          toroa: "#C7D9E8",    // Moonstone Blue — Family
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "24px",
        chip: "16px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(111, 97, 88, 0.08)",
        card: "0 4px 20px rgba(111, 97, 88, 0.06)",
        "card-hover": "0 8px 40px rgba(111, 97, 88, 0.12)",
        "brand-soft": "0 12px 40px rgba(111, 97, 88, 0.10)",
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
        "gentle-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "gentle-float": "gentle-float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
