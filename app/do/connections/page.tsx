import type { Metadata } from 'next';
import { DoConnections } from './DoConnections';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'DO connections · assembl' },
  description: 'Connect the tools your DOs can use, with capability-based permissions and explicit approvals.',
  alternates: { canonical: '/do/connections' },
};

export default function DoConnectionsPage() { return <DoConnections />; }
