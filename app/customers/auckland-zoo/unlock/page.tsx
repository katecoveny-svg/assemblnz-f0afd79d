import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { AUCKLAND_ZOO, tenantCssVars } from '@/lib/customers/tenant-registry';
import { PasswordGate } from '../keeper/_components/gate';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Auckland Zoo × Keeper — private preview',
  description: 'Enter the demo password to view the Auckland Zoo × Keeper concept workspace.',
  robots: { index: false, follow: false },
};

// Standalone gate surface. Middleware rewrites any locked /keeper request here,
// so the gated keeper pages are never rendered (nothing leaks into the RSC
// payload). The gate posts to /api/customers/auckland-zoo/unlock, which sets the
// cookie and sends the visitor back into /keeper.
export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const style = tenantCssVars(AUCKLAND_ZOO.brand) as CSSProperties;
  return (
    <div style={style}>
      <PasswordGate error={error === '1'} />
    </div>
  );
}
