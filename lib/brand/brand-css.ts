import type { BrandConfig } from '@/lib/brand/brand-config';

/**
 * Build the inline `style` object of `--brand-*` CSS variables from a
 * `BrandConfig`.
 *
 * Lives in its own module WITHOUT 'use client' on purpose: the server
 * component <BrandThemeProvider> calls it during render. When it lived inside
 * use-brand-theme.ts (a 'use client' module) every server-side call threw
 * "Attempted to call buildBrandCss() from the server", which killed OpsShell
 * on every /customers/[slug]/ops route — no chrome, no brand variables.
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
