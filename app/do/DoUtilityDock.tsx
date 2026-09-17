'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlowDoWidget } from '@/components/site/assembl-the-work/GlowDoWidget';

/**
 * DO chrome — Kate 2026-09-17: no public Meeting/Household shelf shortcuts.
 * Glow stays off the public /do explanation page; deeper PREVIEW routes keep a light dock.
 */
const DO_PUBLIC_PATH = '/do';

export function DoUtilityDock() {
  const pathname = usePathname();
  if (
    pathname === DO_PUBLIC_PATH ||
    pathname === '/do/widget' ||
    pathname === '/do/object'
  ) {
    return null;
  }
  return (
    <>
      <GlowDoWidget />
      <nav className="do-utility-dock" aria-label="DO workspace shortcuts">
        <Link href="/do">About DO</Link>
        <Link href="/">assembl</Link>
      </nav>
    </>
  );
}
