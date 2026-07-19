import type { Metadata } from 'next';

import { BUILD_AN_AGENT } from '@/lib/copy/build-an-agent';

import { BuilderRoot } from './BuilderRoot';

export const metadata: Metadata = {
  title: BUILD_AN_AGENT.meta.title,
  description: BUILD_AN_AGENT.meta.description,
  alternates: { canonical: '/build-an-agent' },
};

export default function BuildAnAgentPage() {
  return <BuilderRoot />;
}
