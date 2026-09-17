import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DoHome } from './DoHome';
import './do.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'DO · assembl' },
  description:
    'DO is a small agent that sits where you already work. Click for help in context, pick or tweak a template, connect a tool only when you want to.',
  alternates: { canonical: '/do' },
};

export default function DoPage() {
  return (
    <Suspense fallback={<main className="do-craft" aria-busy="true">Loading DO…</main>}>
      <DoHome />
    </Suspense>
  );
}
