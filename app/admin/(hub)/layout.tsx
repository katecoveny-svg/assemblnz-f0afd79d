import type { ReactNode } from 'react';
// Server-safe canvas tokens — the paper-white admin shell rides on the
// DIRECTION-LOCKED-2026-07-01 palette from @assembl/canvas.
import { palette } from '@assembl/canvas/tokens';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { AdminNav } from '@/components/admin/AdminNav';

/**
 * Admin hub shell — the operator surface behind the gate.
 *
 * Gates every section on ensureAdmin() and renders the self-contained top nav.
 * Unauthenticated visitors are sent to /admin/login, which lives OUTSIDE this
 * (hub) route group so it never trips the gate (a gate on the login page would
 * loop). Route groups don't change URLs — everything still serves at /admin/*.
 *
 * Shell background is the canvas paper white; the locked canon type system
 * (Cormorant Garamond display · Lato body · Space Mono labels) is exposed
 * site-wide as the --font-display / --font-body / --font-mono tokens
 * (app/layout.tsx). The global SiteHeader/Footer are suppressed on /admin
 * (see components/site/site-header).
 */

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await ensureAdmin();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: palette.paper,
        fontFamily: 'var(--font-body), Lato, system-ui, sans-serif',
        color: palette.ink,
      }}
    >
      <AdminNav email={admin.email} />
      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '34px 24px 80px' }}>{children}</main>
    </div>
  );
}
