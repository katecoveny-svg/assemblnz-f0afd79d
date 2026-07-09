import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { BrandConfig } from '@/lib/brand/brand-config';
import { BrandThemeProvider } from '@/lib/brand/BrandThemeProvider';
import { brandSlugs } from '@/lib/brand/configs';
import { TenantSwitch } from '@/components/ops/TenantSwitch';
import {
  ASSEMBL_GOLD,
  ASSEMBL_INK,
  ASSEMBL_PAPER,
  ASSEMBL_WARM_GREY,
  AssemblMotto,
  AssemblWordmark,
  MatarikiCluster,
  ParticulateBackdrop,
} from '@/components/assembl/chrome';
import { OsMotionField } from '@/components/ops/shared/OsMotion';

/**
 * OpsShell — the reusable chrome around every branded ops surface. Server
 * component; wraps children in <BrandThemeProvider> so widgets get CSS vars +
 * fonts. Accepts an optional `rightRail` slot; falls back to a demo panel.
 */
export function OpsShell({
  config,
  children,
  rightRail,
  nav: navOverride,
}: {
  config: BrandConfig;
  children: ReactNode;
  rightRail?: ReactNode;
  /** Sidebar nav. Each [label, path]; a path starting with '#' is an on-page
   *  anchor, otherwise it links to /customers/<slug>/ops/<path>. */
  nav?: Array<[string, string]>;
}) {
  const nav: Array<[string, string]> = navOverride ?? [
    ['Roster', 'roster'],
    ['CRM', 'crm'],
    ['Comms', 'comms'],
    ['Finance', 'finance'],
    ['Compliance', 'compliance'],
    ['Events', 'events'],
    ['Loyalty', 'loyalty'],
    ['Reports', 'reports'],
  ];

  const densityMap = {
    quiet: 'opacity-50 text-[10px]',
    medium: 'opacity-80 text-xs',
    bold: 'opacity-100 text-sm font-medium',
  } as const;

  // Aironaut pattern (freight icons on warm-stone) fights the navy shell bg —
  // scope the watermark to paper (Warm Stone) card interiors instead of the
  // shell. See public/brand/aironaut/README.md for the never-composite rule.
  const shellWatermark = config.slug !== 'aironaut' && config.patterns?.primary
    ? config.patterns.primary
    : null;

  return (
    <BrandThemeProvider config={config}>
      <div className="relative min-h-screen overflow-hidden bg-[color:var(--brand-bg)] text-[color:var(--brand-ink)] font-[family-name:var(--font-brand-body)]">
        <OsMotionField
          accent={config.colours.canary}
          secondary={config.colours.accent}
        />
        <header className="relative flex items-center gap-4 border-b border-black/5 bg-[color:var(--brand-surface)] px-6 py-3">
          <Link
            href={`/customers/${config.slug}/ops`}
            className="flex items-center gap-3 font-[family-name:var(--font-brand-display)]"
          >
            {config.logo.src.endsWith('.svg') ||
            config.logo.src.endsWith('.png') ? (
              // Never-composite rule: the circular mark is designed for
              // white or Warm Stone. Even though the header already sits on
              // Warm Stone, render the mark inside a small Warm Stone chip so
              // the rule holds if the header ever moves onto the navy shell.
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-md"
                style={{ backgroundColor: 'var(--brand-surface)' }}
                aria-hidden
              >
                <Image
                  src={config.logo.src}
                  alt={config.logo.alt}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </span>
            ) : (
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--brand-accent)] text-sm font-bold text-[color:var(--brand-surface)]"
                aria-hidden
              >
                {config.displayName.slice(0, 1)}
              </span>
            )}
            <span className="text-base font-semibold uppercase tracking-[0.16em]">
              {config.displayName}
            </span>
          </Link>
          {config.mascot ? (
            <span className="text-xs text-[color:var(--brand-muted)]">
              · {config.mascot.alt}
            </span>
          ) : null}
          {config.crossBrand.position === 'header-tag' ? (
            <span
              className={`ml-3 rounded-full bg-black/5 px-2 py-0.5 lowercase ${densityMap[config.crossBrand.density]}`}
              style={{ letterSpacing: '0.08em' }}
            >
              powered by <span className="font-mono">assembl</span>
              <span style={{ color: ASSEMBL_GOLD }}> ·</span>
            </span>
          ) : null}
          <div className="ml-auto">
            <TenantSwitch current={config.slug} slugs={brandSlugs} />
          </div>
        </header>

        <div className="relative grid grid-cols-12 gap-6 px-6 py-6">
          <aside className="col-span-12 md:col-span-2">
            <nav className="sticky top-6 flex flex-col gap-1 text-sm">
              {nav.map(([label, path]) => {
                // Support three nav shapes used across pilots:
                //   '#anchor'           → on-page hash
                //   '?tab=…' / '?x=…'   → query on the ops home (Family, Fred OS)
                //   'roster'            → /customers/<slug>/ops/roster
                const href =
                  path.startsWith('#') || path.startsWith('?')
                    ? `/customers/${config.slug}/ops${path}`
                    : `/customers/${config.slug}/ops/${path}`;
                return (
                  <Link
                    key={path || label}
                    href={href}
                    className="rounded-md px-3 py-2 text-[color:var(--brand-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--brand-ink)]"
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main
            className="relative col-span-12 flex flex-col gap-6 md:col-span-7"
            style={
              shellWatermark
                ? {
                    // Very subtle line-pattern watermark behind main content
                    // ONLY. Never on the header, sidebar, or right-rail.
                    // Skipped entirely for aironaut — its pattern lives on
                    // Warm Stone card interiors instead of the shell.
                    backgroundImage: `url(${shellWatermark})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '360px auto',
                    backgroundColor: 'var(--brand-bg)',
                  }
                : undefined
            }
          >
            {shellWatermark ? (
              // Warm-white scrim clamps pattern to ~6% visual weight — never
              // colour-fills the line art.
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{ backgroundColor: 'var(--brand-bg)', opacity: 0.94 }}
              />
            ) : null}
            <div className="relative rounded-2xl bg-[color:var(--brand-surface)]/60 px-4 py-3 text-sm text-[color:var(--brand-muted)]">
              {config.voice.greeting}
            </div>
            <div className="relative flex flex-col gap-6">{children}</div>
          </main>

          <aside className="col-span-12 flex flex-col gap-4 md:col-span-3">
            {rightRail}
          </aside>
        </div>

        {/* assembl signature band — DIRECTION-LOCKED-2026-07-01. Always paper
            white with the particulate landscape, regardless of tenant palette:
            this strip is the assembl-side chrome, not the customer's. */}
        <footer
          className="relative overflow-hidden border-t border-black/5 px-6 py-12 text-center"
          style={{ backgroundColor: ASSEMBL_PAPER, color: ASSEMBL_INK }}
        >
          <ParticulateBackdrop className="opacity-60" />
          <div className="relative flex flex-col items-center gap-5">
            <MatarikiCluster size={30} gold />
            <p
              className="mx-auto max-w-md text-[17px] lowercase leading-relaxed"
              // assembl-side chrome speaks in the assembl voice: the global
              // Cormorant face (--font-display), never the tenant's brand font.
              style={{
                fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              }}
            >
              the user sets the destination.
              <br />
              the agents read the signals.
              <br />
              the system finds a path.
              <br />
              the proof — receipts and mana — show the journey
              <span style={{ color: ASSEMBL_GOLD }}>.</span>
            </p>
            <AssemblMotto />
            <span className="text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
              ops surface by <AssemblWordmark /> · Aotearoa
            </span>
          </div>
        </footer>
      </div>
    </BrandThemeProvider>
  );
}
