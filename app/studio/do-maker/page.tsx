import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TaskDoMakerClient } from './TaskDoMakerClient';

export const metadata: Metadata = {
  title: { absolute: 'Task DO Maker · assembl studio' },
  description:
    'Flexible Pursuit / partner journey builder — custom clients, editable steps, Sponsored Agent module, outreach gate. Drafts-only PREVIEW on Task DO Maker.',
  alternates: { canonical: '/studio/do-maker' },
};

export default function TaskDoMakerPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100svh', background: '#FFFDFB' }} />}>
      <TaskDoMakerClient />
    </Suspense>
  );
}
