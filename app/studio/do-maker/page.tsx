import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TaskDoMakerClient } from './TaskDoMakerClient';

export const metadata: Metadata = {
  title: { absolute: 'Task DO Maker · assembl studio' },
  description:
    'Mint a white-label, task-specific DO from Assembl Studio — drafts-only by default, portable AgentSpec for DO Office.',
  alternates: { canonical: '/studio/do-maker' },
};

export default function TaskDoMakerPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100svh', background: '#FFFDFB' }} />}>
      <TaskDoMakerClient />
    </Suspense>
  );
}
