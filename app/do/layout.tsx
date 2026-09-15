import type { Metadata } from 'next';
import type { ReactNode } from 'react';
/** DO installs as its own app across its task routes. No offline data cache. */
export const metadata: Metadata = {
  manifest: '/do/manifest.webmanifest',
  applicationName: 'DO',
  appleWebApp: { capable: true, title: 'DO', statusBarStyle: 'default' },
  icons: { icon: '/do/icons/do-192.png', apple: '/do/icons/do-180.png' },
};
export default function DoLayout({ children }: { children: ReactNode }) { return children; }
