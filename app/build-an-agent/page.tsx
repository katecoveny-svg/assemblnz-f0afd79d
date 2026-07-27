import type { Metadata } from 'next';
import { CinematicBuilder } from '@/components/site/cinematic/CinematicBuilder';
import { Showroom } from '@/components/site/cinematic/Showroom';
import '../cine.css';

/**
 * /build-an-agent — Kate's agent-builder.html prototype (2026-07-24), ported
 * 1:1 to the cinematic system: the interactive vitrine (drag to rotate, click
 * a part to inspect, share an agent recipe). Replaces the previous R3F
 * builder page on this branch.
 */

export const metadata: Metadata = {
  title: 'assembl · assemble an agent — walk the gallery, build from your site',
  description: 'Build intelligence you can see. Drag to rotate, inspect every part — nothing sends without approval.',
  alternates: { canonical: '/build-an-agent' },
};

export default function BuildAnAgentPage() {
  // The gallery is the front door: walk the six parts, send them to the dais,
  // then the vitrine below is where the agent takes your business's shape.
  return (
    <>
      <div className="cine inst">
        <Showroom />
      </div>
      <div id="builder">
        <CinematicBuilder />
      </div>
    </>
  );
}
