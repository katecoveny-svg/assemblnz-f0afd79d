import Link from 'next/link';
import type { ReactNode } from 'react';
import type { BrandConfig } from '@/lib/brand/brand-config';
import { BrandThemeProvider } from '@/lib/brand/BrandThemeProvider';
import { brandSlugs } from '@/lib/brand/configs';
import { TenantSwitch } from '@/components/ops/TenantSwitch';

/**
 * OpsShell — the reusable chrome around every branded ops surface. Server
 * component; wraps children in <BrandThemeProvider> so widgets get CSS vars +
 * fonts. Accepts an optional `rightRail` slot; falls back to a demo panel.
 */
export function OpsShell({
  config,
  children,
  rightRail,
}: {
  config: BrandConfig;
  children: ReactNode;
  rightRail?: ReactNode;
}) {
  const nav: Array<[string, string]> = [
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

  return (
    <BrandThemeProvider config={config}>
      <div className="min-h-screen bg-[color:var(--brand-bg)] text-[color:var(--brand-ink)] font-[family-name:var(--font-brand-body)]">
        <header className="flex items-center gap-4 border-b border-black/5 bg-[color:var(--brand-surface)] px-6 py-3">
          <Link
            href={`/customers/${config.slug}/ops`}
            className="flex items-center gap-3 font-[family-name:var(--font-brand-display)]"
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--brand-accent)] text-sm font-bold text-[color:var(--brand-surface)]"
              aria-hidden
            >
              {config.displayName.slice(0, 1)}
            </span>
            <span className="text-base font-semibold">{config.displayName}</span>
          </Link>
          {config.mascot ? (
            <span className="text-xs text-[color:var(--brand-muted)]">
              · {config.mascot.alt}
            </span>
          ) : null}
          {config.crossBrand.position === 'header-tag' ? (
            <span
              className={`ml-3 rounded-full bg-black/5 px-2 py-0.5 ${densityMap[config.crossBrand.density]}`}
            >
              powered by assembl
            </span>
          ) : null}
          <div className="ml-auto">
            <TenantSwitch current={config.slug} slugs={brandSlugs} />
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 px-6 py-6">
          <aside className="col-span-12 md:col-span-2">
            <nav className="sticky top-6 flex flex-col gap-1 text-sm">
              {nav.map(([label, path]) => (
                <Link
                  key={path}
                  href={`/customers/${config.slug}/ops/${path}`}
                  className="rounded-md px-3 py-2 text-[color:var(--brand-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--brand-ink)]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </aside>

          <main
            className="relative col-span-12 flex flex-col gap-6 md:col-span-7"
            style={
              config.patterns?.primary
                ? {
                    // Very subtle line-pattern watermark behind main content
                    // ONLY. Never on the header, sidebar, or right-rail.
                    backgroundImage: `url(${config.patterns.primary})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '360px auto',
                    backgroundColor: 'var(--brand-bg)',
                  }
                : undefined
            }
          >
            {config.patterns?.primary ? (
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
            {rightRail ?? (
              <div className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-4">
                <h4 className="text-sm font-semibold">Right rail</h4>
                <p className="mt-1 text-xs text-[color:var(--brand-muted)]">
                  Pass a `rightRail` prop to fill this column.
                </p>
              </div>
            )}
          </aside>
        </div>

        <footer className="border-t border-black/5 bg-[color:var(--brand-surface)] px-6 py-4 text-center">
          <span className={`text-[color:var(--brand-muted)] ${densityMap[config.crossBrand.density]}`}>
            Ops surface by <span className="font-mono">assembl</span>
          </span>
        </footer>
      </div>
    </BrandThemeProvider>
  );
}
