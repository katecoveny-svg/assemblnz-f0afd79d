import type { ReactNode } from 'react';

/**
 * /admin root layout — deliberately thin.
 *
 * The gate lives one level down: app/admin/(hub)/layout.tsx wraps every
 * operator section in ensureAdmin() + the AdminNav chrome, while
 * app/admin/login sits OUTSIDE the (hub) group so an unauthenticated visitor
 * can reach the sign-in form without tripping the gate (which would loop).
 * Route groups don't change URLs — everything still serves under /admin/*.
 */

export const metadata = {
  title: 'operator hub',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
