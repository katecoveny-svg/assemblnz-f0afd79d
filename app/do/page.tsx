import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DoHome } from './DoHome';
import './do.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'DO · Meeting notes & Household · assembl' },
  description:
    'Public DO offers Meeting notes and a Household chores board. Drafts only — nothing is sent for you.',
  alternates: { canonical: '/do' },
};
// Keep the spatial DO experience connected to the current runtime; see docs/DO-VISUAL-BASELINE.md.
export default function DoPage() {
  return (
    <Suspense fallback={<main className="do-craft" aria-busy="true">Loading DO…</main>}>
      <DoHome />
    </Suspense>
  );
}
