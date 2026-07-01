import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { AUCKLAND_ZOO, tenantCssVars } from '@/lib/customers/tenant-registry';
import {
  ConceptBanner,
  WorkspaceFooter,
  WorkspaceSidebar,
  WorkspaceTopbarMobile,
} from './_components/chrome';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Auckland Zoo × Keeper — concept preview',
  description:
    'A design mockup of an animal-first Keeper ops console for Auckland Zoo. Concept · pending — not a live partnership.',
  robots: { index: false, follow: false },
};

// Access is gated at the edge: middleware.ts rewrites any locked /keeper request
// to /customers/auckland-zoo/unlock, so this layout (and the pages beneath it)
// only ever render for an unlocked visitor — gated content never reaches the RSC
// payload.
export default function KeeperLayout({ children }: { children: ReactNode }) {
  const style = tenantCssVars(AUCKLAND_ZOO.brand) as CSSProperties;
  return (
    <div style={{ ...style, background: 'var(--tenant-cream)', minHeight: '100vh', color: 'var(--tenant-ink)' }}>
      <ConceptBanner />
      <div className="flex">
        <WorkspaceSidebar />
        <div className="min-w-0 flex-1">
          <WorkspaceTopbarMobile />
          <main className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">{children}</main>
          <WorkspaceFooter />
        </div>
      </div>
    </div>
  );
}
