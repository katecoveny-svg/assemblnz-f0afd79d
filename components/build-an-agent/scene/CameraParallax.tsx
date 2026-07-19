'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface Props {
  reduced?: boolean;
  strength?: number;
}

/**
 * Subtle camera parallax on pointer position. Anchored to a fixed look-at
 * so the camera drifts without ever losing the parts.
 */
export function CameraParallax({ reduced = false, strength = 0.28 }: Props) {
  const { camera, gl } = useThree();
  const target = useRef({ x: 0, y: 0 });

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

  useFrame(() => {
    if (reduced) return;
    const desiredX = target.current.x * strength;
    const desiredY = 1.8 + target.current.y * strength * 0.5;
    camera.position.x += (desiredX - camera.position.x) * 0.05;
    camera.position.y += (desiredY - camera.position.y) * 0.05;
    camera.lookAt(0, 0.4, 0);
  });

  return null;
}
