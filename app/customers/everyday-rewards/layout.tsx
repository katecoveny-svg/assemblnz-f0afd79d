import type { Metadata } from 'next';
import { isPilotAuthed } from '@/lib/customers/access';
import { PilotGate } from './PilotGate';

// Pre-partnership pitch surface — private and never indexed. The gate is scoped
// to /customers/everyday-rewards only; sibling workspaces (e.g. /customers/air-nz)
// keep their own access model.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EverydayRewardsGateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isPilotAuthed();
  if (!authed) return <PilotGate />;
  return <>{children}</>;
}
