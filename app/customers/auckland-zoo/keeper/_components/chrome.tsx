'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BASE = '/customers/auckland-zoo/keeper';

type NavItem = { href: string; label: string };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: 'Today',
    items: [
      { href: BASE, label: 'Dashboard' },
      { href: `${BASE}/brief`, label: 'Leadership brief' },
    ],
  },
  {
    title: 'Animals',
    items: [
      { href: `${BASE}/species`, label: 'Species' },
      { href: `${BASE}/clinical`, label: 'Clinical notes' },
      { href: `${BASE}/welfare`, label: 'Welfare' },
      { href: `${BASE}/breeding`, label: 'Breeding calendar' },
      { href: `${BASE}/transfers`, label: 'Transfers' },
      { href: `${BASE}/enclosures`, label: 'Enclosure H&S' },
    ],
  },
  {
    title: 'People',
    items: [
      { href: `${BASE}/roster`, label: 'Staff & rosters' },
      { href: `${BASE}/payroll`, label: 'Payroll' },
      { href: `${BASE}/volunteers`, label: 'Volunteers' },
      { href: `${BASE}/recognition`, label: 'Recognition' },
    ],
  },
  {
    title: 'Public',
    items: [
      { href: `${BASE}/education`, label: 'Visitor education' },
      { href: `${BASE}/events`, label: 'Events & programmes' },
      { href: `${BASE}/visitor-comms`, label: 'Visitor comms' },
    ],
  },
  {
    title: 'Organisation',
    items: [
      { href: `${BASE}/nzccm`, label: 'NZCCM' },
      { href: `${BASE}/finance`, label: 'Finance' },
    ],
  },
];

const FLAT_NAV = NAV.flatMap((g) => g.items);

function isActive(pathname: string, href: string) {
  return href === BASE ? pathname === BASE : pathname.startsWith(href);
}

export function ConceptBanner() {
  return (
    <div
      className="w-full px-5 py-2 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] md:px-8"
      style={{ background: 'var(--tenant-primary-deep)', color: 'rgba(255,255,255,0.86)' }}
    >
      Concept · pending — demo workspace, not a live Auckland Zoo partnership. Every output is an unsigned draft.
    </div>
  );
}

function Wordmark() {
  return (
    <Link href={BASE} className="flex items-center gap-3">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg font-[family-name:var(--font-display)] text-[15px] font-semibold"
        style={{ background: 'var(--tenant-primary)', color: '#fff' }}
        aria-hidden
      >
        AZ
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-display)] text-[18px] tracking-[-0.01em]" style={{ color: 'var(--tenant-ink)' }}>
          Auckland Zoo
        </span>
        <span className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em]" style={{ color: 'var(--tenant-muted)' }}>
          Keeper · ops console
        </span>
      </span>
    </Link>
  );
}

// Desktop grouped sidebar
export function WorkspaceSidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r px-4 py-5 lg:flex"
      style={{ borderColor: 'var(--tenant-line)', background: 'color-mix(in srgb, var(--tenant-cream) 60%, #fff)' }}
    >
      <div className="px-1">
        <Wordmark />
      </div>
      <nav className="mt-6 flex-1 space-y-5" aria-label="Keeper workspace">
        {NAV.map((group) => (
          <div key={group.title}>
            <p className="px-2 font-mono text-[9.5px] uppercase tracking-[0.18em]" style={{ color: 'var(--tenant-muted)' }}>
              {group.title}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className="block rounded-lg px-3 py-1.5 text-[13.5px] transition-colors"
                      style={
                        active
                          ? { background: 'var(--tenant-primary)', color: '#fff' }
                          : { color: 'var(--tenant-ink)' }
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <span
        className="mt-5 rounded-full px-3 py-1 text-center text-[10.5px] font-medium"
        style={{ background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary-deep)' }}
      >
        Kaitiaki bundle · Keeper lead
      </span>
    </aside>
  );
}

// Mobile top bar + horizontal scroll nav
export function WorkspaceTopbarMobile() {
  const pathname = usePathname();
  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-xl lg:hidden"
      style={{ borderColor: 'var(--tenant-line)', background: 'color-mix(in srgb, var(--tenant-cream) 82%, transparent)' }}
    >
      <div className="flex items-center justify-between px-5 py-3">
        <Wordmark />
      </div>
      <nav className="-mt-1 flex items-center gap-1 overflow-x-auto px-4 pb-2" aria-label="Keeper workspace">
        {FLAT_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="shrink-0 rounded-full px-3 py-1.5 text-[13px] transition-colors"
              style={active ? { background: 'var(--tenant-primary)', color: '#fff' } : { color: 'var(--tenant-muted)' }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function WorkspaceFooter() {
  return (
    <footer className="mt-16 border-t px-5 py-8 md:px-8" style={{ borderColor: 'var(--tenant-line)' }}>
      <div className="flex max-w-4xl flex-col gap-2 text-[12px]" style={{ color: 'var(--tenant-muted)' }}>
        <p>
          Concept · pending. A design mockup of a hosted Keeper pilot for Auckland Zoo — not a live partnership, not
          veterinary, welfare, payroll or financial advice. Every output is an unsigned draft for a named human to
          review and sign.
        </p>
        <p>
          Records are drawn from Auckland Zoo public materials or are assembl-authored demo scenarios — never
          fabricated clinical, welfare, staffing or financial data. Staff and volunteers are demo roster entries.
          Whakapapa and cultural content for taonga species is held for iwi consultation and never model-generated.
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em]">
          Keeper is an assembl agent · Mana Receipt on every output
        </p>
      </div>
    </footer>
  );
}
