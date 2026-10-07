import type { Metadata } from 'next';
import { BuilderDoWorkspace } from './BuilderDoWorkspace';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Builder DO · assembl' },
  description: 'Plan a software or product build with Builder DO. Review the plan, save it to Office, or download a handoff.',
  alternates: { canonical: '/do/builder' },
};

export default function BuilderDoPage() {
  return <BuilderDoWorkspace />;
}
