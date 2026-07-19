'use client';

import { Html } from '@react-three/drei';

import styles from './parts.module.css';

interface Props {
  text: string;
  y?: number;
  visible?: boolean;
}

/**
 * A floating HTML label that hovers just below its part.
 * Uses drei's <Html> so the label inherits the site's fonts and
 * we don't need to load a WebGL font file at runtime.
 */
export function PartLabel({ text, y = -0.65, visible = true }: Props) {
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
