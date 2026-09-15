import type { Metadata } from 'next';
import { DoShareIntake } from './DoShareIntake';
import '../do.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    absolute: 'DO · Share · PREVIEW · assembl',
  },
  description: 'Paste or share text/URL into DO. DEMO Web Share Target intake.',
  robots: { index: false, follow: false },
  manifest: '/do/manifest.webmanifest',
};

export default function DoSharePage() {
  return <DoShareIntake />;
}
