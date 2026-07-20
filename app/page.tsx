import type { Metadata } from 'next';
import { EditorialHero } from '@/components/site/editorial/EditorialHero';
import { GalleryScene } from '@/components/site/editorial/GalleryScene';
import { EditorialManifesto } from '@/components/site/editorial/EditorialManifesto';
import { EditorialFooter } from '@/components/site/editorial/EditorialFooter';

/**
 * assembl.co.nz homepage — editorial gallery rebuild.
 *
 * Viewport 1: the arresting typography moment with inline 3D vignettes.
 * Viewport 2: the walkable 3D gallery — three concept installations.
 * Viewport 3: the manifesto — same poster face as the hero.
 * Footer: quiet editorial sign-off.
 */

export const metadata: Metadata = {
  title: 'assembl — make AI visible',
  description:
    'assembl builds agents you can see, hold and understand. Nothing ships without your yes.',
  alternates: { canonical: '/' },
};

// Build-time constant — see EditorialFooter for why this isn't computed live.
const YEAR = 2026;

export default function HomePage() {
  return (
    <div className="bg-[#FBFAF6] text-[#1A1918]">
      <EditorialHero />
      <section id="gallery" aria-label="the assembl gallery">
        <GalleryScene />
      </section>
      <EditorialManifesto />
      <EditorialFooter year={YEAR} />
    </div>
  );
}
