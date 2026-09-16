'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, PlugZap } from 'lucide-react';
import type { DoCapabilityCard } from '@/apps/do/shared/capability-catalogue';
import type { DoMcpAllowlistEntry } from '@/apps/do/shared/do-mcp-gateway';
import styles from './connections.module.css';

type State = {
  signedIn: boolean;
  configured: boolean;
  availability: Record<string, boolean>;
  accountsAvailable?: boolean;
  capabilities: DoCapabilityCard[];
  accounts: Array<{ app: string; label: string; healthy: boolean }>;
};

type McpProviderRow = {
  id: string;
  label: string;
  fit: string;
  configured: boolean;
  missingEnv: string[];
  state: 'ready' | 'setup_needed' | 'stub';
  note: string;
  envKeys: string[];
  connectHint: string;
};

type McpState = {
  signedIn: boolean;
  cursorMcpNote: string;
  portableAgentNote?: string;
  providers: McpProviderRow[];
  allowlist: DoMcpAllowlistEntry[];
  nzLive?: Array<{
    toolId: string;
    label: string;
    purpose: string;
    status: 'live' | 'needs_key' | 'stub';
    envKeys: string[];
  }>;
};

async function readConnections(): Promise<State> {
  const response = await fetch('/api/do/connections', { cache: 'no-store' });
  if (!response.ok) throw new Error('Connections unavailable');
  return response.json();
}

async function readMcp(): Promise<McpState> {
  const response = await fetch('/api/do/mcp', { cache: 'no-store' });
  if (!response.ok) throw new Error('MCP gateway unavailable');
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
  const [mcp, setMcp] = useState<McpState | null>(null);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  async function refresh() {
    try {
      const [next, gateway] = await Promise.all([readConnections(), readMcp()]);
      setState(next);
      setMcp(gateway);
      setMessage(accountNotice(next));
    } catch { setMessage('Connections could not be checked. Please try again.'); }
  }

  useEffect(() => {
    let active = true;
    void Promise.all([readConnections(), readMcp()]).then(([next, gateway]) => {
      if (!active) return;
      setState(next);
      setMcp(gateway);
      setMessage(accountNotice(next));
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
      <section className={styles.hero}><div><p>portable agent · tools where you already are</p><h1>give your DOs<br/>the tools they need.</h1></div><p>Drag the floating ✦, open the chat sheet, tell it what it can see (selection/page with consent). Marketplace APIs go through the <strong>DO MCP gateway</strong> (Composio · Zapier · Treg · NZ Live). Pipedream stays for first-party Gmail. Cursor IDE MCP ≠ DO MCP.</p></section>

      {!state ? <p className={styles.notice}>Checking available capabilities…</p> : !state.signedIn ? <section className={styles.signin}><strong>Sign in before connecting personal tools.</strong><p>Connections are tied to your own DO account so another user cannot inherit your grants.</p><Link href="/login?redirect=%2Fdo%2Fconnections">Open DO sign-in <ArrowUpRight size={16}/></Link></section> : null}
      {message ? <div className={styles.error} role="alert">{message} <button type="button" onClick={() => void refresh()}>Try again</button></div> : null}

      <section className={styles.group} id="mcp-gateway">
        <header>
          <span>mcp gateway</span>
          <p>declare → configure env → connect → allowlist call → receipt</p>
        </header>
        {mcp ? (
          <>
            <p className={styles.notice} style={{ marginTop: 14 }}>{mcp.cursorMcpNote}</p>
            {mcp.portableAgentNote ? <p className={styles.notice}>{mcp.portableAgentNote}</p> : null}
            <div className={styles.grid}>
              {mcp.providers.map((provider) => (
                <article className={styles.card} key={provider.id}>
                  <div className={styles.cardTop}>
                    <div className={styles.icon}><PlugZap size={17}/></div>
                    <span data-status={provider.configured ? 'available' : 'preview'}>{provider.state.replace('_', ' ')}</span>
                  </div>
                  <h2>{provider.label}</h2>
                  <p>{provider.fit}</p>
                  <small>{provider.missingEnv.length ? `missing ${provider.missingEnv.join(', ')}` : 'env ready'}</small>
                  <div className={styles.included}>{provider.note}</div>
                </article>
              ))}
            </div>
            {mcp.nzLive?.length ? (
              <>
                <header style={{ marginTop: 28 }}>
                  <span>nz live toolkit</span>
                  <p>live · needs_key · stub — reuses Assembl edge functions</p>
                </header>
                <div className={styles.grid}>
                  {mcp.nzLive.map((tool) => (
                    <article className={styles.card} key={tool.toolId}>
                      <div className={styles.cardTop}>
                        <div className={styles.icon}><PlugZap size={17}/></div>
                        <span data-status={tool.status === 'live' ? 'available' : 'preview'}>{tool.status.replace('_', ' ')}</span>
                      </div>
                      <h2>{tool.label}</h2>
                      <p>{tool.purpose}</p>
                      <small>{tool.toolId}{tool.envKeys.length ? ` · ${tool.envKeys.join(', ')}` : ' · keyless'}</small>
                      <div className={styles.included}>
                        {tool.status === 'live'
                          ? 'Callable now via /api/do/mcp (provider nz_live).'
                          : tool.status === 'needs_key'
                            ? 'Honest needs_key — set env / Supabase secret before expecting live data.'
                            : 'Stub — documented, not faked.'}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : null}
            <div className={styles.grid} style={{ marginTop: 12 }}>
              {mcp.allowlist.filter((tool) => tool.provider !== 'nz_live').map((tool) => (
                <article className={styles.card} key={`${tool.provider}-${tool.toolId}`}>
                  <div className={styles.cardTop}>
                    <div className={styles.icon}><PlugZap size={17}/></div>
                    <span>{tool.provider}</span>
                  </div>
                  <h2>{tool.label}</h2>
                  <p>{tool.purpose}</p>
                  <small>{tool.toolId} · {tool.sideEffect}{tool.approvalRequired ? ' · approval' : ''}</small>
                  <div className={styles.included}>Allowlisted spike tool — live only when provider env is set. No fake success.</div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className={styles.notice}>Loading MCP gateway…</p>
        )}
      </section>

      {GROUPS.map((group) => {
        const cards = state?.capabilities.filter((capability) => capability.group === group) ?? [];
        if (!cards.length) return null;
        return <section className={styles.group} key={group}><header><span>{group} · pipedream connect</span><p>{groupHelper(group)}</p></header><div className={styles.grid}>{cards.map((capability) => <article className={styles.card} key={capability.key}><div className={styles.cardTop}><div className={styles.icon}><PlugZap size={17}/></div><span data-status={capability.status}>{capability.status}</span></div><h2>{capability.label}</h2><p>{capability.description}</p><small>{capability.authority.replace('_', ' ')}</small>{capability.apps?.length ? <div className={styles.apps}>{capability.apps.map((app) => { const isConnected = connected.has(app.slug); const needsReconnect = unhealthy.has(app.slug); const label = isConnected
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

      <section className={styles.boundary}><strong>Cursor MCP ≠ DO MCP.</strong><p>IDE plugins do not become customer DO tools. Pipedream stays for first-party Connect (Gmail). Composio is the primary marketplace toolbox; Zapier covers long-tail; Treg is pay-per-call data — never OAuth linking.</p></section>
    </main>
  </div>;
}
