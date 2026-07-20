import type { Metadata } from 'next';
import { EditorialHero } from '@/components/site/editorial/EditorialHero';
import { GalleryScene } from '@/components/site/editorial/GalleryScene';

/**
 * assembl.co.nz homepage — editorial gallery rebuild (2026-07-20).
 *
 * Viewport 1: the arresting typography moment with inline 3D vignettes.
 * Viewport 2: the walkable 3D gallery — three concept installations.
 * Manifesto viewport + editorial footer follow once Kate approves these two.
 */

export const metadata: Metadata = {
  title: 'assembl — make AI visible',
  description:
    'assembl builds agents you can see, hold and understand. Nothing ships without your yes.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <div className="bg-[#FBFAF6] text-[#1A1918]">
      <EditorialHero />
      <GalleryScene />
    </div>
  );
}
