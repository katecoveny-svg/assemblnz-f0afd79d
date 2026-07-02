import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { BrandThemeProvider } from '@/lib/brand/BrandThemeProvider';
import { getBrandConfig } from '@/lib/brand/configs';
import {
  ASSEMBL_INK,
  ASSEMBL_PAPER,
  ASSEMBL_WARM_GREY,
  AssemblMotto,
  AssemblWordmark,
  MatarikiCluster,
  ParticulateBackdrop,
} from '@/components/assembl/chrome';
import { TenantPwa } from '@/components/customers/TenantPwa';
import { tenantPwaMetadata } from '@/lib/pwa/apple';

export const metadata: Metadata = {
  title: 'Happy Tails — AI operating system (concept pilot) · assembl',
  description:
    'Concept pilot: the AI operating system for Happy Tails doggy daycare. Draft-only — nothing sends without a human yes.',
  robots: { index: false, follow: false },
  // Installable PWA: iOS icon/splash/meta. The manifest link + scoped service
  // worker are wired client-side by <TenantPwa /> (host-aware paths).
  ...tenantPwaMetadata('happy-tails', 'Happy Tails'),
};

/**
 * Happy Tails workspace shell — the AI-OS layer stack:
 *   1. assembl OS chrome (paper, particulate, Cormorant) — identical across pilots.
 *   2. Customer wallpaper — the tails-and-paws line pattern at ~4%, tiled.
 *   3. Customer accent — warm brown in two places only (CTA + status dot).
 *
 * NOTE: this replaces the old pin-slug OpsShell reuse for the LANDING only.
 * The deeper console pages (roster / crm / …) resolve through the dynamic
 * [slug]/ops branch and keep the full OpsShell chrome.
 */
export default function HappyTailsOpsLayout({ children }: { children: ReactNode }) {
  const config = getBrandConfig('happy-tails');
  if (!config) notFound();

  return (
    <BrandThemeProvider config={config}>
      <TenantPwa slug="happy-tails" />
      <div
        className="relative min-h-screen"
        style={{ backgroundColor: ASSEMBL_PAPER, color: ASSEMBL_INK }}
      >
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0"
          style={{
            backgroundImage: 'url(/brand/happy-tails/pattern-tails-and-paws.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '420px auto',
            opacity: 0.04,
          }}
        />

        <div className="relative">{children}</div>

        <footer
          className="relative overflow-hidden border-t border-black/5 px-6 py-12 text-center"
          style={{ backgroundColor: ASSEMBL_PAPER }}
        >
          <ParticulateBackdrop className="opacity-60" />
          <div className="relative flex flex-col items-center gap-4">
            <MatarikiCluster size={30} gold />
            <AssemblMotto />
            <span className="text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
              <AssemblWordmark /> × Happy Tails · concept pilot · Aotearoa
            </span>
          </div>
        </footer>
      </div>
    </BrandThemeProvider>
  );
}
