'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download } from 'lucide-react';
import { connectorDraft, type FLUX_CONNECTION_APPS } from '@/lib/specialists/connector-drafts';
import type { Lead } from '@/lib/specialists/crm';
import { downloadText } from '@/lib/specialists/planning';

type App = typeof FLUX_CONNECTION_APPS[number];
type Kind = 'salesforce-lead' | 'outlook-draft';
const empty = { company: '', lastName: '', firstName: '', email: '', description: '', recipient: '', subject: '', content: '', permission: '' };

export function FluxConnections({ leads }: { leads: Lead[] }) {
  const [connection, setConnection] = useState('Check the accounts connected to your signed-in user.');
  const [connecting, setConnecting] = useState(false);
  const [signIn, setSignIn] = useState(false);
  const [kind, setKind] = useState<Kind>('salesforce-lead');
  const [fields, setFields] = useState(empty);
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [queued, setQueued] = useState(false);
  const [notice, setNotice] = useState('');
  const change = (key: keyof typeof empty, value: string) => { setFields(f => ({ ...f, [key]: value })); setReviewed(false); setQueued(false); setNotice(''); };

  async function checkConnections(app?: App) {
    setConnecting(true); setConnection(app ? 'Preparing a secure account connection…' : 'Checking your connections…');
    try {
      const r = await fetch('/api/specialists/flux/connections', { method: app ? 'POST' : 'GET', cache: 'no-store', ...(app ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ app }) } : {}) });
      const j = await r.json(); setSignIn(r.status === 401);
      if (!r.ok) throw new Error(j.error);
      if (app && j.url) { window.location.assign(j.url); return; }
      setConnection(!j.configured ? 'Business connector setup is needed. Your pipeline and draft downloads are available.' : j.connections.length ? j.connections.map((a: { name?: string; app?: string; healthy: boolean }) => `${a.name || a.app}: ${a.healthy ? 'account connected' : 'needs attention'}`).join('. ') : 'No business account is connected for your user yet.');
    } catch (e) { setConnection(e instanceof Error ? e.message : 'Could not check connections.'); } finally { setConnecting(false); }
  }

  function selectLead(id: string) {
    const lead = leads.find(l => l.id === id);
    setReviewed(false); setQueued(false); setNotice('');
    if (!lead) { setFields(empty); return; }
    setFields({ ...empty, company: lead.company || lead.name, email: lead.permission === 'do-not-contact' ? '' : lead.email, description: [lead.notes, lead.source && `Source: ${lead.source}`, lead.nextAction && `Next step: ${lead.nextAction}`, `Contact permission: ${lead.permission}`].filter(Boolean).join('\n').slice(0, 5000), recipient: lead.permission === 'do-not-contact' ? '' : lead.email, permission: ['requested-contact', 'existing-relationship'].includes(lead.permission) ? lead.permission : '' });
    setNotice(lead.permission === 'do-not-contact' ? 'This lead is marked do not contact. Contact fields have been left empty.' : 'Review the selected lead. Add the actual contact name or write the exact email draft below.');
  }

  const draft = kind === 'salesforce-lead'
    ? { kind, reviewed, company: fields.company, lastName: fields.lastName, firstName: fields.firstName, email: fields.email, description: fields.description }
    : { kind, reviewed, recipient: fields.recipient, subject: fields.subject, content: fields.content, permission: fields.permission };
  async function requestReview(event: React.FormEvent) {
    event.preventDefault(); if (busy || queued) return;
    const parsed = connectorDraft.safeParse(draft);
    if (!parsed.success) { setNotice('Complete the required fields and confirm your review first.'); return; }
    setBusy(true); setNotice('Checking the matching account and preparing the review request…');
    try {
      const r = await fetch('/api/specialists/flux/actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) });
      const j = await r.json(); setSignIn(r.status === 401);
      if (!r.ok) throw new Error(j.error);
      setQueued(true); setNotice(`${j.message} Review reference: ${j.id}`);
    } catch (e) { setNotice(e instanceof Error ? e.message : 'The request could not be confirmed. Keep this draft and check with your operator before retrying.'); } finally { setBusy(false); }
  }

  return <section className="sp-paper sp-connections" id="flux-connections">
    <span className="sp-eyebrow">Salesforce + Microsoft 365</span><h2>Your tools. A reviewed next step.</h2>
    <p>Connect your business account, inspect the exact fields, then request an assembl operator’s review. Salesforce creates a lead after approval. Outlook creates an unsent email draft for you to review in your mailbox.</p>
    <div className="sp-actions"><button className="sp-secondary" disabled={connecting} onClick={() => void checkConnections('salesforce_rest_api')}>Connect Salesforce<ArrowUpRight size={16}/></button><button className="sp-secondary" disabled={connecting} onClick={() => void checkConnections('microsoft_outlook')}>Connect Microsoft 365<ArrowUpRight size={16}/></button><button className="sp-text-button" disabled={connecting} onClick={() => void checkConnections()}>Check my connections</button></div>
    <p className="sp-muted" role="status">{connection}</p>{signIn && <p><Link href="/login?redirect=/agents/flux/app">Sign in to connect your business account →</Link></p>}
    <div className="sp-workflow-tabs" role="group" aria-label="Business action">{([['salesforce-lead', 'Salesforce lead'], ['outlook-draft', 'Outlook email draft']] as const).map(([value, title]) => <button key={value} aria-pressed={kind === value} disabled={busy} onClick={() => { setKind(value); setReviewed(false); setQueued(false); setNotice(''); }}>{title}</button>)}</div>
    <form onSubmit={requestReview}><fieldset disabled={busy} style={{border:0,padding:0,margin:0,minWidth:0}}>
      <label>Start from a pipeline record (optional)<select defaultValue="" onChange={e => selectLead(e.target.value)}><option value="">Start a fresh draft</option>{leads.map(l => <option key={l.id} value={l.id}>{l.company || l.name}</option>)}</select></label>
      {kind === 'salesforce-lead' ? <><div className="sp-form-grid"><label>Salesforce company *<input required maxLength={160} value={fields.company} onChange={e => change('company', e.target.value)}/></label><label>Contact’s last name *<input required maxLength={80} value={fields.lastName} onChange={e => change('lastName', e.target.value)}/></label><label>Contact’s first name<input maxLength={80} value={fields.firstName} onChange={e => change('firstName', e.target.value)}/></label><label>Contact email (optional)<input type="email" value={fields.email} onChange={e => change('email', e.target.value)}/></label></div><label>Lead description *<textarea required rows={5} maxLength={5000} value={fields.description} onChange={e => change('description', e.target.value)}/></label><p className="sp-muted">Maps to Company, LastName, FirstName, Email and Description. Use a real, permitted contact name. Your Salesforce organisation’s required custom fields may need additional mapping before an action can succeed.</p></> : <><div className="sp-form-grid"><label>Draft recipient *<input type="email" required value={fields.recipient} onChange={e => change('recipient', e.target.value)}/></label><label>Basis for this contact *<select required value={fields.permission} onChange={e => change('permission', e.target.value)}><option value="">Confirm permission</option><option value="requested-contact">They requested contact</option><option value="existing-relationship">Existing relationship — scope checked</option></select></label></div><label>Email subject *<input required maxLength={200} value={fields.subject} onChange={e => change('subject', e.target.value)}/></label><label>Exact email draft *<textarea required rows={7} maxLength={5000} value={fields.content} onChange={e => change('content', e.target.value)}/></label><p className="sp-muted">Creates a plain-text draft in the connected Outlook mailbox. Sending stays with you in Microsoft 365.</p></>}
      <label className="sp-consent"><input type="checkbox" required checked={reviewed} onChange={e => setReviewed(e.target.checked)}/><span>I have checked these exact details and have permission to use them. I want an assembl operator to review this action.</span></label>
      <div className="sp-actions"><button className="sp-primary" type="submit" disabled={busy || !reviewed || queued}>{queued ? 'Awaiting operator review' : busy ? 'Preparing request…' : 'Request operator review'}</button><button className="sp-text-button" type="button" onClick={() => downloadText(`flux-${kind}-draft.txt`, JSON.stringify(draft, null, 2))}><Download size={15}/>Download draft</button></div>
      <p className="sp-notice" role="status">{notice}</p>
    </fieldset></form>
    <p className="sp-muted">Account connection and approved action execution require business connector configuration. Connecting alone does not import records, start a sync or send outreach.</p>
  </section>;
}
