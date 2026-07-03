import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Montserrat, Cormorant_Garamond } from 'next/font/google';
import styles from './contact.module.css';
import { CreditsProvider } from '@/components/customers/contact-energy/CreditsProvider';
import {
  ConceptCorner,
  ConceptTop,
  ContactSidebar,
  CreditsCorner,
} from '@/components/customers/contact-energy/chrome';

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

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--contact-body',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--contact-lockup',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Contact Energy × Assembling — pitch concept (demo)',
  description:
    'A concept demo of the assembl earn layer inside the Contact Energy app: loading moments become bill credits. Not a live Contact Energy asset — no partnership exists.',
  robots: { index: false, follow: false },
};

export default function ContactEnergyLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.root} ${montserrat.variable} ${cormorant.variable}`}>
      <CreditsProvider>
        <ConceptTop />
        <div className={styles.shell}>
          <ContactSidebar />
          {children}
        </div>
        <CreditsCorner />
        <ConceptCorner />
      </CreditsProvider>
    </div>
  );
}
