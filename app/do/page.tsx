import type { Metadata } from 'next';
import { DoHomeCurrent } from './DoHomeCurrent';
import './do.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'DO · your portable agent workforce · assembl' },
  description: 'Bring your DOs to the work: companion, Office, Builderdoo and user-scoped connections with visible permissions, approvals and proof.',
  alternates: { canonical: '/do' },
};
export default function DoPage() { return <DoHomeCurrent />; }
