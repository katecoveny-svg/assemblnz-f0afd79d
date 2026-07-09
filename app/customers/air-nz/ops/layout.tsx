import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter_Tight, Fraunces, Cormorant_Garamond } from 'next/font/google';
import rootStyles from '../dash/airnz.module.css';
import ops from './ops.module.css';
import { OpsSidebar } from '@/components/customers/air-nz/ops-chrome';
import { InviteGreeting } from '@/components/ops/InviteGreeting';
import { OsMotionField } from '@/components/ops/shared/OsMotion';
import { getBrandConfig } from '@/lib/brand/configs';

/**
 * Air New Zealand × Dash — Partner Operations console shell (back-of-house).
 *
 * The team-facing operator surface at /customers/air-nz/ops. Unlike the
 * passenger demo under /dash (a phone frame), this is a desktop dashboard with
 * a left sidebar. It reuses the `.root` token scope + font variables from the
 * shared Air NZ CSS module (dash/airnz.module.css) so the two surfaces stay on
 * one design system. Global assembl chrome is suppressed on /customers/* via
 * isCustomerWorkspace.
 *
 * CONCEPT / DEMO ONLY — mocked data, no live Air NZ / Koru / Airpoints calls.
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
  title: 'Air New Zealand × Dash — Partner Operations (concept)',
  description:
    'Concept back-of-house console for running an assembl Dash partnership inside Air New Zealand: sponsors, campaigns, revenue split, analytics, compliance. Not a live Air NZ asset.',
  robots: { index: false, follow: false },
};

export default function AirNzOpsLayout({ children }: { children: ReactNode }) {
  const brand = getBrandConfig('air-nz');
  return (
    <div
      className={`${rootStyles.root} ${interTight.variable} ${fraunces.variable} ${cormorant.variable}`}
    >
      <div className={ops.shell}>
        <OpsSidebar />
        <main className={ops.main} style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Customer wallpaper — flight-icon line pattern (the shared
              OS framework layer). Sits behind all console content. */}
          <div
            aria-hidden
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: 'url(/brand/air-nz/pattern-flight-icons.png)',
              backgroundRepeat: 'repeat',
              backgroundSize: '420px auto',
              opacity: 0.07,
            }}
          />
          <OsMotionField
            accent={brand?.colours.canary ?? '#BFA37A'}
            secondary={brand?.colours.accent ?? '#0B4A56'}
            intensity="soft"
          />
          <div style={{ position: 'relative' }}>
            <InviteGreeting demo="air-nz" />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
