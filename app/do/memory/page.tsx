import type { Metadata } from 'next';
import { MemoryNotes } from './MemoryNotes';

export const metadata: Metadata = {
  title: { absolute: 'DO memory · assembl' },
  description: 'Every note DO keeps about you, in one place. Read, edit, pause or delete any of them.',
  alternates: { canonical: '/do/memory' },
  robots: { index: false, follow: false },
};

export default function DoMemoryPage() {
  return <MemoryNotes />;
}
