'use client';

/**
 * Route wrapper.
 *
 * Deliberately renders its children directly — no opacity/transform animation.
 *
 * An earlier version cross-faded each route in from `opacity: 0.7`. Because that
 * is also the server-rendered / pre-hydration state, any stall in hydration left
 * the ENTIRE site stuck at 70% opacity — a washed-out page with no motion, on
 * every route. A page-transition flourish is never worth a site-wide dimming
 * risk: the resting state must always be fully visible.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
