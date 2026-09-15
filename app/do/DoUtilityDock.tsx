'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/do/office', label: 'Office' },
  { href: '/do/builder', label: 'Builderdoo' },
  { href: '/do/connections', label: 'Connections' },
] as const;

export function DoUtilityDock() {
  const pathname = usePathname();
  if (pathname === '/do/widget') return null;
  return (
    <nav className="do-utility-dock" aria-label="DO workspace shortcuts">
      {LINKS.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>)}
    </nav>
  );
}
