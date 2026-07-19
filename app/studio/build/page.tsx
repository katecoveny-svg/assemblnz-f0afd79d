import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BuilderClient } from './BuilderClient';

export const metadata: Metadata = {
  title: 'assemble an agent · assembl studio',
  description:
    'Assemble an agent one layer at a time — job, knowledge, abilities, apps, safety. Every piece you pick appears in the scene; the finished build is a shareable link.',
};

export default function BuilderPage() {
  return (
    <Suspense fallback={null}>
      <BuilderClient />
    </Suspense>
  );
}
