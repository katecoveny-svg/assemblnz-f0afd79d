import type { Metadata } from 'next';
import '@/app/do/do-craft.css';
import { BrowserRuntimeClient } from './BrowserRuntimeClient';

export const metadata: Metadata = {
  title: { absolute: 'Browser Runtime · DO · assembl' },
  description:
    'DO Browser Runtime prototype — persistent jobs across tabs, visible context controls, Permit-gated artifacts. Not a sidebar summariser.',
  alternates: { canonical: '/do/browser' },
  robots: { index: false, follow: false },
};

export default function DoBrowserRuntimePage() {
  return <BrowserRuntimeClient />;
}
