'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Camera framing driven by the CANVAS's own measured box.
 *
 * This used to key off window.innerWidth, which is wrong whenever the canvas
 * isn't the full window — a devtools panel, an inspector, a split view, any
 * embed. A 913px window holding a 751x987 canvas got tablet framing for what
 * is actually a portrait box, and the assembly ran off an edge the code had no
 * idea was there.
 *
 * It also returns `fit`, because width alone can't tell you whether the
 * assembly clears the frame. fov is VERTICAL, so a tall narrow canvas has a
 * far smaller horizontal field than its width implies: the same layout that
 * sits comfortably in 16:9 hangs off both sides at 3:4. Callers shrink the
 * spread by `fit` instead of guessing.
 *
 * Performance decisions (HDRI, DPR, kōhatu count) live in useDeviceCapability
 * instead — a resized window shouldn't drop those, only the framing.
 */
export interface ResponsiveCamera {
  bucket: 'mobile' | 'tablet' | 'desktop';
  position: [number, number, number];
  fov: number;
  /** width / height of the canvas box. */
  aspect: number;
  /**
   * How much to shrink the assembly so it clears a narrow frame. 1 at 16:10
   * and wider; falls away as the box gets squarer or portrait.
   */
  fit: number;
}

/** The aspect the layout was composed against. */
const REFERENCE_ASPECT = 1.6;

function frameFor(width: number, height: number): ResponsiveCamera {
  const aspect = height > 0 ? width / height : REFERENCE_ASPECT;
  const fit = Math.max(0.58, Math.min(1, aspect / REFERENCE_ASPECT));

  if (width < 560) return { bucket: 'mobile', position: [0, 1.74, 7.4], fov: 47, aspect, fit };
  if (width < 960) return { bucket: 'tablet', position: [0, 1.66, 6.0], fov: 44, aspect, fit };
  return { bucket: 'desktop', position: [0, 1.58, 5.0], fov: 42, aspect, fit };
}

export function useResponsiveCamera(
  hostRef: RefObject<HTMLElement | null>,
): ResponsiveCamera {
  const [frame, setFrame] = useState<ResponsiveCamera>(() => frameFor(1280, 800));

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const next = frameFor(r.width, r.height);
      setFrame((prev) =>
        // Only re-render when the framing meaningfully changes. A
        // ResizeObserver on a live WebGL host fires continuously during a
        // drag-resize, and every bucket change remounts the whole Canvas.
        prev.bucket === next.bucket && Math.abs(prev.fit - next.fit) < 0.02
          ? prev
          : next,
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hostRef]);

  return frame;
}
