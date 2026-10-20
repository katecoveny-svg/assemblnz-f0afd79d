'use client';

/**
 * assembl / living — the wall in the hero
 * ----------------------------------------
 * The first thing on the landing page is a kit on the wall, built from the
 * served print files, assembling as the page loads. The render of the same
 * kit is the baseline: it is what a reader sees before the geometry has
 * loaded, without WebGL, and in print. The 3D view is an enhancement that
 * replaces it once every part is in hand, so the cut is from a finished
 * still to a finished wall, never to an empty one.
 */

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { applyKit, billOfMaterials, kitById, newDesign } from '@/lib/living';

const Preview3D = dynamic(() => import('./studio/Preview3D'), { ssr: false, loading: () => null });

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function HeroWall({ kitId = 'teen-room-starter', name = 'MILA', stage, caption = true }: { kitId?: string; name?: string; stage?: string; caption?: boolean }) {
  const kit = kitById(kitId);
  const design = useMemo(() => (kit ? { ...applyKit(newDesign({ space: kit.space, surface: 'wall', aesthetic: kit.aesthetic }), kit), name } : null), [kit, name]);
  const items = useMemo(() => (design ? billOfMaterials(design).lines.reduce((s, l) => s + l.qty, 0) : 0), [design]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!design || !hasWebGL()) return;
    let alive = true;
    import('./studio/Preview3D')
      .then((m) => m.preloadDesign(design))
      .then(() => { if (alive) setLive(true); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [design]);

  return (
    <figure className="lv-hero-wall">
      <div className="lv-hero-stage" data-live={live ? 'true' : 'false'} style={stage ? { background: stage } : undefined}>
        <Image src={stage ? '/living/alpha/teen-room-flatlay.png' : '/living/renders/teen-room-flatlay.jpg'} alt="The teen room starter kit: two boards, a name plate, two hooks, a shelf and a cup, as rendered from the print files" fill sizes="(max-width: 880px) 100vw, 56vw" priority style={stage ? { objectFit: 'contain', padding: '6%' } : undefined} />
        {live && design && <Preview3D design={design} zoom={false} camera="hero" stage={stage} />}
      </div>
      {caption && (
        <figcaption>
          <span className="lv-mono">{kit?.name.toLowerCase() ?? kitId} · {items} parts · from the v0.3 print files</span>
          <span className="lv-mono">{live ? 'drag to look around · drawn at real size' : 'render · the same geometry'}</span>
        </figcaption>
      )}
    </figure>
  );
}
