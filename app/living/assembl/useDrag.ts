'use client';

/**
 * Pointer drag for the builder: works with a mouse, a finger and a pen. A press that does not move is a click
 * (the tray item goes to its best place); a press that moves carries a ghost and drops on whatever
 * `[data-drop]` element is under the pointer. Keyboard users get the same result from Enter on the tray item.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type DragPayload = { kind: string; id: string; uid?: string; label: string; art?: string | null };
export type DragState = { payload: DragPayload; x: number; y: number; target: HTMLElement | null } | null;

export function useDrag(onDrop: (p: DragPayload, target: HTMLElement | null, x: number, y: number) => void, onClick: (p: DragPayload) => void) {
  const [drag, setDrag] = useState<DragState>(null);
  const start = useRef<{ payload: DragPayload; x: number; y: number; moved: boolean; id: number } | null>(null);
  const cbs = useRef({ onDrop, onClick });
  useEffect(() => { cbs.current = { onDrop, onClick }; }, [onDrop, onClick]);

  const targetAt = (x: number, y: number) => (document.elementFromPoint(x, y) as HTMLElement | null)?.closest<HTMLElement>('[data-drop]') ?? null;

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const s = start.current;
      if (!s || e.pointerId !== s.id) return;
      if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 5) return;
      s.moved = true;
      e.preventDefault();
      setDrag({ payload: s.payload, x: e.clientX, y: e.clientY, target: targetAt(e.clientX, e.clientY) });
    };
    const up = (e: PointerEvent) => {
      const s = start.current;
      if (!s || e.pointerId !== s.id) return;
      start.current = null;
      if (s.moved) cbs.current.onDrop(s.payload, targetAt(e.clientX, e.clientY), e.clientX, e.clientY);
      else cbs.current.onClick(s.payload);
      setDrag(null);
    };
    const cancel = () => { start.current = null; setDrag(null); };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  }, []);

  const bind = useCallback((payload: DragPayload) => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      start.current = { payload, x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cbs.current.onClick(payload); }
    },
    style: { touchAction: 'none' as const },
  }), []);

  return { drag, bind };
}
