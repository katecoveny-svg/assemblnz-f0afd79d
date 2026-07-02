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

export const metadata: Metadata = {
  title: 'AIRONAUT — AI operating system (concept pilot) · assembl',
  description:
    'Concept pilot: the AI operating system for Aironaut Customs Brokers. Draft-only — nothing lodges, nothing sends.',
  robots: { index: false, follow: false },
};

/**
 * AIRONAUT workspace shell — the AI-OS layer stack
 * (project_ai_os_positioning, 2026-07-01):
 *
 *   1. assembl OS chrome — paper white, particulate art, Cormorant lowercase.
 *      Identical across every pilot. It's the OS.
 *   2. Customer wallpaper — Aironaut's freight-icon line pattern at ~4%,
 *      fixed, tiled. The fingerprint of whose OS this is.
 *   3. Customer accent — Burnt Orange in exactly two places: the primary CTA
 *      and the live status dot. Never dominant.
 */
export default function AironautOpsLayout({ children }: { children: ReactNode }) {
  const config = getBrandConfig('aironaut');
  if (!config) notFound();

  return (
    <BrandThemeProvider config={config}>
      <div
        className="relative min-h-screen"
        style={{ backgroundColor: ASSEMBL_PAPER, color: ASSEMBL_INK }}
      >
        {/* Layer 2 — customer wallpaper: ink line pattern, ~4%, never colour-filled. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0"
          style={{
            backgroundImage: 'url(/brand/aironaut/pattern-freight-icons.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '420px auto',
            opacity: 0.04,
          }}
        />

        <div className="relative">{children}</div>

        {/* Layer 1 — assembl OS signature band + quiet cross-brand lockup. */}
        <footer
          className="relative overflow-hidden border-t border-black/5 px-6 py-12 text-center"
          style={{ backgroundColor: ASSEMBL_PAPER }}
        >
          <ParticulateBackdrop className="opacity-60" />
          <div className="relative flex flex-col items-center gap-4">
            <MatarikiCluster size={30} gold />
            <AssemblMotto />
            <span className="text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
              <AssemblWordmark /> × AIRONAUT · concept pilot · Aotearoa
            </span>
          </div>
        </footer>
      </div>
    </BrandThemeProvider>
  );
}
