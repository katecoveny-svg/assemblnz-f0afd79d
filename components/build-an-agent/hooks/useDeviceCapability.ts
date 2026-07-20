'use client';

import { useEffect, useState } from 'react';

/**
 * Decides how much scene fidelity a device gets — PERFORMANCE only. Camera
 * framing is a separate concern (see useResponsiveCamera) because framing
 * should react to viewport WIDTH alone (a narrow desktop window deserves the
 * same tighter shot as a phone), while performance tier reacts to touch +
 * core-count + save-data, which a resized desktop Chrome window never
 * satisfies. Mixing the two meant a devtools-narrow desktop window kept the
 * full desktop camera framing and the cramped mobile overlap it caused.
 *
 * Mobile Safari (and any touch + low-core device) gets a lighter WebGL
 * context here: lower DPR cap, no HDRI environment map, fewer kōhatu
 * instances, no pointer-parallax. Desktop and capable tablets get the full
 * scene. Recomputed on resize/orientation change; BuilderScene remounts the
 * Canvas by keying on `tier` so a mid-session tier flip actually takes
 * effect (gl context options are read once at construction).
 */
export interface DeviceCapability {
  tier: 'full' | 'lite';
  dpr: [number, number];
  kohatuCount: number;
  showEnvironment: boolean;
  allowParallax: boolean;
  ambientIntensity: number;
}

const FULL: DeviceCapability = {
  tier: 'full',
  dpr: [1, 2],
  kohatuCount: 22,
  showEnvironment: true,
  allowParallax: true,
  ambientIntensity: 0.35,
};

const LITE: DeviceCapability = {
  tier: 'lite',
  dpr: [1, 1.5],
  kohatuCount: 9,
  showEnvironment: false,
  allowParallax: false,
  ambientIntensity: 0.62,
};

function detect(): DeviceCapability {
  if (typeof window === 'undefined' || !window.matchMedia) return FULL;

  const narrow = window.innerWidth < 640;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const lowCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  const saveData = Boolean(
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
  );

  const isLite = saveData || (coarsePointer && (narrow || lowCores));
  return isLite ? LITE : FULL;
}

export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>(() => detect());

  useEffect(() => {
    const onChange = () => setCapability(detect());
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
    };
  }, []);

  return capability;
}
