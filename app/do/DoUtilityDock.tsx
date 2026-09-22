'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlowDoWidget } from '@/components/site/assembl-the-work/GlowDoWidget';

/**
 * Shared return path to DO home. Focused task pages provide their own frame.
 */
const DO_PUBLIC_PATH = '/do';

export function DoUtilityDock() {
  const pathname = usePathname();
  const focused = [DO_PUBLIC_PATH, '/do/widget', '/do/meetings', '/do/object'].includes(pathname);
  return (
    <>
      <GlowDoWidget />
      {!focused && <nav className="do-utility-dock" aria-label="DO workspace shortcuts">
        <Link href="/do">DO home</Link>
        <Link href="/">assembl</Link>
      </nav>}
    </>
  );
}
