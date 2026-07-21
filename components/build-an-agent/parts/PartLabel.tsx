'use client';

import { Html } from '@react-three/drei';

import styles from './parts.module.css';

interface Props {
  text: string;
  y?: number;
  /** Optional lateral offset — used by labels that annotate an attached form
   *  (the boundaries ring) rather than the part's own centre. */
  x?: number;
  z?: number;
  visible?: boolean;
}

/**
 * A floating HTML label that hovers just above its part.
 *
 * Sits above (not below) so it never drifts toward the hero copy anchored
 * to the bottom of the viewport. y is an offset from the part group's local
 * origin (ground level) — 1.15 clears the tallest part with margin.
 *
 * Uses drei's <Html> so the label inherits the site's fonts and we don't
 * need to load a WebGL font file at runtime.
 */
export function PartLabel({ text, y = 1.15, x = 0, z = 0, visible = true }: Props) {
  return (
    <Html
      position={[x, y, z]}
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
