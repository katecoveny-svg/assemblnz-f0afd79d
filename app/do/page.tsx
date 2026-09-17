import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DoHome } from './DoHome';
import './do.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'DO · assembl' },
  description:
    'DO is assembl’s portable execution layer. Public try-it tools are paused on this door for now.',
  alternates: { canonical: '/do' },
};

export default function DoPage() {
  return (
    <Suspense fallback={<main className="do-craft" aria-busy="true">Loading DO…</main>}>
      <DoHome />
    </Suspense>
  );
}
