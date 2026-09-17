'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, PlugZap } from 'lucide-react';
import { accountNotice, loadConnectionPanels, readMcp, type State, type McpState, type HubAttached } from './connections-state';
import styles from './connections.module.css';

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
  const [technicalError, setTechnicalError] = useState('');
  const requestId = useRef(0);
  const [hubToolkitId, setHubToolkitId] = useState('');
  const [hubLabel, setHubLabel] = useState('');
  const [hubMessage, setHubMessage] = useState('');

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    await loadConnectionPanels({
      onConnections: (next, error) => {
        if (id !== requestId.current) return;
        setState(next);
        setMessage(error);
      },
      onTechnical: (next, error) => {
        if (id !== requestId.current) return;
        setMcp(next);
        setTechnicalError(error);
      },
    });
  }, []);

  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);

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

  async function attachHubToolkit() {
    if (busy || !hubToolkitId.trim()) return;
    setBusy('hub-attach');
    setHubMessage('');
    try {
      const response = await fetch('/api/do/mcp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'mcp_market_hub',
          toolId: 'attach_toolkit',
          approved: true,
          arguments: {
            toolkitId: hubToolkitId.trim(),
            label: hubLabel.trim() || hubToolkitId.trim(),
            sourceUrl: mcp?.mcpMarketHub?.hubUrl,
          },
        }),
      });
      const data = await response.json() as {
        receipt?: { status: string; summary: string; detail?: { attached?: HubAttached } };
        message?: string;
      };
      if (!response.ok || data.receipt?.status !== 'ok') {
        throw new Error(data.receipt?.summary || data.message || 'Attach failed.');
      }
      setHubMessage(`Attached as local_draft: ${data.receipt?.detail?.attached?.toolkitId ?? hubToolkitId.trim()} — not Hub cloud sync.`);
      setHubToolkitId('');
      setHubLabel('');
      const gateway = await readMcp();
      setMcp(gateway);
    } catch (error) {
      setHubMessage(error instanceof Error ? error.message : 'Attach failed.');
    } finally {
      setBusy('');
    }
  }

  return <ConnectionsView state={state} mcp={mcp} busy={busy} message={message} technicalError={technicalError}
    hubToolkitId={hubToolkitId} hubLabel={hubLabel} hubMessage={hubMessage}
    setHubToolkitId={setHubToolkitId} setHubLabel={setHubLabel}
    refresh={refresh} connect={connect} attachHubToolkit={attachHubToolkit}/>;
}

type ConnectionsViewProps = {
  state: State | null;
  mcp: McpState | null;
  busy: string;
  message: string;
  technicalError?: string;
  hubToolkitId: string;
  hubLabel: string;
  hubMessage: string;
  setHubToolkitId: (value: string) => void;
  setHubLabel: (value: string) => void;
  refresh: () => void;
  connect: (app: string) => void;
  attachHubToolkit: () => void;
};

export function ConnectionsView({ state, mcp, busy, message, technicalError, hubToolkitId, hubLabel, hubMessage,
  setHubToolkitId, setHubLabel, refresh, connect, attachHubToolkit }: ConnectionsViewProps) {
  const connected = useMemo(() => {
    const set = new Set<string>();
    for (const account of state?.signedIn ? state.accounts : []) {
      if (!account.healthy) continue;
      set.add(account.app);
      if (account.app === 'slack_v2') set.add('slack');
    }
    return set;
  }, [state]);
  const unhealthy = useMemo(() => {
    const set = new Set<string>();
    for (const account of state?.signedIn ? state.accounts : []) {
      if (account.healthy) continue;
      set.add(account.app);
      if (account.app === 'slack_v2') set.add('slack');
    }
    return set;
  }, [state]);

  return <div className={styles.shell}>
    <header className={styles.topbar}><div><Link href="/do" className={styles.brand}>DO</Link><span>/</span><strong>connections</strong></div><nav><Link href="/do/household">Household Floor</Link><Link href="/do/office">office</Link><Link href="/do/builder">Builder DO</Link></nav></header>
    <main className={styles.main}>
      <section className={styles.hero}>
        <div><p>DO / connections</p><h1>Connect the tools you use.</h1></div>
        <p>Bring your mail, calendar and everyday work into DO. Choose what to share, then review anything that changes a connected tool.</p>
      </section>
      <p className={styles.permission}>Linking an account does not grant permission to read private information or make changes. DO asks separately when a task needs that access.</p>

      {!state ? <p className={styles.notice} role="status">{message ? 'Account status unavailable' : 'Checking available capabilities…'}</p> : !state.signedIn ? <section className={styles.signin}><strong>Sign in before connecting personal tools.</strong><p>Connections are tied to your own DO account so another user cannot inherit your grants.</p><Link href="/login?redirect=%2Fdo%2Fconnections">Open DO sign-in <ArrowUpRight size={16}/></Link></section> : <section className={styles.account}><strong>Signed in to your DO account</strong><p>These connections belong to this account. Task permissions are requested separately.</p></section>}
      {message ? <div className={styles.error} role="alert">{message} <button type="button" onClick={() => void refresh()}>Try again</button></div> : null}
      {state?.signedIn && state.accountsAvailable === false ? <div className={styles.notice} role="status">{accountNotice(state)} <button type="button" onClick={() => void refresh()}>Check again</button></div> : null}

      <section className={styles.tools} aria-labelledby="your-tools">
        <h2 id="your-tools">Your tools</h2>
        <p>Choose a tool for the work you want DO to help with.</p>
      {GROUPS.map((group) => {
        const cards = state?.capabilities.filter((capability) => capability.group === group) ?? [];
        if (!cards.length) return null;
        return <section className={styles.group} key={group}>
          <header><h3>{group}</h3><p>{groupHelper(group)}</p></header>
          <div className={styles.grid}>{cards.map((capability) => <article className={styles.card} key={capability.key}>
            <div className={styles.cardTop}><span data-status={capability.status}>{capability.status === 'connectable' ? 'Personal tool' : capability.status === 'preview' ? 'Preview' : 'Included in DO'}</span></div>
            <h4>{capability.label}</h4>
            <p>{capability.description}</p>
            <small>{capability.authority === 'read' ? 'Read with task consent' : capability.authority === 'approval_required' ? 'Approval required before changes' : 'Prepare in DO'}</small>
            {capability.apps?.length ? <div className={styles.apps}>{capability.apps.map((app) => {
              const isConnected = connected.has(app.slug);
              const needsReconnect = unhealthy.has(app.slug);
              if (state?.signedIn && state.accountsAvailable === false) return <div className={styles.appState} key={app.slug}>
                <strong>{app.label}</strong><span className={styles.status}>Connection status unknown</span>
              </div>;
              if (isConnected) return <div className={styles.appState} key={app.slug}>
                <strong>{app.label}</strong><span className={styles.status}>Connected / unverified</span>
                <p>Account linked. No tool call has been verified here.</p>
              </div>;
              const label = busy === app.slug ? `Opening ${app.label}…`
                : !state?.signedIn ? `Sign in · ${app.label}`
                : !state?.availability[app.slug] ? `${app.label} · setup needed`
                : needsReconnect ? `Reconnect ${app.label}` : `Connect ${app.label}`;
              return <button type="button" key={app.slug}
                disabled={!state?.signedIn || !state?.availability[app.slug] || state.accountsAvailable === false || Boolean(busy)}
                onClick={() => void connect(app.slug)}>{label}</button>;
            })}</div> : <div className={styles.included}>{capability.status === 'preview' ? 'Preview · not yet connected to DO' : 'Included capability · availability depends on the task'}</div>}
          </article>)}</div>
        </section>;
      })}
      </section>

      <details className={styles.technical}>
        <summary>Technical connection details</summary>
        <p className={styles.notice}>Provider setup, toolkits and execution routes. These details are separate from your personal account connections.</p>
      <section className={styles.group} id="mcp-gateway">
        <header>
          <span>mcp gateway</span>
          <p>Hub pack → configure env → connect → allowlist call → receipt</p>
        </header>
        {mcp ? (
          <>
            <p className={styles.notice} style={{ marginTop: 14 }}>{mcp.cursorMcpNote}</p>
            {mcp.portableAgentNote ? <p className={styles.notice}>{mcp.portableAgentNote}</p> : null}
            {mcp.fourLayerStack?.length ? (
              <div className={styles.included} style={{ marginTop: 12 }}>
                {mcp.fourLayerStack.map((layer) => (
                  <p key={layer.layer} style={{ margin: '4px 0' }}>
                    <strong>{layer.layer}. {layer.label}</strong> — {layer.role}
                  </p>
                ))}
              </div>
            ) : null}
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

            {mcp.mcpMarketHub ? (
              <>
                <header style={{ marginTop: 28 }} id="mcp-market-hub">
                  <span>mcp market hub · attach toolkit</span>
                  <p>discovery / pack — not execute · local_draft until Hub API exists</p>
                </header>
                <article className={styles.card} style={{ marginTop: 14, maxWidth: 560 }}>
                  <h2>Attach a Hub toolkit to this DO</h2>
                  <p>{mcp.mcpMarketHub.connectHint}</p>
                  <p style={{ marginTop: 8 }}>
                    <a href={mcp.mcpMarketHub.hubUrl} target="_blank" rel="noreferrer">Open Hub <ArrowUpRight size={14}/></a>
                    {' · '}
                    <a href={mcp.mcpMarketHub.directoryUrl} target="_blank" rel="noreferrer">Directory</a>
                    {' · '}
                    <a href={mcp.mcpMarketHub.appUrl} target="_blank" rel="noreferrer">App</a>
                  </p>
                  <small>Catalog API: {mcp.mcpMarketHub.publicCatalogApi} — no fake live Hub calls.</small>
                  <div className={styles.apps} style={{ marginTop: 12, flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                    <label>
                      Toolkit id
                      <input
                        type="text"
                        value={hubToolkitId}
                        onChange={(e) => setHubToolkitId(e.target.value)}
                        placeholder="acme/customer-success"
                        disabled={!mcp.signedIn || Boolean(busy)}
                        style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px' }}
                      />
                    </label>
                    <label>
                      Label (optional)
                      <input
                        type="text"
                        value={hubLabel}
                        onChange={(e) => setHubLabel(e.target.value)}
                        placeholder="Customer success toolkit"
                        disabled={!mcp.signedIn || Boolean(busy)}
                        style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px' }}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={!mcp.signedIn || !hubToolkitId.trim() || Boolean(busy)}
                      onClick={() => void attachHubToolkit()}
                    >
                      {!mcp.signedIn ? 'Sign in to attach' : busy === 'hub-attach' ? 'Attaching…' : 'Attach as local_draft'}
                    </button>
                  </div>
                  {hubMessage ? <div className={styles.included} style={{ marginTop: 10 }}>{hubMessage}</div> : null}
                  {(mcp.mcpMarketHub.attached ?? []).length ? (
                    <div className={styles.included} style={{ marginTop: 12 }}>
                      {(mcp.mcpMarketHub.attached as HubAttached[]).map((item) => (
                        <p key={item.toolkitId} style={{ margin: '4px 0' }}>
                          {item.label} · {item.toolkitId} · {item.syncState}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.included} style={{ marginTop: 12 }}>No Hub toolkits attached yet.</div>
                  )}
                  <div className={styles.included} style={{ marginTop: 12 }}>
                    Lookalikes (not Hub): {mcp.mcpMarketHub.lookalikes.map((l) => l.name).join(', ')} — see DO-MCP-MARKET-HUB.md
                  </div>
                </article>
              </>
            ) : null}

            {mcp.nzLive?.length ? (
              <>
                <header style={{ marginTop: 28 }} id="nz-live">
                  <span>nz live · named toolkits</span>
                  <p>Travel NZ · Civic Watch · SME Compliance · Household Floor NZ · Property NZ · Hazard NZ · Energy &amp; Cost · Media Pulse</p>
                </header>
                {mcp.nzLiveGroceryNote ? <p className={styles.notice}>{mcp.nzLiveGroceryNote}</p> : null}
                {mcp.nzLiveNamedToolkits?.length ? (
                  <div className={styles.grid} style={{ marginTop: 12 }}>
                    {mcp.nzLiveNamedToolkits.map((kit) => (
                      <article className={styles.card} key={kit.id}>
                        <div className={styles.cardTop}>
                          <div className={styles.icon}><PlugZap size={17}/></div>
                          <span>{kit.toolIds.length} tools</span>
                        </div>
                        <h2>{kit.label}</h2>
                        <p>{kit.fit}</p>
                        <small>{kit.id}</small>
                      </article>
                    ))}
                  </div>
                ) : null}
                <header style={{ marginTop: 28 }}>
                  <span>nz live tools</span>
                  <p>live · needs_key · stub — public feeds + edge functions</p>
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
                      <small>
                        {tool.namedToolkit ? `${tool.namedToolkit} · ` : ''}
                        {tool.toolId}
                        {tool.envKeys.length ? ` · ${tool.envKeys.join(', ')}` : ' · keyless'}
                        {tool.priority ? ` · ${tool.priority}` : ''}
                      </small>
                      <div className={styles.included}>
                        {tool.note
                          ? tool.note
                          : tool.status === 'live'
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
              {mcp.allowlist.filter((tool) => tool.provider !== 'nz_live' && tool.provider !== 'mcp_market_hub').map((tool) => (
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
        ) : technicalError ? (
          <div className={styles.notice} role="status">{technicalError} <button type="button" onClick={() => void refresh()}>Try again</button></div>
        ) : (
          <p className={styles.notice}>Loading MCP gateway…</p>
        )}
      </section>



      <section className={styles.boundary}><strong>Cursor MCP ≠ DO MCP.</strong><p>IDE plugins do not become customer DO tools. Four layers: Hub discovers/packs · Composio/Zapier/Treg execute · Pipedream first-party OAuth · NZ Live domain data. Hub is not an execute gateway.</p></section>
      </details>
    </main>
  </div>;
}
