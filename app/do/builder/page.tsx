import type { Metadata } from 'next';
import { BuilderDoWorkspace } from './BuilderDoWorkspace';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Builderdoo · assembl' },
  description: 'A persistent model-agnostic chief builder for the Assembl software factory.',
  alternates: { canonical: '/do/builder' },
};

export default function BuilderDoPage() {
  return <BuilderDoWorkspace />;
}
