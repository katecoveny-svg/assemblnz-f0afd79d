type FontFallback = {
  className: string;
  variable: string;
  style: { fontFamily: string };
};

type FontOptions = Record<string, unknown>;

const sans = (_options?: FontOptions): FontFallback => ({
  className: 'font-sans',
  variable: 'font-sans',
  style: { fontFamily: 'var(--font-body), Arial, sans-serif' },
});

const serif = (_options?: FontOptions): FontFallback => ({
  className: 'font-serif',
  variable: 'font-serif',
  style: { fontFamily: 'Georgia, serif' },
});

const mono = (_options?: FontOptions): FontFallback => ({
  className: 'font-mono',
  variable: 'font-mono',
  style: { fontFamily: 'var(--font-mono), monospace' },
});

// Stable fallbacks for legacy concept routes whose historic Google font URLs
// are no longer consistently available during production builds. The public
// assembl type system remains self-hosted by next/font in app/layout.tsx.
export const Cormorant_Garamond = serif;
export const Fraunces = serif;
export const IBM_Plex_Mono = mono;
export const Inter = sans;
export const Inter_Tight = sans;
export const Montserrat = sans;
export const Roboto = sans;
export const Space_Mono = mono;
