import type { Metadata } from 'next';
import { DoHome } from './DoHome';
import './do.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    absolute: 'DO · PREVIEW · assembl',
  },
  description:
    'DO Agent OS v0 preview — see something, ✦ make agent. DEMO only; consequential actions always need a human yes.',
  robots: { index: false, follow: false },
};

export default function DoPage() {
  return <DoHome />;
}
