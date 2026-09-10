'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { WatchScene } from './WatchScene';
import './watch.css';

// Exact marketing routes only. Client journeys, tools, chat and workspaces retain
// their existing interfaces and never load the marketing model.
const WATCH_PAGES = new Set([
  '/', '/about', '/agents', '/pricing', '/concepts', '/pilots', '/field-notes',
  '/how-it-works', '/trust', '/contact', '/faq', '/docs', '/hapai', '/industries',
  '/concept-studio', '/evidence-pack', '/workflows', '/journeys',
]);

export function PublicWatchFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  if (!WATCH_PAGES.has(pathname)) {
    return <div className="relative flex min-h-screen flex-col">{children}</div>;
  }
  return (
    <div className="watch-site" data-watch-route={pathname}>
      <WatchScene key={pathname} home={pathname === '/'} />
      <div className="watch-content">{children}</div>
    </div>
  );
}
