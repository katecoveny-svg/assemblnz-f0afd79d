'use client';

/**
 * GoldenScene — Kate's CANON-LOCKED orb scene, embedded verbatim.
 *
 * The scene lives as a self-contained Three.js document at
 * `public/assembl-orb-scene.html` (a byte-for-byte copy of the canon source
 * `dash-gemini/canon-2026-06-23/4c08cf4a-assemblorbscene.html`). We embed it in
 * an iframe rather than porting the WebGL by hand — every previous hand-port
 * drifted from canon (lost the transmission/metal materials, the PMREM env map,
 * the mouse-repulsion + spring + collision physics). Embedding keeps it identical.
 *
 * The scene runs its own RAF loop and listens for `mousemove` / `mousedown` on
 * its own document, so the cluster drifts ambiently and repels from the cursor.
 * For that to work the hero copy overlaying this iframe must be `pointer-events:
 * none` (see HeroGolden) so the mouse reaches the iframe — the bug that froze the
 * first ship was the copy layer eating every pointer event.
 *
 * The scene paints a transparent WebGL canvas; mobile / coarse-pointer /
 * reduced-motion visitors never mount it (HeroGolden shows the static snapshot).
 *
 * NOTE for the homepage-integration session: the scene loads three@0.160 + the
 * Polyhaven HDR from CDNs (verbatim per canon). Before this is the primary
 * production hero, consider self-hosting three + the HDR to drop the runtime
 * external dependency.
 */

export default function GoldenScene({ className }: { className?: string }) {
  return (
    <iframe
      src="/assembl-orb-scene.html"
      title=""
      aria-hidden
      tabIndex={-1}
      scrolling="no"
      className={className}
      style={{ border: 0, display: 'block', background: 'transparent' }}
    />
  );
}
