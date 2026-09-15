import type { Metadata } from 'next';
import { DoHome } from './DoHome';
import './do.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    absolute: 'DO · Spatial Widget PREVIEW · assembl',
  },
  description:
    'DO Spatial Widget preview — deep plum stage, living ✦, placeable paper agents. DEMO only; consequential actions always need a human yes.',
  robots: { index: false, follow: false },
  manifest: '/do/manifest.webmanifest',
};

export default function DoPage() {
  return <DoHome />;
}
