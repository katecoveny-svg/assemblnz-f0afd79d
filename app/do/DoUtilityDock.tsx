'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Public DO chrome shortcuts — Meeting + Household only. No floating purple D. */
const LINKS = [
  { href: '/do/meetings', label: 'Meeting DO' },
  { href: '/do/household', label: 'Household DO' },
] as const;

export function DoUtilityDock() {
  const pathname = usePathname();
  if (pathname === '/do/widget' || pathname === '/do/object') return null;
  if (pathname === '/do') return null;
  return (
    <nav className="do-utility-dock" aria-label="DO workspace shortcuts">
      {LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
