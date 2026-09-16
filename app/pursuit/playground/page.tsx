import type { Metadata } from 'next';
import { PursuitPlaygroundClient } from './PursuitPlaygroundClient';

export const metadata: Metadata = {
  title: { absolute: 'Pursuit playground · assembl' },
  description:
    'Public Assembl Pursuit playground — try a live NZ company lookup tool call, then request API access. Sandbox DEMO when using test keys.',
  alternates: { canonical: '/pursuit/playground' },
  robots: { index: true, follow: true },
};

export default function PursuitPlaygroundPage() {
  return <PursuitPlaygroundClient />;
}
