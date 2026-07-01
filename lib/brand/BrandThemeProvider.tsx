import type { CSSProperties, ReactNode } from 'react';
import type { BrandConfig } from '@/lib/brand/brand-config';
import { getBrandFonts } from '@/lib/brand/fonts';
import { buildBrandCss } from '@/lib/brand/use-brand-theme';
import { BrandThemeContextClient } from '@/lib/brand/BrandThemeContextClient';

/**
 * Server component: applies the brand's palette (as CSS variables) and the
 * `next/font` variable classnames to a wrapping div, then hands the config +
 * inline css down to widgets via a client context provider.
 *
 * Widgets should read colours as `var(--brand-ink)` etc. (or via arbitrary
 * Tailwind properties like `text-[color:var(--brand-ink)]`).
 */
export function BrandThemeProvider({
  config,
  children,
}: {
  config: BrandConfig;
  children: ReactNode;
}) {
  const css = buildBrandCss(config);
  const fonts = getBrandFonts(config.slug);
  const fontClasses = [fonts.display.variable, fonts.body.variable, fonts.mono.variable].join(
    ' ',
  );

  return (
    <div
      className={`brand-theme ${fontClasses}`}
      style={css as CSSProperties}
      data-brand={config.slug}
    >
      <BrandThemeContextClient value={{ config, css }}>{children}</BrandThemeContextClient>
    </div>
  );
}
