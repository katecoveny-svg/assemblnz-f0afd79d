'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, FileCheck2, Inbox, LoaderCircle, LogOut, ShoppingBag, Wallet } from 'lucide-react';
import type { FamilyResult, FamilyMessage } from '@/apps/do/services/family';
import './family.css';
type Connection = { configured: boolean; signedIn: boolean; connected: boolean };
type Digest = { result: FamilyResult; sources: (Omit<FamilyMessage, 'text'> & { url: string })[]; checkedAt: string; moreAvailable: boolean };
const icons = { date: CalendarDays, form: FileCheck2, payment: Wallet, bring: ShoppingBag, reply: Inbox, information: FileCheck2 };
const enquiry = 'mailto:assembl@assembl.co.nz?subject=DO%20family%20admin%20enquiry&body=I%20would%20like%20to%20set%20up%20Gmail%20school%20admin%20with%20DO.';
export function FamilyDo() {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [senders, setSenders] = useState('');
  const [days, setDays] = useState(14);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [digest, setDigest] = useState<Digest | null>(null);
  const [reviewed, setReviewed] = useState<number[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [trialUsed, setTrialUsed] = useState(false);
  async function refresh() {
    const res = await fetch('/api/do/family/connection', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Connection unavailable.');
    setConnection(data);
  }
  useEffect(() => {
    let active = true;
    void fetch('/api/do/family/connection', { cache: 'no-store' }).then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Connection unavailable.');
      if (active) setConnection(data);
    }).catch(e => { if (active) setNotice(e.message); });
    return () => { active = false; };
  }, []);
  async function act(label: string, task: () => Promise<void>) {
    setBusy(label); setNotice('');
    try { await task(); } catch (e) { setNotice(e instanceof Error ? e.message : 'This step could not finish.'); }
    finally { setBusy(''); }
  }
  async function api(path: string, method = 'POST', body?: unknown) {
    const res = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    if (!res.ok) { if (data.error === 'trial_exhausted') setTrialUsed(true); throw new Error(data.message || 'This step could not finish.'); }
    return data;
  }
  async function run() {
    const data = await api('/api/do/family', 'POST', { senders: senders.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean), days, consent });
    if (data.empty) { setDigest(null); setNotice(data.message); return; }
    setDigest(data); setReviewed([]);
  }
  function download() {
    if (!digest) return;
    const text = ['DO · School admin · Prepared for review', digest.result.summary, ...digest.result.items.map(i => `${i.title}\n${i.when} · ${i.person}\n${i.detail}\nEvidence: “${i.evidence}”\n${digest.sources.find(s => s.id === i.sourceId)?.url || ''}`), ...digest.result.questions, 'Review against the original emails. Attachments were not read. Nothing was sent, paid or added to a calendar.'].join('\n\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'do-school-admin.txt'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <main className="family-do">
    <header><Link href="/do"><ArrowLeft size={16} /> DO</Link><Link href="/">assembl</Link>{connection?.signedIn && <button disabled={Boolean(busy)} onClick={() => void act('Signing out', async () => { await api('/api/do/session', 'DELETE'); setDigest(null); setSenders(''); setConsent(false); await refresh(); })}><LogOut size={16} /> Sign out</button>}</header>
    <section className="family-intro"><p className="family-kicker">A LITTLE LESS TO REMEMBER</p><h1>School admin.<br/>In one place.</h1><p>Bring the dates, forms, payments and things to pack together from the school emails you choose.</p></section>
    <div className="family-layout"><aside className="family-setup">
      <div className="family-step"><span>01</span><h2>Your Gmail</h2><p>A private connection to your DO account.</p></div>
      {!connection ? <button disabled={Boolean(busy)} onClick={() => void act('Checking connection', refresh)}>Check connection</button> : !connection.configured ? <div className="family-callout"><strong>Gmail pilot setup needed</strong><p>assembl needs to finish the Gmail read-access setup before this service can read emails.</p><a href={enquiry}>Enquire about family DO <ArrowUpRight size={16}/></a></div> : !connection.signedIn ? <form onSubmit={e => { e.preventDefault(); void act('Signing in', async () => { await api('/api/do/session', 'POST', { email, password }); setPassword(''); await refresh(); }); }}><label>DO account email<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required/></label><button disabled={Boolean(busy)}>Sign in</button><p>For existing pilot accounts. <a href={enquiry}>Ask assembl to set up your account.</a></p></form> : connection.connected ? <div className="family-connected"><Check size={18}/> Gmail connected <button disabled={Boolean(busy)} onClick={() => void act('Disconnecting', async () => { await api('/api/do/family/connection', 'DELETE'); setDigest(null); await refresh(); })}>Disconnect</button></div> : <><button disabled={Boolean(busy)} onClick={() => void act('Opening Gmail', async () => { const data = await api('/api/do/family/connection'); window.location.assign(data.url); })}>Connect Gmail <ArrowUpRight size={16}/></button><button disabled={Boolean(busy)} onClick={() => void act('Checking Gmail', refresh)}>I have connected — check again</button></>}
      <form onSubmit={e => { e.preventDefault(); void act('Reading school emails and preparing your list', run); }}>
        <div className="family-step"><span>02</span><h2>Choose your school emails</h2></div>
        <label>Sender email addresses<textarea rows={3} placeholder="One school or activity email address per line" value={senders} onChange={e => setSenders(e.target.value)} required maxLength={2050}/></label>
        <label>Look back<select value={days} onChange={e => setDays(Number(e.target.value))}><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option></select></label>
        <p>Up to 20 recent messages from these senders. Attachments stay in Gmail. Long messages may be shortened and will be marked.</p>
        <label className="family-consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/><span>Use these emails to prepare my list through assembl’s text service. I have permission to use this family information.</span></label>
        <button className="family-primary" disabled={!connection?.connected || !consent || Boolean(busy) || trialUsed}>{busy ? <LoaderCircle size={18}/> : <Inbox size={18}/>} Prepare my school admin</button>
        <p>{connection?.signedIn
          ? <>Signed-in prepare is unlimited. Anonymous sandbox tries still share a per-network free allowance.</>
          : <>Public sandbox: three free tasks per network, then <a href="/login?redirect=%2Fdo%2Ffamily">sign in for unlimited prepare</a> or <a href={enquiry}>enquire to continue</a>.</>}</p>
      </form>
    </aside><section className="family-results" aria-label="School admin for review">
      <div className="family-results-head"><div><p className="family-kicker">03 · YOUR REVIEW</p><h2>{digest ? 'Here’s what needs you.' : 'Your week, made clearer.'}</h2></div>{digest && <button onClick={download}>Download list</button>}</div>
      <div role="status" aria-live="polite">{busy && <p>{busy}…</p>}{notice && <p className="family-callout">{notice}</p>}</div>
      {!digest ? <div className="family-empty"><Inbox size={40}/><h3>Start with your school emails.</h3><p>Your dates, permission forms, payments and packing list will appear here, with the email behind each item.</p><p>Results stay on this page unless you download them. Leaving clears the list. DO does not send replies, make payments or change your calendar.</p></div> : <><p>{digest.result.summary}</p><p className="family-meta">Checked {new Date(digest.checkedAt).toLocaleString()} · {digest.sources.length} messages · {reviewed.length}/{digest.result.items.length} reviewed</p>{digest.moreAvailable && <p className="family-callout">More messages matched than this run could read. This is a partial list. Narrow the time range or senders to check the remainder.</p>}<div className="family-cards">{digest.result.items.map((item, index) => { const Icon = icons[item.kind]; const source = digest.sources.find(s => s.id === item.sourceId); return <article key={index} className={reviewed.includes(index) ? 'is-reviewed' : ''}><div className="family-card-kind"><Icon size={18}/>{item.kind}</div><h3>{item.title}</h3><p><strong>{item.when}</strong> · {item.person}</p><p>{item.detail}</p><blockquote>{item.evidence}</blockquote>{source && <a href={source.url} target="_blank" rel="noopener noreferrer">{source.subject || 'Open original email'} <ArrowUpRight size={14}/></a>}<label className="family-consent"><input type="checkbox" checked={reviewed.includes(index)} onChange={e => setReviewed(values => e.target.checked ? [...values, index] : values.filter(v => v !== index))}/>Checked against the email</label></article>; })}</div>{digest.result.questions.length > 0 && <div className="family-callout"><h3>Still to check</h3><ul>{digest.result.questions.map((q, i) => <li key={i}>{q}</li>)}</ul></div>}<details><summary>What was read</summary>{digest.sources.map(source => <p key={source.id}>{source.subject} · {source.from} · {source.date}{source.truncated ? ' · Text shortened' : ''}{source.hasAttachments ? ' · Attachments not read' : ''}</p>)}</details><p>Prepared for your review. Open the Gmail account you connected and check dates and requests in the original emails before acting. No replies, payments or calendar changes have been made.</p></>}
    </section></div>
  </main>;
}
