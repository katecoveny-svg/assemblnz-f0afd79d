'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { isCustomerWorkspace, isAlphassembl, isAssemblBills, isStandaloneHealth, isMotionStudio, isCreativeStudio, isAgentMarketplace } from '@/components/site/site-header';
import { DoBrand } from '@/components/do/DoBrand';
import { PersonalDoAssistant } from '@/app/do/personal/PersonalDoAssistant';
import { createClient } from '@/lib/supabase/client';
import styles from './do-site-assistant.module.css';

/** Public DO drafting surface. No page scraping, customer data, FAQ simulation or execution. */
export function AssemblConciergeWidget() {
  const pathname = usePathname() ?? '/';
  const isolated = /^\/(do|pursuit|admin|auth)(\/|$)/.test(pathname) || pathname === '/login' || pathname === '/preview/home' || /^\/agents\/[^/]+\/chat(\/|$)/.test(pathname) || isCustomerWorkspace(pathname) || isAlphassembl(pathname) || isAssemblBills(pathname) || isStandaloneHealth(pathname) || isMotionStudio(pathname) || isCreativeStudio(pathname) || isAgentMarketplace(pathname);
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
  return <aside className={styles.widget} aria-label="DO assistant">
    {open && <section id="site-do-workspace" className={styles.panel} aria-label="DO drafting workspace">
      <header><DoBrand /><button type="button" aria-label="Close DO" onClick={close}><X size={20} /></button></header>
      <p>Prepare a reply, organise a plan or sort a life-admin note. Only what you choose to type is shared after confirmation.</p>
      <p>No page, inbox or customer records are read. Drafts need your review and stay in this open panel; copy anything you want to keep.</p>
      {!owner && <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>Sign in to DO</Link>}
      <PersonalDoAssistant key={`${pathname}:${owner ?? 'signed-out'}:${epoch}`} onWorkChange={work => { dirty.current = work.dirty; }} />
    </section>}
    <button ref={trigger} type="button" className={styles.trigger} aria-expanded={open} aria-controls="site-do-workspace" onClick={() => open ? close() : setOpen(true)}>Ask DO</button>
  </aside>;
}
