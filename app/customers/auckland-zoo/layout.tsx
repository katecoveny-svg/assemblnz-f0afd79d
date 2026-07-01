import type { Metadata } from 'next';
import { isPilotAuthed } from '@/lib/customers/access';
import { PilotGate } from './PilotGate';

// Pre-partnership pitch surface — private and never indexed. Uses the shared
// customer-pilot passphrase gate (lib/customers/access.ts), the same shape as
// the Air NZ / Everyday Rewards / Happy Tails pilots.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AucklandZooGateLayout({ children }: { children: React.ReactNode }) {
  const authed = await isPilotAuthed();
  if (!authed) return <PilotGate />;
  return <>{children}</>;
}
