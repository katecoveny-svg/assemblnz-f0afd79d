'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, PlugZap } from 'lucide-react';
import type { DoCapabilityCard } from '@/apps/do/shared/capability-catalogue';
import styles from './connections.module.css';

type State = {
  signedIn: boolean;
  configured: boolean;
  capabilities: DoCapabilityCard[];
  accounts: Array<{ app: string; label: string; healthy: boolean }>;
};

const GROUPS = ['communication', 'work', 'creative', 'spatial'] as const;

export function DoConnections() {
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  async function refresh() {
    const response = await fetch('/api/do/connections', { cache: 'no-store' });
    setState(await response.json());
  }

  useEffect(() => { void refresh(); }, []);

  const connected = useMemo(() => new Set((state?.accounts ?? []).filter((account) => account.healthy).map((account) => account.app)), [state]);

  async function connect(app: string) {
    if (busy) return;
    setBusy(app); setMessage('');
    try {
      const response = await fetch('/api/do/connections', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ app }) });
      const data = await response.json() as { url?: string; message?: string };
      if (!response.ok || !data.url) throw new Error(data.message || 'Connection unavailable.');
      window.location.assign(data.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Connection unavailable.');
      setBusy('');
    }
  }

  return <div className={styles.shell}>
    <header className={styles.topbar}><div><Link href="/do" className={styles.brand}>DO</Link><span>/</span><strong>connections</strong></div><nav><Link href="/do/office">office</Link><Link href="/do/builder">Builderdoo</Link></nav></header>
    <main className={styles.main}>
      <section className={styles.hero}><div><p>capabilities, not connector clutter</p><h1>give your DOs<br/>the tools they need.</h1></div><p>Connect an account once. DOs request a capability; Assembl resolves it to the right connected tool while permissions and approvals stay visible.</p></section>

      {!state ? <p className={styles.notice}>Checking available capabilities…</p> : !state.signedIn ? <section className={styles.signin}><strong>Sign in before connecting personal tools.</strong><p>Connections are tied to your own DO account so another user cannot inherit your grants.</p><Link href="/do/family">Open DO sign-in <ArrowUpRight size={16}/></Link></section> : null}
      {message ? <p className={styles.error} role="alert">{message}</p> : null}

      {GROUPS.map((group) => {
        const cards = state?.capabilities.filter((capability) => capability.group === group) ?? [];
        if (!cards.length) return null;
        return <section className={styles.group} key={group}><header><span>{group}</span><p>{group === 'communication' ? 'mail and messaging context' : group === 'work' ? 'systems where work lands' : group === 'creative' ? 'production capabilities included by the platform' : 'spatial and interactive production'}</p></header><div className={styles.grid}>{cards.map((capability) => <article className={styles.card} key={capability.key}><div className={styles.cardTop}><div className={styles.icon}><PlugZap size={17}/></div><span data-status={capability.status}>{capability.status}</span></div><h2>{capability.label}</h2><p>{capability.description}</p><small>{capability.authority.replace('_', ' ')}</small>{capability.apps?.length ? <div className={styles.apps}>{capability.apps.map((app) => { const isConnected = connected.has(app.slug); return <button type="button" key={app.slug} disabled={!state?.signedIn || !state?.configured || isConnected || Boolean(busy)} onClick={() => void connect(app.slug)}>{isConnected ? <><CheckCircle2 size={14}/> {app.label} connected</> : busy === app.slug ? `opening ${app.label}…` : `Connect ${app.label}`}</button>; })}</div> : <div className={styles.included}>included with DO · no user API key required</div>}</article>)}</div></section>;
      })}

      <section className={styles.boundary}><strong>One connection layer. Explicit authority.</strong><p>OAuth grants stay with the connector provider rather than in prompts. A connection does not automatically grant a DO permission to send, publish, spend or mutate an external system.</p></section>
    </main>
  </div>;
}
