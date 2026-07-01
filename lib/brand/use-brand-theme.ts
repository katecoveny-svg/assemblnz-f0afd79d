'use client';

import { createContext, useContext, useMemo } from 'react';
import type { BrandConfig } from '@/lib/brand/brand-config';
import { buildBrandCss } from '@/lib/brand/brand-css';

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

// buildBrandCss moved to lib/brand/brand-css.ts. This file is 'use client',
// so defining it here turned every server-side call into "Attempted to call
// buildBrandCss() from the server" — which killed OpsShell on all ops routes.
// Server components must import it from '@/lib/brand/brand-css' directly.

/**
 * Convenience client hook — memoise CSS for a config not fetched from context.
 * Rarely needed; prefer `useBrandTheme()` inside the shell.
 */
export function useBrandCss(config: BrandConfig): Record<string, string> {
  return useMemo(() => buildBrandCss(config), [config]);
}
