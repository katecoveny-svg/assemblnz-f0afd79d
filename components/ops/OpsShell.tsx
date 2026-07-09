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
import { OpsShellClient } from '@/components/ops/OpsShellClient';

/**
 * OpsShell — reusable chrome around every branded ops surface.
 * Full-bleed brand pattern + framer ambient field + hover-lift nav.
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

  // Aironaut: pattern stays on Warm Stone card interiors (never-composite).
  const shellPattern =
    config.slug !== 'aironaut' && config.patterns?.primary
      ? config.patterns.primary
      : null;

  return (
    <BrandThemeProvider config={config}>
      <div
        className="relative min-h-screen overflow-hidden bg-[color:var(--brand-bg)] text-[color:var(--brand-ink)] font-[family-name:var(--font-brand-body)]"
        data-os-shell={config.slug}
      >
        {shellPattern ? (
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-0"
            style={{
              backgroundImage: `url(${shellPattern})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '380px auto',
              opacity: 0.1,
              mixBlendMode: 'multiply',
            }}
          />
        ) : null}
        <OsMotionField
          accent={config.colours.canary}
          secondary={config.colours.accent}
          intensity="medium"
        />

        <header className="relative z-[2] flex items-center gap-4 border-b border-black/5 bg-[color:var(--brand-surface)]/85 px-6 py-3 backdrop-blur-md">
          <Link
            href={`/customers/${config.slug}/ops`}
            className="group flex items-center gap-3 font-[family-name:var(--font-brand-display)] transition-transform hover:-translate-y-0.5"
          >
            {config.logo.src.endsWith('.svg') ||
            config.logo.src.endsWith('.png') ? (
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-md shadow-sm transition-shadow group-hover:shadow-md"
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brand-accent)] text-sm font-bold text-[color:var(--brand-surface)] shadow-sm transition-transform group-hover:scale-105"
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

        <OpsShellClient
          slug={config.slug}
          nav={nav}
          greeting={config.voice.greeting}
          accent={config.colours.accent}
          shellPattern={shellPattern}
          rightRail={rightRail}
        >
          {children}
        </OpsShellClient>

        <footer
          className="relative z-[2] overflow-hidden border-t border-black/5 px-6 py-12 text-center"
          style={{ backgroundColor: ASSEMBL_PAPER, color: ASSEMBL_INK }}
        >
          <ParticulateBackdrop className="opacity-60" />
          <div className="relative flex flex-col items-center gap-5">
            <MatarikiCluster size={30} gold />
            <p
              className="mx-auto max-w-md text-[17px] lowercase leading-relaxed"
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
