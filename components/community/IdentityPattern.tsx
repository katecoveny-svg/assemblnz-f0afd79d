'use client';

import dynamic from 'next/dynamic';
import type { PatternIdentity } from '@/lib/pilot/types';

// Canvas engine — client-only. Rendered directly (not via PatternBackdrop,
// which is locked to the canon tokens) so each agent's custom colours apply.
const PatternStudio = dynamic(
  () => import('@/components/pattern-studio/AssemblPatternStudioComponent'),
  { ssr: false },
);

/**
 * One agent's pattern signature, rendered live. Fills its parent — give the
 * wrapper a size. Used at small size for the template/remix previews and
 * full-bleed as the share-page hero backdrop.
 */
export function IdentityPattern({
  identity,
  interactive = false,
}: {
  identity: PatternIdentity;
  interactive?: boolean;
}) {
  return (
    <PatternStudio
      mode={identity.mode}
      count={identity.count}
      turbulence={identity.turbulence}
      speed={identity.speed}
      glow={identity.glow}
      foregroundColor={identity.foregroundColor}
      accentColor={identity.accentColor}
      backgroundColor="#ffffff"
      connectLines={false}
      mouseInteractive={interactive}
    />
  );
}
