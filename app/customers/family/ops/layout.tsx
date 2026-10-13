import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { OpsShell } from '@/components/ops/OpsShell';
import { tenantPwaMetadata } from '@/lib/pwa/apple';

export const metadata: Metadata = {
  title: 'Family OS — the whānau operating system (concept) · assembl',
  description: 'Explore a read-only family demonstration with synthetic profiles and examples. No real household records or connected services.',
  robots: { index: false, follow: false },
  ...tenantPwaMetadata('family', 'Family OS'),
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

/** Synthetic demonstration shell; each navigation entry selects a read-only example section. */
const NAV: Array<[string, string]> = [
  ['Week', '?tab=week'],
  ['Rides', '?tab=rides'],
  ['Kitchen', '?tab=kitchen'],
  ['Money', '?tab=money'],
  ['Inbox', '?tab=inbox'],
  ['Genome', '?tab=genome'],
];

export default function FamilyOpsLayout({ children }: { children: ReactNode }) {
  const config = getBrandConfig('family');
  if (!config) notFound();
  return (
    <OpsShell
      config={{ ...config, voice: { ...config.voice, greeting: 'Explore fictional examples. Nothing is connected or saved.' } }}
      nav={NAV}
      rightRail={
        <div className="rounded-2xl border border-[#bfa37a]/40 bg-[color:var(--brand-surface)] p-4">
          <p className="text-[12px] uppercase tracking-[0.18em] text-[color:var(--brand-muted)]">how it works</p>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--brand-muted)]">
            All profiles and examples are fictional. The sections illustrate a possible family workflow;
            uploads, saved records, connections and action controls are not available in this demonstration.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--brand-muted)]">
            Demo access does not grant access to a real family workspace.
          </p>
        </div>
      }
    >
      {children}
    </OpsShell>
  );
}
