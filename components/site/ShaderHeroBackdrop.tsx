'use client';

import { ShaderGradient } from '@/components/site/ShaderGradient';
import { HeroThreads } from '@/components/site/HeroThreads';

/**
 * The homepage hero's signature backdrop, packaged for reuse across every page
 * hero so the site reads as one design language:
 *  - a live WebGL flowing-gradient (ShaderGradient),
 *  - a left-weighted cream legibility wash so dark copy stays readable,
 *  - a soft fade into the page paper at the bottom,
 *  - the drifting gold-thread mesh (HeroThreads).
 *
 * Drop this as the first child of a `relative overflow-hidden` hero section
 * (ideally with a `bg-[radial-gradient(...)]` fallback for no-WebGL), then put
 * the hero content in a sibling with `relative z-10`.
 */
export function ShaderHeroBackdrop() {
  return (
    <>
      <ShaderGradient className="pointer-events-none absolute inset-0 z-0 h-full w-full" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(250,247,242,0.95)_0%,rgba(250,247,242,0.8)_34%,rgba(250,247,242,0.4)_58%,transparent_80%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 bg-[linear-gradient(to_bottom,transparent,var(--assembl-paper))]"
      />
      <HeroThreads className="pointer-events-none absolute inset-0 z-0" />
    </>
  );
}
