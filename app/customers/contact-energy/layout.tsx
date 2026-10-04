import localFont from 'next/font/local';
import { contactLockup as cormorant } from '@/lib/fonts/customer-lockups';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import styles from './contact.module.css';
import { CreditsProvider } from '@/components/customers/contact-energy/CreditsProvider';
import {
  ConceptCorner,
  ConceptTop,
  ContactSidebar,
  CreditsCorner,
} from '@/components/customers/contact-energy/chrome';
import { OsMotionField } from '@/components/ops/shared/OsMotion';
import { getBrandConfig } from '@/lib/brand/configs';

/**
 * Contact Energy × Assembling — hosted pitch-concept workspace shell.
 *
 * A self-contained demo under /customers/contact-energy. The global assembl
 * SiteHeader/SiteFooter are suppressed on /customers/* (see isCustomerWorkspace
 * in components/site/site-header + site-footer). Gated by the shared demo
 * basic-auth + magic-link middleware like every other pilot.
 *
 * Type system scoped to this subtree — verified from contact.co.nz:
 *   · Montserrat → everything Contact (900 headings)   (--contact-body)
 *   · Cormorant  → the assembl-side lockup only        (--contact-lockup)
 *
 * TIER-2 SLICE, CONCEPT ONLY — Contact Energy is a pitch target, not a
 * customer. Fictional account, illustrative figures, no real credits.
 */

const montserrat = localFont({
  src: [
    { path: '../../../lib/fonts/assets/montserrat-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../lib/fonts/assets/montserrat-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../lib/fonts/assets/montserrat-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../../lib/fonts/assets/montserrat-normal.woff2', weight: '700', style: 'normal' },
    { path: '../../../lib/fonts/assets/montserrat-normal.woff2', weight: '900', style: 'normal' },
  ],
  style: 'normal',
  variable: '--contact-body',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Montserrat Build Fallback'],
});


export const metadata: Metadata = {
  title: 'Contact Energy × Assembling — pitch concept (demo)',
  description:
    'A concept demo of the assembl earn layer inside the Contact Energy app: loading moments become bill credits. Not a live Contact Energy asset — no partnership exists.',
  robots: { index: false, follow: false },
};

export default function ContactEnergyLayout({ children }: { children: ReactNode }) {
  const brand = getBrandConfig('contact-energy');
  const pattern = brand?.patterns?.primary ?? '/brand/contact-energy/pattern-switch.svg';

  return (
    <div
      className={`${styles.root} ${montserrat.variable} ${cormorant.variable}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `url(${pattern})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '360px auto',
          opacity: 0.07,
          zIndex: 0,
        }}
      />
      <OsMotionField
        accent={brand?.colours.canary ?? '#b8964f'}
        secondary={brand?.colours.accent ?? '#C8102E'}
        intensity="soft"
        className="z-[0]"
      />
      <CreditsProvider>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <ConceptTop />
          <div className={styles.shell}>
            <ContactSidebar />
            {children}
          </div>
          <CreditsCorner />
          <ConceptCorner />
        </div>
      </CreditsProvider>
    </div>
  );
}
