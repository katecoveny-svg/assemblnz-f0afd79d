'use client';

import { useEffect, useState } from 'react';

/**
 * Camera framing by viewport WIDTH alone — independent of touch/pointer
 * type. A narrow browser window (desktop devtools, a split-screen browser)
 * gets the same tighter, dollied-back shot as a narrow phone: the 6 parts
 * shrink and sit higher in frame so they stop fighting the hero copy for
 * legibility. Performance decisions (HDRI, DPR, kōhatu count) live in
 * useDeviceCapability instead — a resized desktop window shouldn't drop
 * those, only the framing.
 */
export interface ResponsiveCamera {
  bucket: 'mobile' | 'tablet' | 'desktop';
  position: [number, number, number];
  fov: number;
}

function cameraForWidth(width: number): ResponsiveCamera {
  if (width < 560) return { bucket: 'mobile', position: [0, 1.92, 7.8], fov: 47 };
  if (width < 960) return { bucket: 'tablet', position: [0, 1.86, 6.3], fov: 44 };
  return { bucket: 'desktop', position: [0, 1.8, 5.4], fov: 42 };
}

export function useResponsiveCamera(): ResponsiveCamera {
  const [camera, setCamera] = useState<ResponsiveCamera>(() =>
    cameraForWidth(typeof window !== 'undefined' ? window.innerWidth : 1280),
  );

  useEffect(() => {
    const onChange = () => setCamera(cameraForWidth(window.innerWidth));
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
    };
  }, []);

  return camera;
}
