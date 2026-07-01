'use client';

import { createContext, useContext, useMemo } from 'react';
import type { BrandConfig } from '@/lib/brand/brand-config';

/**
 * The theme context value exposed to widgets. `css` is a `React.CSSProperties`
 * object of the same `--brand-*` variables the provider applies inline, so
 * widgets can pass it to nested wrappers if they need to break out of the
 * ancestor's box (e.g. portals, popovers) and still get the right palette.
 */
export type BrandThemeValue = {
  config: BrandConfig;
  css: Record<string, string>;
};

export const BrandThemeContext = createContext<BrandThemeValue | null>(null);

export function useBrandTheme(): BrandThemeValue {
  const ctx = useContext(BrandThemeContext);
  if (!ctx) {
    throw new Error(
      'useBrandTheme() must be called inside <BrandThemeProvider>. Wrap your tree in <BrandThemeProvider /> from lib/brand/BrandThemeProvider.tsx.',
    );
  }
  return ctx;
}

/**
 * Build the inline `style` object from a `BrandConfig`. Server components can
 * import this without pulling the client context in.
 */
export function buildBrandCss(config: BrandConfig): Record<string, string> {
  return {
    '--brand-bg': config.colours.bg,
    '--brand-surface': config.colours.surface,
    '--brand-ink': config.colours.ink,
    '--brand-muted': config.colours.muted,
    '--brand-accent': config.colours.accent,
    '--brand-canary': config.colours.canary,
  };
}

/**
 * Convenience client hook — memoise CSS for a config not fetched from context.
 * Rarely needed; prefer `useBrandTheme()` inside the shell.
 */
export function useBrandCss(config: BrandConfig): Record<string, string> {
  return useMemo(() => buildBrandCss(config), [config]);
}
