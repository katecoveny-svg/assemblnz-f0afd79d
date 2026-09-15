'use client';
import Link from 'next/link';
import { DoSpark } from '@/components/do/DoSpark';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { DoWorkspace } from '@/app/do/DoWorkspace';
import '@/app/do/do.css';
const clamp = (left: number, top: number) => ({ left: Math.max(8, Math.min(window.innerWidth - 100, left)), top: Math.max(8, Math.min(window.innerHeight - 110, top)) });
export function GlowDoWidget() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  useEffect(() => { const resize = () => setPosition(p => p ? clamp(p.left, p.top) : null); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize); }, []);
  return <><button className="atw-do-glow" aria-label="Open DO. Drag to move, or use Alt and arrow keys." style={position ? { left: position.left, top: position.top, right: 'auto' } : undefined} onPointerDown={event => { if (event.button !== 0) return; const rect = event.currentTarget.getBoundingClientRect(); drag.current = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, moved: false }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => { const start = drag.current; if (!start || !event.currentTarget.hasPointerCapture(event.pointerId)) return; if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) start.moved = true; if (start.moved) setPosition(clamp(start.left + event.clientX - start.x, start.top + event.clientY - start.y)); }} onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => { drag.current = null; }} onKeyDown={event => { if (event.key === 'Escape') { setPosition(null); return; } if (!event.altKey || !event.key.startsWith('Arrow')) return; event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); setPosition(clamp(rect.left + (event.key === 'ArrowRight' ? 24 : event.key === 'ArrowLeft' ? -24 : 0), rect.top + (event.key === 'ArrowDown' ? 24 : event.key === 'ArrowUp' ? -24 : 0))); }} onClick={() => { if (drag.current?.moved) { drag.current = null; return; } setOpened(true); dialog.current?.showModal(); }}><DoSpark /><span className="atw-do-widget-label">Open DO <ArrowUpRight size={13}/></span></button><dialog ref={dialog} className="do-workspace-dialog atw-widget-dialog" aria-label="DO preparation workspace"><button className="do-dialog-close" aria-label="Close DO workspace" onClick={() => dialog.current?.close()}><X size={21} /></button>{opened && <DoWorkspace />}<Link className="atw-widget-takeaway" href="/do">Get the downloadable DO widget <ArrowUpRight size={15} /></Link></dialog></>;
}
