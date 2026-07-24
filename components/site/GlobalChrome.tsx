'use client';

import { usePathname } from 'next/navigation';
import { V2Nav } from '@/components/v2/V2Chrome';
import { V2Footer } from '@/components/v2/V2Footer';
import {
  isDashMicrosite,
  isAgentMarketplace,
  isAtlas,
  isEcho,
  isAuthSurface,
  isAdminHub,
  isCustomerWorkspace,
  isAlphassembl,
  isAssemblBills,
  isStandaloneHealth,
  isMotionStudio,
  isStudio,
  isBuildAnAgent,
} from '@/components/site/site-header';

// Editorial gallery rebuild owns its own wordmark + footer.
// The cinematic surfaces ship their own nav + footer (Kate's prototype
// chrome) — global chrome must stay out of their way.
const isEditorialHome = (pathname: string | null): boolean =>
  pathname === '/' || pathname === '/pricing';

/**
 * The single site-wide chrome — the homepage's glass V2Nav + slim footer,
 * rendered on every marketing page so the frame stops changing as you move
 * around (the "drift" the whole site had). App-surfaces that ship their own
 * chrome (the OS demo, Bills, Alphassembl, customer workspaces, the admin hub,
 * white-label living-site verticals, etc.) still suppress it — the SAME list
 * SiteHeader/SiteFooter used, minus the homepage, which now gets this chrome.
 */
function shipsOwnChrome(pathname: string | null): boolean {
  return (
    isDashMicrosite(pathname) ||
    isAgentMarketplace(pathname) ||
    isAtlas(pathname) ||
    isEcho(pathname) ||
    isAuthSurface(pathname) ||
    isAdminHub(pathname) ||
    isCustomerWorkspace(pathname) ||
    isAlphassembl(pathname) ||
    isAssemblBills(pathname) ||
    isStandaloneHealth(pathname) ||
    isMotionStudio(pathname) ||
    isStudio(pathname) ||
    isBuildAnAgent(pathname) ||
    isEditorialHome(pathname)
  );
}

export function GlobalNav() {
  const pathname = usePathname();
  if (shipsOwnChrome(pathname)) return null;
  return <V2Nav current={pathname ?? undefined} />;
}

export function GlobalFooter() {
  const pathname = usePathname();
  if (shipsOwnChrome(pathname)) return null;
  return <V2Footer />;
}
