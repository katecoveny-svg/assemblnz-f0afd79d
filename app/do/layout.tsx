import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DoUtilityDock } from './DoUtilityDock';
import './utility-dock.css';
import './do-visual-atmosphere.css';

/** DO installs as its own app across its task routes. Offline shell via /do/sw.js. */
export const metadata: Metadata = {
  manifest: '/do/manifest.webmanifest',
  applicationName: 'DO',
  appleWebApp: { capable: true, title: 'DO', statusBarStyle: 'default' },
  icons: { icon: '/do/icons/do-192.png?v=3', apple: '/do/icons/do-180.png?v=2' },
};

export default function DoLayout({ children }: { children: ReactNode }) {
  return <div className="do-app-shell">{children}<DoUtilityDock /></div>;
}
