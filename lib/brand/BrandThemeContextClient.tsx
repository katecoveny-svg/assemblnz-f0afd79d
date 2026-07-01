'use client';

import { BrandThemeContext, type BrandThemeValue } from '@/lib/brand/use-brand-theme';

/**
 * Client-only wrapper around the React Context Provider. Kept as a leaf so the
 * server component `<BrandThemeProvider>` can stay a server component and only
 * cross the boundary once.
 */
export function BrandThemeContextClient({
  value,
  children,
}: {
  value: BrandThemeValue;
  children: React.ReactNode;
}) {
  return (
    <BrandThemeContext.Provider value={value}>
      {children}
    </BrandThemeContext.Provider>
  );
}
