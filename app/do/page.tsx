import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { DO_TASKS } from '@/apps/do/shared/preparation';
import { DoHome } from './DoHome';
import './do.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: "DO by assembl | Your personal agent for useful work" },
  description: "DO is your portable personal agent for useful work. Start in your browser, bring the details and prepare a reply, a plan or a next step to review.",
  alternates: { canonical: "/do" },
  openGraph: { title: "DO by assembl | Your personal agent for useful work", description: "DO is your portable personal agent for useful work. Start in your browser, bring the details and prepare a reply, a plan or a next step to review.", url: "https://www.assembl.co.nz/do", type: 'website', locale: 'en_NZ', siteName: 'assembl' },
  twitter: { card: 'summary_large_image', title: "DO by assembl | Your personal agent for useful work", description: "DO is your portable personal agent for useful work. Start in your browser, bring the details and prepare a reply, a plan or a next step to review." },
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
