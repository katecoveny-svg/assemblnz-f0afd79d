import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { OpsShell } from '@/components/ops/OpsShell';
import { tenantPwaMetadata } from '@/lib/pwa/apple';

export const metadata: Metadata = {
  title: 'Family OS — the whānau operating system (concept) · assembl',
  description: 'Forward a school newsletter and get the family week: events, pickups, shopping, approvals. Draft-only — the agent proposes, you approve.',
  robots: { index: false, follow: false },
  ...tenantPwaMetadata('family', 'Family OS'),
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

/**
 * Family OS workspace shell. Warm cream + gold in the luminous direction; the
 * whole surface is the family operating system, so no right rail — the
 * dashboard fills the canvas.
 *
 * The sidebar mirrors the in-page tab bar: each entry loads one section as its
 * own server-rendered view via ?tab=…, instead of the old on-page #anchors that
 * scrolled the whole (very tall) dashboard. Five tabs, one section at a time.
 */
const NAV: Array<[string, string]> = [
  ['Week', '?tab=week'],
  ['Rides', '?tab=rides'],
  ['Kitchen', '?tab=kitchen'],
  ['Money', '?tab=money'],
  ['Inbox', '?tab=inbox'],
];

export default function FamilyOpsLayout({ children }: { children: ReactNode }) {
  const config = getBrandConfig('family');
  if (!config) notFound();
  return (
    <OpsShell
      config={config}
      nav={NAV}
      rightRail={
        <div className="rounded-2xl border border-[#bfa37a]/40 bg-[color:var(--brand-surface)] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--brand-muted)]">how it works</p>
          <ol className="mt-3 flex flex-col gap-2.5 text-[12.5px] leading-relaxed text-[color:var(--brand-ink)]">
            <li><strong>1. Forward</strong> a school newsletter (or paste it).</li>
            <li><strong>2. I propose</strong> the week — events, pickups, shopping, what to sign &amp; pay.</li>
            <li><strong>3. You approve</strong> the bits you want.</li>
            <li><strong>4. I hand off</strong> — add to calendar, a maps/Uber route, a Woolworths list.</li>
          </ol>
          <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--brand-muted)]">
            Nothing books, pays or sends on its own. Anything with money, transport, messaging or shopping
            waits in your approval queue.
          </p>
        </div>
      }
    >
      {children}
    </OpsShell>
  );
}
