import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Roboto, Cormorant_Garamond, Space_Mono } from 'next/font/google';
import ops from './ops.module.css';
import { OpsSidebar } from '@/components/customers/everyday-rewards/ops-chrome';

/**
 * Everyday Rewards × Dash — Partner Operations console shell (back-of-house).
 *
 * The team-facing operator surface at /customers/everyday-rewards/ops. Unlike
 * the shopper demo under /dash (a phone frame), this is a desktop dashboard with
 * a left sidebar. Fonts are scoped here (same system as the dash layout). Global
 * assembl chrome is suppressed on /customers/* via isCustomerWorkspace, and the
 * whole /customers/everyday-rewards subtree sits behind the passphrase gate in
 * app/customers/everyday-rewards/layout.tsx.
 *
 * CONCEPT / DEMO ONLY — mocked data, no live Everyday Rewards / points calls.
 */

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--edr-body',
  display: 'swap',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--edr-display',
  display: 'swap',
});
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--edr-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Everyday Rewards × Dash — Partner Operations (concept)',
  description:
    'Concept back-of-house console for running an assembl Dash wait-moment partnership inside Everyday Rewards: sponsors, earn scheduling, points liability, analytics, compliance. Not a live Everyday Rewards asset.',
  robots: { index: false, follow: false },
};

export default function EverydayRewardsOpsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${roboto.variable} ${cormorant.variable} ${spaceMono.variable}`}>
      <div className={ops.shell}>
        <OpsSidebar />
        <main className={ops.main} style={{ position: 'relative' }}>
          {/* Customer wallpaper — shopper-icon line pattern at ~4% (the shared
              AI-OS framework layer). Sits behind all console content. */}
          <div
            aria-hidden
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: 'url(/brand/everyday-rewards/pattern-shopper-icons.png)',
              backgroundRepeat: 'repeat',
              backgroundSize: '420px auto',
              opacity: 0.04,
            }}
          />
          <div style={{ position: 'relative' }}>
            <div className={ops.conceptStrip}>
              Concept workspace · not an active Everyday Rewards partnership · shared in confidence
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
