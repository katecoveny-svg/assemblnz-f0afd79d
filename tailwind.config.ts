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
        "2xl": "1200px",
      },
    },
    extend: {
      fontFamily: {
        // Brand Guidelines v1.0 (locked 2026-04-22)
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
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
        // Whenua palette — retired teal/ochre, now mapped to Brand v1.0 neutrals
        whenua: {
          kowhai: '#D9BC7A',
          'kowhai-light': '#E6CFA0',
          pounamu: '#9D8C7D',
          'pounamu-light': '#B5A89B',
          tangaroa: '#6F6158',
          'tangaroa-light': '#8E8177',
          rust: '#C85A54',
        },
        assembl: {
          // Canonical Brand Guidelines v1.0 tokens (locked 2026-04-22)
          mist: 'hsl(var(--assembl-mist))',
          cloud: 'hsl(var(--assembl-cloud))',
          sand: 'hsl(var(--assembl-sand))',
          taupe: 'hsl(var(--assembl-taupe))',
          'taupe-deep': 'hsl(var(--assembl-taupe-deep))',
          'sage-mist': 'hsl(var(--assembl-sage-mist))',
          'soft-gold': 'hsl(var(--assembl-soft-gold))',
          'text-primary': 'hsl(var(--assembl-text-primary))',
          'text-secondary': 'hsl(var(--assembl-text-secondary))',
          'text-body': 'hsl(var(--assembl-text-body))',
          // Legacy aliases retargeted
          bg: '#F7F3EE',
          surface: '#FFFFFF',
          'surface-2': '#EEE7DE',
        },
        kete: {
          pikau: 'hsl(var(--kete-pikau))',
          hoko: 'hsl(var(--kete-hoko))',
          ako: 'hsl(var(--kete-ako))',
          toro: 'hsl(var(--kete-toro))',
          manaaki: 'hsl(var(--kete-manaaki))',
          waihanga: 'hsl(var(--kete-waihanga))',
          arataki: 'hsl(var(--kete-arataki))',
          auaha: 'hsl(var(--kete-auaha))',
        },
        industry: {
          pikau: 'hsl(var(--industry-pikau))',
          hoko: 'hsl(var(--industry-hoko))',
          ako: 'hsl(var(--industry-ako))',
          toro: 'hsl(var(--industry-toro))',
          manaaki: 'hsl(var(--industry-manaaki))',
          waihanga: 'hsl(var(--industry-waihanga))',
          arataki: 'hsl(var(--industry-arataki))',
          auaha: 'hsl(var(--industry-auaha))',
        },
        neon: {
          // Retired — all aliases now map to Taupe + status palette
          green: "#9D8C7D",
          pink: "#C85A54",
          cyan: "#6F6158",
          orange: "#D9BC7A",
          lime: "#9D8C7D",
          red: "#C85A54",
          gold: "#D9BC7A",
          teal: "#9D8C7D",
          blue: "#6F6158",
          amber: "#D9BC7A",
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
        card: "var(--assembl-radius-card)",
        chip: "var(--assembl-radius-chip)",
        pill: "var(--assembl-radius-pill)",
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
