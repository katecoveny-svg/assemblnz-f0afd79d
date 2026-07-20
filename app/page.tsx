import type { Metadata } from 'next';
import { EditorialHero } from '@/components/site/editorial/EditorialHero';

/**
 * assembl.co.nz homepage — editorial gallery rebuild (2026-07-20).
 *
 * Stage 1 of Kate's `homepage/editorial-gallery` brief: the typography-first
 * hero moment (viewport 1). The walkable 3D gallery (viewport 2), the
 * manifesto (viewport 3) and the editorial footer follow once this stage
 * is approved on the Vercel preview URL.
 */

export const metadata: Metadata = {
  title: 'assembl — make AI visible',
  description:
    'assembl is New Zealand’s AI adoption agency. We build agents you can see, hold and understand. Nothing ships without your yes.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <div className="bg-[#FBFAF6] text-[#1A1918]">
      <EditorialHero />
    </div>
  );
}
