'use client';

import { Html } from '@react-three/drei';

import styles from './parts.module.css';

interface Props {
  text: string;
  y?: number;
  visible?: boolean;
}

/**
 * A floating HTML label that hovers just above its part.
 *
 * Sits above (not below) so it never drifts toward the hero copy anchored
 * to the bottom of the viewport — every part's rest position is near
 * y≈0.5-0.6, so a below-offset label lands close to ground level, right in
 * the zone the headline/lede occupy on narrow viewports. Above keeps it
 * near the part regardless of screen size.
 *
 * y is an offset from the part group's local origin (ground level, y=0),
 * not from the mesh's own height — 1.15 clears the tallest part (the model
 * core sphere, top ≈1.02) with a small margin so the pill floats clear of
 * every mesh rather than intersecting it.
 *
 * Uses drei's <Html> so the label inherits the site's fonts and we don't
 * need to load a WebGL font file at runtime.
 */
export function PartLabel({ text, y = 1.15, visible = true }: Props) {
  return (
    <Html
      position={[0, y, 0]}
      center
      distanceFactor={7}
      zIndexRange={[10, 0]}
      pointerEvents="none"
    >
      <span className={`${styles.label} ${visible ? '' : styles.labelHidden}`}>
        {text}
      </span>
    </Html>
  );
}
