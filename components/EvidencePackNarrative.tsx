'use client';

import { StickyScrollNarrative } from './StickyScrollNarrative';
import { EvidencePackFrame } from './EvidencePackFrame';
import { evidencePackContents } from '@/lib/site-config';

/**
 * Client wrapper that pairs the StickyScrollNarrative with the bespoke
 * EvidencePackFrame. Wrapping in a client component keeps the renderFrame
 * function on the client side of the server/client boundary so /evidence-pack
 * can stay a server-rendered page.
 */
export function EvidencePackNarrative() {
  return (
    <StickyScrollNarrative
      stages={evidencePackContents}
      accent="#D4A853"
      renderFrame={(active) => <EvidencePackFrame activeIndex={active} />}
      frameAspect="aspect-[4/5]"
    />
  );
}
