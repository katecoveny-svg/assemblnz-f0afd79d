import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter_Tight, Fraunces, Cormorant_Garamond } from '@/lib/font-fallbacks';
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

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--airnz-body',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '900'],
  style: ['italic', 'normal'],
  variable: '--airnz-display',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal'],
  variable: '--airnz-lockup',
  display: 'swap',
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
