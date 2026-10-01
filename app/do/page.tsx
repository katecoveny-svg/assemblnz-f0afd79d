import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { DO_TASKS } from '@/apps/do/shared/preparation';
import { DoHome } from './DoHome';
import './do.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'DO by assembl' },
  description:
    'Notes, plans and drafts for everyday jobs. Made by assembl.',
  alternates: { canonical: '/do' },
};

export default async function DoPage({ searchParams }: { searchParams: Promise<{ task?: string | string[] }> }) {
  const { task } = await searchParams;
  // Existing /do/travel and task links keep their selected working tool.
  if (typeof task === "string" && DO_TASKS.some(option => option.id === task)) redirect(`/do/widget?task=${encodeURIComponent(task)}`);
  return (
    <Suspense fallback={<main className="do-craft" aria-busy="true">Loading DO…</main>}>
      <DoHome />
    </Suspense>
  );
}
