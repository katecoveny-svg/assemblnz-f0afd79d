import type { ReactNode } from 'react';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { AdminNav } from '@/components/admin/AdminNav';

/**
 * Admin hub shell — the marketplace-era operator surface.
 *
 * Gates every page on ensureAdmin() and renders the self-contained top nav. The
 * locked canon type system (Cormorant Garamond display · Lato body · Space Mono
 * labels) is already exposed site-wide as the --font-display / --font-body /
 * --font-mono tokens (app/layout.tsx, CANON-LOCKED-2026-06-23). The global
 * SiteHeader/Footer are suppressed on /admin (see components/site/site-header).
 */

export const metadata = {
  title: 'operator hub',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await ensureAdmin();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FBF8F1',
        fontFamily: 'var(--font-body), Lato, system-ui, sans-serif',
        color: '#3A3832',
      }}
    >
      <AdminNav email={admin.email} />
      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '34px 24px 80px' }}>{children}</main>
    </div>
  );
}
