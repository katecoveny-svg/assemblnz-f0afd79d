import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { BrandThemeProvider } from '@/lib/brand/BrandThemeProvider';
import { getBrandConfig } from '@/lib/brand/configs';
import { InviteGreeting } from '@/components/ops/InviteGreeting';
import { OsMotionField } from '@/components/ops/shared/OsMotion';
import {
  ASSEMBL_INK,
  ASSEMBL_PAPER,
  ASSEMBL_WARM_GREY,
  AssemblMotto,
  AssemblWordmark,
  MatarikiCluster,
  ParticulateBackdrop,
} from '@/components/assembl/chrome';

export const metadata: Metadata = {
  title: 'Auckland Zoo × Keeper — AI operating system (concept) · assembl',
  description:
    'Concept pilot: an AI operating system for a keeping team. Not affiliated with or endorsed by Auckland Zoo. Draft-only.',
  robots: { index: false, follow: false },
};

/**
 * Auckland Zoo keeper workspace shell — the AI-OS layer stack:
 *   1. assembl OS chrome (paper, particulate, Cormorant) — identical across pilots.
 *   2. Customer wallpaper — the safari-animals line pattern at ~4%, tiled.
 *   3. Customer accent — safari orange in two places only (CTA + status dot).
 *
 * The subtree passphrase gate in app/customers/auckland-zoo/layout.tsx stays
 * in front of everything here. Kaumātua-hold on taonga species holds.
 */
export default function AucklandZooOpsLayout({ children }: { children: ReactNode }) {
  const config = getBrandConfig('auckland-zoo');
  if (!config) notFound();

  return (
    <BrandThemeProvider config={config}>
      <div
        className="relative min-h-screen"
        style={{ backgroundColor: ASSEMBL_PAPER, color: ASSEMBL_INK }}
      >
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0"
          style={{
            backgroundImage: 'url(/brand/auckland-zoo/pattern-safari-animals.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '420px auto',
            opacity: 0.08,
          }}
        />
        <OsMotionField
          accent={config.colours.canary}
          secondary={config.colours.accent}
          intensity="medium"
        />

        <div className="relative">
          <InviteGreeting demo="auckland-zoo" />
          {children}
        </div>

        <footer
          className="relative overflow-hidden border-t border-black/5 px-6 py-12 text-center"
          style={{ backgroundColor: ASSEMBL_PAPER }}
        >
          <ParticulateBackdrop className="opacity-60" />
          <div className="relative flex flex-col items-center gap-4">
            <MatarikiCluster size={30} gold />
            <AssemblMotto />
            <span className="text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
              <AssemblWordmark /> × Auckland Zoo · concept · not affiliated with
              or endorsed by Auckland Zoo · Aotearoa
            </span>
          </div>
        </footer>
      </div>
    </BrandThemeProvider>
  );
}
