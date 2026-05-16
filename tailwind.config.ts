import type { Config } from 'tailwindcss';

/**
 * assembl — Mārama Whenua design system
 * Palette: Mārama Whenua (warm light)
 * Typography: Cormorant Garamond + Inter + IBM Plex Mono
 */

export default {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        serif: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 7vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 5vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '3rem', letterSpacing: '0' }],
        'body-lg': ['1.25rem', { lineHeight: '2rem', letterSpacing: '0' }],
        'body-md': ['1rem', { lineHeight: '1.625rem', letterSpacing: '0' }],
        eyebrow: ['0.8125rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        assembl: {
          paper: '#FAF7F2',
          ink: '#23211F',
          pounamu: '#2B6B57',
          clay: '#AC5838',
          mist: '#E8E4DE',
          shadow: '#B8B2A8',
          gold: '#D4A853',
        },
        kete: {
          waihanga: '#2B6B57',   // pounamu
          manaaki: '#AC5838',    // kokowai
          auaha: '#5B4FA0',      // kahurangi
          arataki: '#D4842A',    // karaka
          pikau: '#3B7CB5',      // kikorangi
          ako: '#6B5843',        // parauri
          matauranga: '#1A3A5C', // whenua tangaroa (Phase 7 Q2 canon, 13 May 2026 — 9th kete)
          hoko: '#7B3F8F',       // waiporoporo
          toro: '#23211F',       // mangu
          gold: '#D9BC7A',       // soft kete-gold accent — distinct from assembl.gold (#D4A853 hairlines)
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card: '24px',
        chip: '16px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(35, 33, 31, 0.08)',
        card: '0 4px 20px rgba(35, 33, 31, 0.06)',
        'card-hover': '0 8px 40px rgba(35, 33, 31, 0.12)',
        'brand-soft': '0 12px 40px rgba(35, 33, 31, 0.10)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0.6', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'gentle-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'gentle-float': 'gentle-float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
