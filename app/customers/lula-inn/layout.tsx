import type { Metadata } from 'next';
import { isPilotAuthed } from '@/lib/customers/access';
import { PilotGate } from '../PilotGate';

// Private pre-partnership pitch surface — never index it. Scoped to the Lula
// Inn tenant only (other /customers/* pilots manage their own access), so this
// gate wraps just this subtree, not the shared customers root.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LulaInnGateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isPilotAuthed();
  if (!authed) return <PilotGate next="/customers/lula-inn/hospo/today" />;
  return <>{children}</>;
}
