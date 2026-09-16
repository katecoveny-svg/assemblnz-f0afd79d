import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TasksClient } from './TasksClient';

export const metadata: Metadata = {
  title: { absolute: 'DO tasks · assembl' },
  description:
    'Optional rollup of per-DO to-do lists. Primary lists live on each DO surface. Saved on your device or signed-in owner — not synced to Linear.app.',
  alternates: { canonical: '/do/tasks' },
  robots: { index: false, follow: false },
};

export default function DoTasksPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '40svh', display: 'grid', placeItems: 'center', color: '#916a70', fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>Loading tasks…</div>}>
      <TasksClient />
    </Suspense>
  );
}
