import type { Metadata, Viewport } from 'next';
import { ToroPwaRegistrar } from './toro-pwa-registrar';

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Tōro',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#2B6B57',
};

export default function ToroLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToroPwaRegistrar />
      {children}
    </>
  );
}
