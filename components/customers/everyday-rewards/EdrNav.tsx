'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EDR_BRAND } from '@/lib/customers/everyday-rewards/config';

const BASE = '/customers/everyday-rewards/dash';

const LINKS = [
  { href: BASE, label: 'Overview' },
  { href: `${BASE}/partners`, label: 'Partners rail' },
  { href: `${BASE}/wait-states`, label: 'Wait moments' },
  { href: `${BASE}/journey`, label: 'Journey' },
  { href: `${BASE}/economics`, label: 'Economics' },
];

export function EdrNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Everyday Rewards pilot"
      style={{
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {LINKS.map((l) => {
        const active = l.href === BASE ? pathname === BASE : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              fontFamily: 'var(--edr-body), Roboto, sans-serif',
              fontSize: 13.5,
              fontWeight: active ? 700 : 500,
              textDecoration: 'none',
              color: active ? EDR_BRAND.white : EDR_BRAND.charcoal,
              background: active ? EDR_BRAND.orange : 'transparent',
              transition: 'background 120ms, color 120ms',
              whiteSpace: 'nowrap',
            }}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
