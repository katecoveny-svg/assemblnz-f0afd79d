'use client';

import { usePathname } from 'next/navigation';
import { V2Nav } from '@/components/v2/V2Chrome';
import { V2Footer } from '@/components/v2/V2Footer';
import { isDashMicrosite, isAgentMarketplace, isAtlas, isEcho, isAuthSurface, isAdminHub, isCustomerWorkspace, isAlphassembl, isAssemblBills, isStandaloneHealth, isMotionStudio, isCreativeStudio, isStudio, isBuildAnAgent, isLab } from '@/components/site/site-header';

// These public pages supply their own complete navigation and footer.
// Pursuit previously rendered BOTH its own and shared navigation on mobile.
const CINEMATIC_PATHS = new Set(['/', '/pursuit', '/pricing', '/agents', '/pilots', '/field-notes', '/concepts']);
const isEditorialHome = (pathname: string | null): boolean => !!pathname && CINEMATIC_PATHS.has(pathname);
const isLoyaltyJourney = (pathname: string | null): boolean => !!pathname && ['/journeys/one-nz', '/journeys/evidence-receipt', '/journeys/operator-desk', '/journeys/mana-receipt'].some(path => pathname === path || pathname.startsWith(`${path}/`));
const isDoPreview = (pathname: string | null): boolean => !!pathname && (pathname === '/do' || pathname.startsWith('/do/'));
const isPreviewSurface = (pathname: string | null): boolean => !!pathname && (pathname === '/preview' || pathname.startsWith('/preview/'));

function shipsOwnChrome(pathname: string | null): boolean {
  return isDashMicrosite(pathname) || isAgentMarketplace(pathname) || isAtlas(pathname) || isEcho(pathname) || isAuthSurface(pathname) || isAdminHub(pathname) || isCustomerWorkspace(pathname) || isAlphassembl(pathname) || isAssemblBills(pathname) || isStandaloneHealth(pathname) || isMotionStudio(pathname) || isCreativeStudio(pathname) || isStudio(pathname) || isBuildAnAgent(pathname) || isLab(pathname) || isEditorialHome(pathname) || isLoyaltyJourney(pathname) || isDoPreview(pathname) || isPreviewSurface(pathname);
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
