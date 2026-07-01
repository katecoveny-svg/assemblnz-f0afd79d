import type { Metadata } from 'next';
import { isPilotAuthed } from '@/lib/customers/access';
import { PilotGate } from './PilotGate';

// Private pre-partnership pitch surfaces — never index these.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isPilotAuthed();
  if (!authed) return <PilotGate />;
  return <>{children}</>;
}
