import type { Metadata } from 'next';
import { EditorialHero } from '@/components/site/editorial/EditorialHero';
import { GalleryScene } from '@/components/site/editorial/GalleryScene';

export const metadata: Metadata = {
  title: 'assembl — less admin. more mahi.',
  description:
    'assembl turns what your business already knows into a visible team of agents. Connected to your tools, working inside clear boundaries, and waiting for your yes.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <div>
      <EditorialHero />
      <GalleryScene />
    </div>
  );
}
