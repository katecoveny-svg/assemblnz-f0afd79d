'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, PlugZap } from 'lucide-react';
import type { DoCapabilityCard } from '@/apps/do/shared/capability-catalogue';
import styles from './connections.module.css';

type State = {
  signedIn: boolean;
  configured: boolean;
  availability: Record<string, boolean>;
  accountsAvailable?: boolean;
  capabilities: DoCapabilityCard[];
  accounts: Array<{ app: string; label: string; healthy: boolean }>;
};

async function readConnections(): Promise<State> {
  const response = await fetch('/api/do/connections', { cache: 'no-store' });
  if (!response.ok) throw new Error('Connections unavailable');
  return response.json();
}
const accountNotice = (next: State) => next.accountsAvailable === false ? 'Your connected accounts could not be checked. Their status is currently unknown.' : '';

const GROUPS = ['communication', 'work', 'productivity', 'finance', 'creative', 'spatial'] as const;

function groupHelper(group: (typeof GROUPS)[number]): string {
  switch (group) {
    case 'communication':
      return 'mail and messaging';
    case 'work':
      return 'calendar, files and CRM';
    case 'productivity':
      return 'tasks and notes';
    case 'finance':
      return 'billing reads';
    case 'creative':
      return 'production capabilities included by the platform';
    default:
      return 'spatial and interactive production';
  }
}

export function DoConnections() {
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  async function refresh() {
    try {
      const next = await readConnections();
      setState(next);
      setMessage(accountNotice(next));
    } catch { setMessage('Connections could not be checked. Please try again.'); }

  }

  useEffect(() => {
    let active = true;
    void readConnections().then(next => {
      if (active) { setState(next); setMessage(accountNotice(next)); }
    }).catch(() => { if (active) setMessage('Connections could not be checked. Please try again.'); });
    return () => { active = false; };
  }, []);

  const connected = useMemo(() => {
    const set = new Set<string>();
    for (const account of state?.accounts ?? []) {
      if (!account.healthy) continue;
      set.add(account.app);
      if (account.app === 'slack_v2') set.add('slack');
    }
    return set;
  }, [state]);
  const unhealthy = useMemo(() => {
    const set = new Set<string>();
    for (const account of state?.accounts ?? []) {
      if (account.healthy) continue;
      set.add(account.app);
      if (account.app === 'slack_v2') set.add('slack');
    }
    return set;
  }, [state]);

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
    <header className={styles.topbar}><div><Link href="/do" className={styles.brand}>DO</Link><span>/</span><strong>connections</strong></div><nav><Link href="/do/household">Household Floor</Link><Link href="/do/office">office</Link><Link href="/do/builder">Builder DO</Link></nav></header>
    <main className={styles.main}>
      <section className={styles.hero}><div><p>capabilities, not connector clutter</p><h1>give your DOs<br/>the tools they need.</h1></div><p>Connect an account once through Pipedream Connect. DOs declare which connectors they need; Assembl resolves connect / connected / needs reconnect. OAuth grants stay with Pipedream — never in the template. Sending remains approval-gated.</p></section>

      {!state ? <p className={styles.notice}>Checking available capabilities…</p> : !state.signedIn ? <section className={styles.signin}><strong>Sign in before connecting personal tools.</strong><p>Connections are tied to your own DO account so another user cannot inherit your grants.</p><Link href="/login?redirect=%2Fdo%2Fconnections">Open DO sign-in <ArrowUpRight size={16}/></Link></section> : null}
      {message ? <div className={styles.error} role="alert">{message} <button type="button" onClick={() => void refresh()}>Try again</button></div> : null}

      {GROUPS.map((group) => {
        const cards = state?.capabilities.filter((capability) => capability.group === group) ?? [];
        if (!cards.length) return null;
        return <section className={styles.group} key={group}><header><span>{group}</span><p>{groupHelper(group)}</p></header><div className={styles.grid}>{cards.map((capability) => <article className={styles.card} key={capability.key}><div className={styles.cardTop}><div className={styles.icon}><PlugZap size={17}/></div><span data-status={capability.status}>{capability.status}</span></div><h2>{capability.label}</h2><p>{capability.description}</p><small>{capability.authority.replace('_', ' ')}</small>{capability.apps?.length ? <div className={styles.apps}>{capability.apps.map((app) => { const isConnected = connected.has(app.slug); const needsReconnect = unhealthy.has(app.slug); const label = isConnected
                          ? <><CheckCircle2 size={14}/> {app.label} connected</>
                          : busy === app.slug
                            ? `opening ${app.label}…`
                            : !state?.signedIn
                              ? `Sign in · ${app.label}`
                              : !state?.availability[app.slug]
                                ? `${app.label} · setup needed`
                                : needsReconnect
                                  ? `Reconnect ${app.label}`
                                  : `Connect ${app.label}`;
                        return <button type="button" key={app.slug} disabled={!state?.signedIn || !state?.availability[app.slug] || state.accountsAvailable === false || isConnected || Boolean(busy)} onClick={() => void connect(app.slug)}>{label}</button>; })}</div> : <div className={styles.included}>{capability.status === 'preview' ? 'Preview · not yet connected to DO' : 'Platform capability · availability depends on the task'}</div>}</article>)}</div></section>;
      })}

      <section className={styles.boundary}><strong>One connection layer. Explicit authority.</strong><p>OAuth grants stay with the connector provider rather than in prompts. A connection does not automatically grant a DO permission to send, publish, spend or mutate an external system.</p></section>
    </main>
  </div>;
}
