'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LULA_BRAND } from '@/lib/customers/lula-inn/brand';
import { HOSPO_LINKS } from './nav-links';

const B = LULA_BRAND;

export function HospoNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Lula Inn ops"
      style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}
    >
      {HOSPO_LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + '/');
        return (
          <Link
            key={l.href}
            href={l.href}
            style={{
              padding: '7px 13px',
              borderRadius: 999,
              fontFamily: 'var(--lula-body), system-ui, sans-serif',
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              textDecoration: 'none',
              color: active ? B.cream : B.inkSoft,
              background: active ? B.ocean : 'transparent',
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
