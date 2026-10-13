'use client';

import { useCallback, useEffect, useRef, type ComponentProps } from 'react';

/** One entry overlay at a time. Only disclosure state changes; editors stay mounted. */
export function DoEntryDisclosure({ children, onToggle, ...props }: ComponentProps<'details'>) {
  const ref = useRef<HTMLDetailsElement>(null);
  const position = useCallback(() => {
    const root = ref.current;
    if (!root?.open) return;
    const panel = root.querySelector<HTMLElement>('[data-do-overlay-panel]');
    const trigger = root.querySelector('summary');
    if (!panel || !trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(Number(panel.dataset.doOverlayPanel) || 360, window.innerWidth - 32);
    const top = Math.max(16, Math.min(rect.bottom + 8, window.innerHeight - 120));
    panel.style.width = `${width}px`;
    panel.style.left = `${Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16))}px`;
    panel.style.top = `${top}px`;
    panel.style.maxHeight = `${Math.max(80, window.innerHeight - top - 16)}px`;
  }, []);
  useEffect(() => {
    const scroll = (event: Event) => {
      const root = ref.current;
      if (!root?.open || !(event.target instanceof Node) || root.contains(event.target)) return;
      const trigger = root.querySelector('summary')?.getBoundingClientRect();
      if (trigger && (trigger.bottom < 0 || trigger.top > window.innerHeight)) root.open = false;
      else position();
    };
    const outside = (event: PointerEvent) => {
      if (ref.current?.open && event.target instanceof Node && !ref.current.contains(event.target)) ref.current.open = false;
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', position);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('scroll', scroll, true); window.removeEventListener('resize', position); };
  }, [position]);
  return <details {...props} ref={ref} name="do-entry-overlays" data-do-overlay onToggle={event => {
    if (event.currentTarget.open) document.querySelectorAll<HTMLDetailsElement>('details[data-do-overlay][open]').forEach(other => { if (other !== event.currentTarget) other.open = false; });
    position();
    onToggle?.(event);
  }} onKeyDown={event => {
    if (event.key !== 'Escape') return;
    event.preventDefault(); event.stopPropagation();
    event.currentTarget.open = false;
    event.currentTarget.querySelector('summary')?.focus();
  }} onBlur={event => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
  }}>{children}</details>;
}
