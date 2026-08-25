'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AironautMark } from './AironautMark';

const BASE = '/customers/aeronaut/pikau';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const INTELLIGENCE: NavItem[] = [
  { href: BASE, label: 'Dashboard', icon: 'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z' },
  { href: `${BASE}/entries`, label: 'Entries', icon: 'M4 4h16v4H4V4Zm0 6h16v4H4v-4Zm0 6h10v4H4v-4Z' },
  { href: `${BASE}/classify`, label: 'HS Classify', icon: 'M12 2 2 7l10 5 10-5-10-5Zm0 8L2 15l10 5 10-5-10-5Z' },
  { href: `${BASE}/importers`, label: 'Importers', icon: 'M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3 0-8 1.5-8 4.5V20h8m8-7c-.6 0-1.3.1-2 .2 1.4 1 2 2.3 2 4.3V20h8v-2.5c0-3-5-4.5-8-4.5Z' },
  { href: `${BASE}/deadlines`, label: 'Deadlines', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 11h5v-2h-3V7h-2v6Z' },
  { href: `${BASE}/audit`, label: 'Audit & receipts', icon: 'M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5M8 13h8v1.5H8V13Zm0 3h8v1.5H8V16Z' },
];

const TOOLS: NavItem[] = [
  { href: `${BASE}/tools/landed-cost`, label: 'Landed cost', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  { href: `${BASE}/tools/tariff`, label: 'Tariff lookup', icon: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm10 17-6-6' },
  { href: `${BASE}/tools/fta`, label: 'FTA preference', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2ZM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20' },
  { href: `${BASE}/tools/biosecurity`, label: 'Biosecurity', icon: 'M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z' },
  { href: `${BASE}/tools/dangerous-goods`, label: 'Dangerous goods', icon: 'M12 2 1 21h22L12 2Zm0 6v6m0 3v1' },
  { href: `${BASE}/tools/freight`, label: 'Freight compare', icon: 'M1 3h13v13H1V3Zm13 5h5l4 4v4h-9V8ZM5 19a2 2 0 1 0 0 .01M18 19a2 2 0 1 0 0 .01' },
];

const OPS: NavItem[] = [
  { href: `${BASE}/tasks`, label: 'Workboard', icon: 'M4 4h5v16H4V4Zm6 0h5v10h-5V4Zm6 0h4v7h-4V4Z' },
  { href: `${BASE}/documents`, label: 'Documents', icon: 'M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5' },
  { href: `${BASE}/parties`, label: 'Suppliers & carriers', icon: 'M1 3h13v13H1V3Zm13 5h5l4 4v4h-9V8Z' },
  { href: `${BASE}/rulings`, label: 'Tariff rulings', icon: 'M6 2h9l5 5v15H6V2Zm2 11h8m-8 3h5' },
  { href: `${BASE}/compliance`, label: 'Compliance', icon: 'M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Zm-1 13-3-3 1.4-1.4L11 12.2l4.6-4.6L17 9l-6 6Z' },
  { href: `${BASE}/finance`, label: 'Finance', icon: 'M4 4h16v16H4V4Zm3 4h4M7 12h10M7 16h10M15 7v2' },
  { href: `${BASE}/reports`, label: 'Reports', icon: 'M4 20V10m5 10V4m5 16v-7m5 7V8' },
  { href: `${BASE}/staff`, label: 'Staff & roster', icon: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-8 2-8 5v3h16v-3c0-3-4-5-8-5Z' },
  { href: `${BASE}/comms`, label: 'Comms drafts', icon: 'M4 4h16v12H7l-3 3V4Z' },
  { href: `${BASE}/calendar`, label: 'Ops calendar', icon: 'M5 4h14v16H5V4Zm0 5h14M8 2v4m8-4v4' },
  { href: `${BASE}/incentives`, label: 'Incentives', icon: 'M8 21h8m-4-4v4m6-16v3a6 6 0 0 1-12 0V5h12Z' },
  { href: `${BASE}/settings`, label: 'Settings', icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.4 4 1.6 1.3-1.6 2.8-2-.4-1.3 1-.3 2h-3.6l-.3-2-1.3-1-2 .4-1.6-2.8L6.6 12 5 10.7l1.6-2.8 2 .4 1.3-1 .3-2h3.6l.3 2 1.3 1 2-.4 1.6 2.8Z' },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

function Group({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) {
  const isActive = (href: string) => (href === BASE ? pathname === BASE : pathname.startsWith(href));
  return (
    <>
      <p className="mt-4 px-3 pb-1 text-[0.75rem] uppercase tracking-[0.18em] text-[rgba(201,163,78,0.85)]">{title}</p>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="air-nav-link" data-active={isActive(item.href)}>
          <Icon d={item.icon} />
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function AironautSidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex h-full w-full flex-col overflow-y-auto px-4 py-6 text-white"
      style={{ background: 'var(--air-navy-deep)' }}
    >
      <Link href={BASE} className="mb-3 flex items-center gap-3 px-2">
        <AironautMark size={34} />
        <span>
          <span className="air-display block text-xl leading-none text-white">Aironaut</span>
          <span className="text-[0.75rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.55)]">
            Customs Brokers
          </span>
        </span>
      </Link>

      <Group title="Pīkau intelligence" items={INTELLIGENCE} pathname={pathname} />
      <Group title="Tools" items={TOOLS} pathname={pathname} />
      <Group title="Operations" items={OPS} pathname={pathname} />

      <div className="mt-6 px-2 pt-4 text-[0.75rem] leading-relaxed text-[rgba(255,255,255,0.5)]">
        <p className="mb-1 text-[rgba(201,163,78,0.9)]">Pilot · draft mode</p>
        <p>No entry here is lodged with NZ Customs. Powered by assembl.</p>
      </div>
    </nav>
  );
}
