import type { Config } from "tailwindcss";

/**
 * Assembl — Feather Kete Design System
 * "Quiet intelligence. Time returned."
 *
 * Palette: Mārama Whenua (warm light)
 * Typography: Cormorant Garamond (display) + Inter (body) + IBM Plex Mono (code)
 * Updated: 24 April 2026
 */

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
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
        // Primary typography stack
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        // Aliases for convenience
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // shadcn/ui semantic tokens (driven by CSS variables)
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
        // ── Mārama Whenua palette (direct access) ──
        assembl: {
          mist: '#F7F3EE',
          cloud: '#EEE7DE',
          sand: '#D8C8B4',
          taupe: '#9D8C7D',
          'taupe-deep': '#6F6158',
          'sage-mist': '#C9D8D0',
          'soft-gold': '#D9BC7A',
          // Text aliases (preserved — referenced by 3 components)
          'text-primary': '#6F6158',
          'text-secondary': '#8E8177',
          'text-body': '#5F554F',
        },
        // ── Industry kete accent colours (canonical palette) ──
        kete: {
          waihanga: '#D4B896',    // Clay Sand — Construction
          manaaki: '#8FB09A',     // Harakeke Green — Hospitality
          arataki: '#B8A0C4',     // Dusk Mauve — Automotive & Fleet
          toro: '#C7D9E8',        // Moonstone Blue — Family
          auaha: '#E0A88C',       // Sunset Coral — Creative
          pikau: '#9EAAB4',       // Storm Grey — Freight & Customs
          ako: '#E4B8C4',         // Petal Pink — Early Childhood
          reo: '#D9BC7A',         // Kowhai Soft — Te Kahui Reo
          // Legacy aliases (preserved for backwards compatibility)
          hoko: '#D8C3C2',        // Blush Stone — Retail
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
        'soft': '0 8px 30px rgba(111, 97, 88, 0.08)',
        'card': '0 4px 20px rgba(111, 97, 88, 0.06)',
        'card-hover': '0 8px 40px rgba(111, 97, 88, 0.12)',
        'gold-glow': '0 0 20px rgba(217, 188, 122, 0.15)',
      },
      backdropBlur: {
        'surface': '24px',
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
        "sparkle": {
          "0%, 100%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        "shimmer-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "gentle-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "sparkle": "sparkle 3s ease-in-out infinite",
        "shimmer-sweep": "shimmer-sweep 4s ease-in-out infinite",
        "gentle-float": "gentle-float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
