import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DoHome } from './DoHome';
import './do.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'DO · assembl' },
  description:
    'Open DO for everyday writing, meeting notes and school notices. Bring the context and review the work before acting.',
  alternates: { canonical: '/do' },
};

export default function DoPage() {
  return (
    <Suspense fallback={<main className="do-craft" aria-busy="true">Loading DO…</main>}>
      <DoHome />
    </Suspense>
  );
}
