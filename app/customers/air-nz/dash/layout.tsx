import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import styles from './airnz.module.css';
import { AirNzTabBar, ConceptCorner } from '@/components/customers/air-nz/chrome';

/**
 * Air New Zealand × Dash — hosted pilot workspace shell.
 *
 * A self-contained, phone-framed demo workspace under /customers/air-nz/dash.
 * The global assembl SiteHeader/SiteFooter are suppressed on /customers/* (see
 * isCustomerWorkspace in components/site/site-header + site-footer).
 *
 * Type system is scoped to this subtree — Söhne fallbacks per brand-notes v2:
 *   · Inter Tight  → body / UI            (--airnz-body)
 *   · Fraunces     → hero display (italic) (--airnz-display, Newzald fallback)
 *   · Cormorant    → assembl-side lockup   (--airnz-lockup)
 *
 * CONCEPT / DEMO ONLY — no live Air NZ partnership, mocked data throughout.
 */

const interTight = localFont({
  src: [
    { path: '../../../../lib/fonts/assets/inter-tight-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../../lib/fonts/assets/inter-tight-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../../lib/fonts/assets/inter-tight-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../../../lib/fonts/assets/inter-tight-normal.woff2', weight: '700', style: 'normal' },
  ],
  style: 'normal',
  variable: '--airnz-body',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Inter Tight Build Fallback'],
});

const fraunces = localFont({
  src: [
    { path: '../../../../lib/fonts/assets/fraunces-italic.woff2', weight: '500', style: 'italic' },
    { path: '../../../../lib/fonts/assets/fraunces-italic.woff2', weight: '600', style: 'italic' },
    { path: '../../../../lib/fonts/assets/fraunces-italic.woff2', weight: '900', style: 'italic' },
    { path: '../../../../lib/fonts/assets/fraunces-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../../lib/fonts/assets/fraunces-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../../../lib/fonts/assets/fraunces-normal.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--airnz-display',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Fraunces Build Fallback'],
});

const cormorant = localFont({
  src: [
    { path: '../../../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '600', style: 'normal' },
  ],
  style: 'normal',
  variable: '--airnz-lockup',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Cormorant Garamond Build Fallback'],
});

export const metadata: Metadata = {
  title: 'Air New Zealand × Dash — pilot workspace (concept)',
  description:
    'A concept demo of the assembl Dash attention network inside the Air New Zealand app. Wait states become Airpoints Dollars. Not a live Air NZ asset.',
  robots: { index: false, follow: false },
};

export default function AirNzDashLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${styles.root} ${interTight.variable} ${fraunces.variable} ${cormorant.variable}`}
    >
      <div className={styles.device}>
        {children}
        <AirNzTabBar />
      </div>
      <ConceptCorner />
    </div>
  );
}
