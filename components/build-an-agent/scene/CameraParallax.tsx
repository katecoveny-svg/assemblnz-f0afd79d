'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface Props {
  reduced?: boolean;
  strength?: number;
  /** Resting camera position (from useResponsiveCamera). The dolly-in intro
   *  eases from high-and-far down to this, then parallax takes over. */
  base?: [number, number, number];
}

const INTRO_SECONDS = 2.0;
const INTRO_FROM_Y = 3.6;
const INTRO_FROM_Z = 11;

/**
 * Cinematic dolly-in on load (the "central form is alive" arrival), then
 * subtle pointer parallax anchored to a fixed look-at. Reduced motion skips
 * the intro and the drift entirely.
 */
export function CameraParallax({ reduced = false, strength = 0.28, base = [0, 1.8, 5.4] }: Props) {
  const { camera, gl } = useThree();
  const target = useRef({ x: 0, y: 0 });
  const introStart = useRef<number | null>(null);
  const introDone = useRef(false);

  useEffect(() => {
    if (reduced) return;
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      target.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      target.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, [gl, reduced]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (!introDone.current) {
      if (reduced) {
        camera.position.set(base[0], base[1], base[2]);
        camera.lookAt(0, 0.4, 0);
        introDone.current = true;
        return;
      }
      if (introStart.current === null) introStart.current = t;
      const p = Math.min((t - introStart.current) / INTRO_SECONDS, 1);
      const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      camera.position.x = 0;
      camera.position.y = INTRO_FROM_Y + (base[1] - INTRO_FROM_Y) * e;
      camera.position.z = INTRO_FROM_Z + (base[2] - INTRO_FROM_Z) * e;
      camera.lookAt(0, 0.4, 0);
      if (p >= 1) introDone.current = true;
      return;
    }

    if (reduced) return;
    const desiredX = target.current.x * strength;
    const desiredY = base[1] + target.current.y * strength * 0.5;
    camera.position.x += (desiredX - camera.position.x) * 0.05;
    camera.position.y += (desiredY - camera.position.y) * 0.05;
    camera.lookAt(0, 0.4, 0);
  });

  return null;
}
