'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, PenLine, Mic, ArrowUpRight } from 'lucide-react';
import { publicDoAssistantIsolated } from '@/apps/do/shared/public-assistant-routes';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
import { DoBrand } from '@/components/do/DoBrand';
import { PersonalDoAssistant } from '@/app/do/personal/PersonalDoAssistant';
import { createClient } from '@/lib/supabase/client';
import styles from './do-site-assistant.module.css';

/** Public DO drafting surface. No page scraping, customer data, FAQ simulation or execution. */
export function AssemblConciergeWidget() {
  const pathname = usePathname() ?? '/';
  const isolated = publicDoAssistantIsolated(pathname);
  const [homeHost, setHomeHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let frame = 0;
    const synchronize = () => {
      frame = 0;
      const host = pathname === '/' ? document.getElementById('home-do-assistant-slot') : null;
      setHomeHost(host?.isConnected ? host : null);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(synchronize);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    schedule();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [pathname]);
  const connectedHomeHost = pathname === '/' && homeHost?.isConnected ? homeHost : null;
  const [open, setOpen] = useState(false);
  const [owner, setOwner] = useState<string | null>(null);
  const [epoch, setEpoch] = useState(0);
  const dirty = useRef(false);
  const identity = useRef<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isolated) return;
    let alive = true, revision = 0;
    try {
      const auth = createClient().auth;
      const check = async () => {
        const current = ++revision;
        try {
          const { data, error } = await auth.getUser();
          if (alive && current === revision) { const next = error ? null : data.user?.id ?? null; identity.current = next; setOwner(next); }
        } catch { if (alive && current === revision) { identity.current = null; setOwner(null); } }
      };
      void check();
      const { data } = auth.onAuthStateChange((_event, session) => {
        // Immediately clear an open exchange before asynchronously verifying the next identity.
        if ((session?.user.id ?? null) !== identity.current) { identity.current = session?.user.id ?? null; setOwner(null); setEpoch(value => value + 1); dirty.current = false; }
        queueMicrotask(() => { void check(); });
      });
      return () => { alive = false; revision++; data.subscription.unsubscribe(); };
    } catch { /* Unconfigured auth remains a signed-out, unavailable drafting surface. */ }
    return () => { alive = false; };
  }, [isolated]);
  const close = useCallback(() => {
    if (dirty.current && !window.confirm('Close this draft? It is not saved. Copy anything you want to keep first.')) return;
    dirty.current = false; setOpen(false); trigger.current?.focus();
  }, []);
  useEffect(() => {
    if (!open || isolated) return;
    const frame = requestAnimationFrame(() => dispatchEvent(new Event('assembl:do-focus')));
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', escape);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', escape); };
  }, [open, isolated, close]);
  if (isolated) return null;
  const widget = <aside className={styles.widget} data-home-inline={Boolean(connectedHomeHost) || undefined} aria-label="DO assistant">
    {open && <section id="site-do-workspace" className={styles.panel} aria-label="DO drafting workspace">
      <header><DoBrand /><button type="button" aria-label="Close DO" onClick={close}><X size={20} /></button></header>
      <p>Prepare a reply, organise a plan or sort a life-admin note. Only what you choose to type is shared after confirmation.</p>
      <p>No page, inbox or customer records are read. Drafts need your review and stay in this open panel; copy anything you want to keep.</p>
      <p>Speak opens a full window to check voice availability. Nothing starts recording automatically.</p>
      {!owner && <Link href="/login?redirect=%2Fdo">Sign in to DO</Link>}
      <PersonalDoAssistant key={`${pathname}:${owner ?? 'signed-out'}:${epoch}`} onWorkChange={work => { dirty.current = work.dirty; }} />
    </section>}
    <div className={styles.launcher}>
    <button ref={trigger} type="button" className={styles.trigger} aria-expanded={open} aria-controls="site-do-workspace" onClick={() => open ? close() : setOpen(true)}><GlassIdentity kind="do" size={52} /><span>Ask DO</span></button>
    <div className={styles.entryActions} aria-label="Start with DO"><button type="button" onClick={() => { setOpen(true); requestAnimationFrame(() => dispatchEvent(new Event('assembl:do-focus'))); }}><PenLine size={16} aria-hidden="true" />Write</button><Link href="/do/widget?entry=talk" target="_blank" rel="noopener noreferrer" aria-label="Speak with DO — check availability in a new window"><Mic size={16} aria-hidden="true" />Speak<ArrowUpRight size={14} aria-hidden="true" /></Link></div>
    </div>
  </aside>;
  return connectedHomeHost ? createPortal(widget, connectedHomeHost) : widget;
}
