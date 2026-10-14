'use client';
import { useEffect, useRef, useState } from 'react';
import { companionRequest } from '@/apps/do/browser/connection/client';
import type { ConnectionSnapshot } from '@/apps/do/browser/connection/broker';
import type { ConnectionCommand } from '@/apps/do/browser/connection/protocol';
import styles from './browser-task.module.css';

export function BrowserTaskReview({ expectedWorkspace, initialBrief = '' }: { expectedWorkspace: string; initialBrief?: string }) {
  const [brief, setBrief] = useState(initialBrief);
  const [connection, setConnection] = useState<ConnectionSnapshot | null>(null);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [readConsent, setReadConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('Check the companion connection before sharing anything from a website.');
  const connectedId = useRef<string | null>(null);
  const alive = useRef(true), generation = useRef(0), lock = useRef(false);
  const validOwner = expectedWorkspace !== 'guest';
  async function run(command: ConnectionCommand) {
    if (lock.current || !validOwner) return;
    lock.current = true; setBusy(true);
    const attempt = ++generation.current;
    try {
      const result = await companionRequest(command);
      if (!alive.current || attempt !== generation.current) return;
      if (result.connected && result.owner !== expectedWorkspace) throw new Error('Account changed. Disconnect and sign in to the intended Personal DO account.');
      connectedId.current = result.connected ? result.connectionId : null;
      setConnection(result);
      setNotice(result.connected ? result.reason : 'Disconnected. No further actions can start. Check the tab for any edit already in flight; nothing will retry automatically.');
      if (command.action === 'observe' || !result.connected) { setQuantities({}); setReadConsent(false); }
    } catch (error) {
      if (alive.current && attempt === generation.current) { setConnection(null); setQuantities({}); setReadConsent(false); setNotice(error instanceof Error ? error.message : 'Connection unavailable.'); }
    } finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  async function cancelNow(connectionId: string) {
    // Cancellation must not queue behind a slow read or status request.
    const attempt = ++generation.current;
    connectedId.current = null;
    setConnection(null); setQuantities({}); setReadConsent(false);
    setNotice('Disconnecting. An edit already in flight may still finish; nothing will retry automatically.');
    try {
      await companionRequest({ action: 'cancel', connectionId });
      if (alive.current && attempt === generation.current) setNotice('Disconnected. Check the tab for any edit already in flight.');
    } catch {
      if (alive.current && attempt === generation.current) setNotice('Cancellation could not be confirmed. Disconnect in the companion or close the selected tab. The connection expires after two minutes.');
    }
  }
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; if (connectedId.current) void companionRequest({ action: 'cancel', connectionId: connectedId.current }).catch(() => {}); };
  }, []);
  // Status polling never reads the storefront or grants authority. Expiry and owner changes clear it.
  useEffect(() => {
    if (!connection?.connected) return;
    const timer = setInterval(() => { void run({ action: 'status' }); }, 2500);
    return () => clearInterval(timer);
    // run uses the current owner; component is keyed by owner/task in Personal DO.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection?.connected, expectedWorkspace]);
  const connected = connection?.connected ? connection : null;
  const selected = Object.entries(quantities).filter(([, quantity]) => quantity !== '');
  const valid = selected.length > 0 && selected.every(([, raw]) => /^(?:[1-9]|1[0-9]|20)$/.test(raw));
  const reviewed = Boolean(connected?.proposal);
  return <section className={styles.panel} aria-label="Browser task review">
    <h2>Use your browser with DO</h2>
    <p>Review a task from writing or a call, then choose exactly what the companion may read or change.</p>
    <p role="status">{notice}</p>
    {!validOwner && <p>Sign in to Personal DO first. Guest work cannot connect a tab.</p>}
    <button type="button" disabled={busy || !validOwner} onClick={() => void run({ action: 'status' })}>Check companion connection</button>
    {!connected && <details><summary>Connect from desktop Chrome</summary><ol>
      <li>Use a reviewed companion version with task connection support. Installation and permissions must be checked first.</li>
      <li>Keep this signed-in Personal DO tab open. Select the authorised synthetic storefront tab, open DO → More tools → Connect a tab, and choose this DO window.</li>
      <li>Confirm the two-minute connection, then check it here.</li>
    </ol><p>This staged adapter supports only the local fictional storefront. Woolworths and other websites are unavailable. iPhone commands cannot reach desktop Chrome yet; remote pairing is not connected.</p></details>}
    <label>Reviewed task<textarea maxLength={6000} rows={3} value={brief} disabled={busy || reviewed} onChange={event => setBrief(event.target.value)} /></label>
    {connected && <>
      <p>Selected tab {connected.target.tabId}: <code>{connected.target.url}</code><br />Expires {new Date(connected.expiresAt).toLocaleTimeString()}. Session-only; no retailer access.</p>
      <label><input type="checkbox" checked={readConsent} disabled={busy || reviewed} onChange={event => setReadConsent(event.target.checked)} />Read fictional product names, prices, availability and cart quantities from this tab only.</label>
      <button type="button" disabled={busy || !readConsent || reviewed} onClick={() => void run({ action: 'observe', connectionId: connected.connectionId })}>Read reviewed product fields</button>
      {connected.observation && <fieldset disabled={busy || reviewed}><legend>Choose products and total quantities</legend>{connected.observation.items.map(item => <label key={item.productId}>
        {item.name} · ID/SKU: {item.productId} · NZD {(item.unitPriceCents / 100).toFixed(2)} · currently {item.quantity}
        <input aria-label={`${item.name} (${item.productId}) target quantity`} inputMode="numeric" type="number" min={1} max={20} value={quantities[item.productId] ?? ''} disabled={!item.available} placeholder="Leave unchanged" onChange={event => setQuantities(current => ({ ...current, [item.productId]: event.target.value }))} />
      </label>)}</fieldset>}
      <button type="button" disabled={busy || reviewed || !brief.trim() || !valid} onClick={() => void run({ action: 'prepare', connectionId: connected.connectionId, brief, quantities: selected.map(([productId, quantity]) => ({ productId, quantity: Number(quantity) })) })}>Preview these fixture edits</button>
      {connected.proposal && <div><h3>Awaiting companion approval</h3><ul>{connected.proposal.items.map(item => <li key={item.productId}>{item.name} · ID/SKU: {item.productId}: {item.quantity} → {item.targetQuantity}</li>)}</ul><p>Return to the companion’s Connect a tab screen to approve this exact list. Preparing a task here does not approve cart changes.</p></div>}
      {connected.receipt && <div role="status"><h3>{connected.receipt.status === 'verified' ? 'Fixture changes verified' : 'Stopped — inspect the fixture before another review'}</h3><ul>{connected.receipt.items.map(item => <li key={item.productId}>{item.productId}: requested {item.requestedQuantity}; observed {item.observedQuantity ?? 'not confirmed'}; {item.status}</li>)}</ul><p>Only the fictional local cart was tested. No retailer action, order or payment.</p></div>}
      <button type="button" onClick={() => void cancelNow(connected.connectionId)}>Disconnect and cancel remaining actions</button>
      <p>Cancellation cannot undo an edit already in flight. An uncertain result requires checking the tab; DO will not automatically retry.</p>
    </>}
  </section>;
}
