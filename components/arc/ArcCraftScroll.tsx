'use client';

import { CraftScroll } from '@/components/agent-app/CraftScroll';

/**
 * Arc PREVIEW craft scroll — shared CraftScroll scoped to `.aa-root`.
 * Assemble pin/scrub lives in BlueprintScene via ArcAssembleStage.
 */
export function ArcCraftScroll() {
  return <CraftScroll />;
}
