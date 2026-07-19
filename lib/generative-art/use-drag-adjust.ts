'use client';

import { useCallback, useRef } from 'react';

/**
 * Shared drag-to-shape hook — pointer position inside the canvas drives
 * two parameters via the family's own mapping. Spread the returned
 * handlers onto the canvas container div. Touch-compatible; values flow
 * through the shell's onAdjust so sliders + share URL stay in sync.
 */
export function useDragAdjust(
  onAdjust: ((patch: Record<string, number>) => void) | undefined,
  map: (nx: number, ny: number) => Record<string, number>,
) {
  const active = useRef(false);
  const onAdjustRef = useRef(onAdjust);
  onAdjustRef.current = onAdjust;
  const mapRef = useRef(map);
  mapRef.current = map;

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    active.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!active.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    onAdjustRef.current?.(mapRef.current(nx, ny));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    active.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}
