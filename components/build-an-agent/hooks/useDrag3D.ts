'use client';

import { ThreeEvent, useThree } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';

const GROUND_Y = 0;
const SNAP = 0.5;

export interface DockSpec {
  /** Live position of the intelligence core (the docking hub). */
  center: [number, number, number];
  /** This part's port angle around the core, radians (0 = +x, π/2 = +z). */
  angle: number;
  /** Port distance from the core. */
  radius: number;
  /** Drop within this XZ distance of the core → dock to the port. */
  threshold: number;
  /** Fires on release with the new docked state. */
  onDock?: (docked: boolean) => void;
}

export interface Drag3DResult {
  position: [number, number, number];
  isDragging: boolean;
  docked: boolean;
  handlers: {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
    onPointerUp: (e: ThreeEvent<PointerEvent>) => void;
    onPointerCancel: (e: ThreeEvent<PointerEvent>) => void;
  };
}

/**
 * Drag a mesh across the y=0 plane by raycasting from the camera through the
 * pointer. On release: if a dock spec is given and the drop lands within
 * threshold of the core, the part snaps to its port around the core (the
 * magnetic "click into place" moment); otherwise it snaps to a 0.5-unit grid.
 */
export function useDrag3D(
  initial: [number, number, number],
  hover = 0.6,
  dock?: DockSpec,
): Drag3DResult {
  const [position, setPosition] = useState<[number, number, number]>(initial);
  const [isDragging, setIsDragging] = useState(false);
  const [docked, setDocked] = useState(false);
  const { camera, gl } = useThree();

  // The core moves — keep the latest dock spec in a ref so the release
  // handler always measures against the current core position.
  const dockRef = useRef<DockSpec | undefined>(dock);
  dockRef.current = dock;

  // Raycast against the HOVER-height plane, not the ground: the parts float
  // at y≈hover, so this keeps the part directly under the cursor. Against
  // y=0 the perspective offset meant "dropping on the knot" actually landed
  // metres behind it (you had to hit its shadow to dock).
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -(GROUND_Y + hover)));
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

  const finish = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isDragging) return;
      e.stopPropagation();
      (e.target as Element)?.releasePointerCapture?.(e.pointerId);
      setIsDragging(false);
      setPosition((prev) => {
        const spec = dockRef.current;
        if (spec) {
          const dx = prev[0] - spec.center[0];
          const dz = prev[2] - spec.center[2];
          if (Math.sqrt(dx * dx + dz * dz) < spec.threshold) {
            setDocked(true);
            spec.onDock?.(true);
            return [
              spec.center[0] + Math.cos(spec.angle) * spec.radius,
              hover,
              spec.center[2] + Math.sin(spec.angle) * spec.radius,
            ];
          }
          setDocked(false);
          spec.onDock?.(false);
        }
        return [
          Math.round(prev[0] / SNAP) * SNAP,
          hover,
          Math.round(prev[2] / SNAP) * SNAP,
        ];
      });
    },
    [hover, isDragging],
  );

  return {
    position,
    isDragging,
    docked,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
    },
  };
}
