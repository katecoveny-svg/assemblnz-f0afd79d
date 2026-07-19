'use client';

import { ThreeEvent, useThree } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';

const GROUND_Y = 0;
const SNAP = 0.5;

export interface Drag3DResult {
  position: [number, number, number];
  isDragging: boolean;
  handlers: {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
    onPointerUp: (e: ThreeEvent<PointerEvent>) => void;
    onPointerCancel: (e: ThreeEvent<PointerEvent>) => void;
  };
}

/**
 * Drag a mesh across the y=0 plane by raycasting from the camera through the pointer.
 * Snaps to a 0.5-unit grid on release so parts land tidily.
 */
export function useDrag3D(initial: [number, number, number], hover = 0.6): Drag3DResult {
  const [position, setPosition] = useState<[number, number, number]>(initial);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, gl } = useThree();

  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -GROUND_Y));
  const rayRef = useRef(new THREE.Raycaster());
  const hitRef = useRef(new THREE.Vector3());
  const ndcRef = useRef(new THREE.Vector2());

  const projectToPlane = useCallback(
    (clientX: number, clientY: number): [number, number, number] | null => {
      const rect = gl.domElement.getBoundingClientRect();
      ndcRef.current.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      rayRef.current.setFromCamera(ndcRef.current, camera);
      const hit = rayRef.current.ray.intersectPlane(planeRef.current, hitRef.current);
      if (!hit) return null;
      return [hit.x, hover, hit.z];
    },
    [camera, gl, hover],
  );

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isDragging) return;
      e.stopPropagation();
      const p = projectToPlane(e.clientX, e.clientY);
      if (p) setPosition(p);
    },
    [isDragging, projectToPlane],
  );

  const finish = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    (e.target as Element)?.releasePointerCapture?.(e.pointerId);
    setIsDragging(false);
    setPosition((prev) => [
      Math.round(prev[0] / SNAP) * SNAP,
      hover,
      Math.round(prev[2] / SNAP) * SNAP,
    ]);
  }, [hover, isDragging]);

  return {
    position,
    isDragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
    },
  };
}
