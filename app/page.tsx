import type { Metadata } from 'next';
import { AgentAssemblyStudio } from '@/components/home/AgentAssemblyStudio';
import { GalleryScene } from '@/components/site/editorial/GalleryScene';

export const metadata: Metadata = {
  title: 'assembl — build intelligence you can understand.',
  description:
    'Build a useful business agent from six visible parts: memory, knowledge, intelligence, voice, abilities and boundaries.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <div>
      <AgentAssemblyStudio />
      <GalleryScene />
    </div>
  );
}
