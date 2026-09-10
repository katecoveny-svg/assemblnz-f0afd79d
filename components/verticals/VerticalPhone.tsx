'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ArrowUp, ArrowUpRight, Check, ChevronLeft, FileDown, FileText, Layers, Maximize2, MessageCircle, Minimize2, RotateCcw, Signal, Square, Wifi } from 'lucide-react';
import { VERTICALS, type VerticalSlug } from '@/lib/verticals/config';
import { isSpecialist } from '@/lib/specialists/sources';
import { AgentMarkdown } from '@/components/marketplace/AgentMarkdown';
import './vertical-apps.css';

type Source = { title: string; url: string | null; retrievedAt: string };
type Reply = { reply: string; mode: 'live'; agent: string; agentName: string; sourceStatus: 'retrieved' | 'unavailable' | 'not-requested'; sources: Source[]; sourceFailures?: string[]; createdAt: string };
type Message = { role: 'user' | 'assistant'; content: string; receipt?: Reply };

export function VerticalPhone({ slug, native = false, preparedPrompt }: { slug: VerticalSlug; native?: boolean; preparedPrompt?: { text: string; id: number } }) {
  const v = VERTICALS[slug];
  const tool = { arc: { label: 'Plans', anchor: 'arc-model' }, forge: { label: 'Content', anchor: 'forge-content' }, customs: { label: 'Entry', anchor: 'gateway-model' }, ensemble: { label: 'Studio', anchor: 'ensemble-desk' }, retirement: { label: 'Plan', anchor: 'workspace' }, flux: { label: 'Pipeline', anchor: 'workspace' }, aroha: { label: 'People', anchor: 'workspace' } }[slug];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState('');
  const [failed, setFailed] = useState('');
  const [tab, setTab] = useState<'chat' | 'review'>('chat');
  const [draft, setDraft] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState(790);
  const [saved, setSaved] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const conversationPosition = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const inFlight = useRef(false);
  const lastReply = [...messages].reverse().find(m => m.receipt)?.receipt;
  const state = !online ? 'Offline' : busy ? 'Preparing your draft' : error ? 'Reply interrupted' : lastReply ? 'Live reply received' : 'Ready to connect';

  const [appliedPrompt, setAppliedPrompt] = useState(preparedPrompt);
  if (preparedPrompt && appliedPrompt !== preparedPrompt) {
    setAppliedPrompt(preparedPrompt); setInput(preparedPrompt.text.slice(0, 1000)); setTab('chat');
  }
  useEffect(() => { if (preparedPrompt) composer.current?.focus(); }, [preparedPrompt]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update(); window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); controller.current?.abort(); };
  }, []);
  useEffect(() => {
    const el = scroll.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, error]);
  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = conversationPosition.current;
    if (expanded || restoreFocus.current) expandButton.current?.focus();
    if (!expanded) restoreFocus.current = false;
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        conversationPosition.current = scroll.current?.scrollTop ?? 0;
        setExpanded(false);
      }
      if (event.key !== 'Tab') return;
      const targets = Array.from(frame.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], textarea:not(:disabled), input:not(:disabled), [tabindex="0"]') ?? []).filter(el => el.getClientRects().length);
      const first = targets[0]; const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', key);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', key); };
  }, [expanded]);

  function toggleExpanded() {
    if (!expanded) {
      setCollapsedHeight(frame.current?.getBoundingClientRect().height ?? 790);
      restoreFocus.current = true;
    }
    conversationPosition.current = scroll.current?.scrollTop ?? 0;
    setExpanded(value => !value);
  }

  async function send(text: string, retry = false) {
    const clean = text.trim();
    if (!clean || clean.length > 1000 || inFlight.current || !navigator.onLine) return;
    inFlight.current = true;
    controller.current = new AbortController();
    const timeout = window.setTimeout(() => controller.current?.abort(), 55000);
    const history = (retry ? messages.slice(0, -1) : messages).slice(-8).map(m => ({ role: m.role, content: m.content.slice(0, 5000) }));
    if (!retry) setMessages(m => [...m, { role: 'user', content: clean }]);
    setInput(''); setBusy(true); setError(''); setFailed(''); setSaved(false);
    try {
      const response = await fetch(`/api/verticals/${slug}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', signal: controller.current.signal, body: JSON.stringify({ message: clean, history }) });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.mode !== 'live' || !data?.reply || data.agent !== v.agent) throw new Error(data?.error || 'That reply could not be completed. Try again.');
      setMessages(m => [...m, { role: 'assistant', content: data.reply, receipt: data as Reply }]);
      setDraft(data.reply); setReviewer('');
    } catch (e) {
      setError(e instanceof Error && e.name === 'AbortError' ? 'The reply was stopped or took too long. You can try again.' : e instanceof Error ? e.message : 'The connection was interrupted. Try again.');
      setFailed(clean);
    } finally { window.clearTimeout(timeout); setBusy(false); inFlight.current = false; }
  }

  function reset() {
    if (inFlight.current) return;
    setMessages([]); setDraft(''); setReviewer(''); setInput(''); setError(''); setFailed(''); setSaved(false); setTab('chat');
  }

  function saveDraft() {
    if (!lastReply || !draft.trim()) return;
    const text = `${v.name} · assembl\n${v.output} — DRAFT FOR REVIEW\nPrepared by ${v.agentName}\nGenerated: ${lastReply.createdAt}\nReviewer: ${reviewer.trim() || `${v.reviewer} — not yet named`}\n\n${draft}\n\nSOURCE RECORD\n${lastReply.sourceStatus === 'retrieved' ? lastReply.sources.map(s => `${s.title} · ${s.url || 'No public URL'} · retrieved ${s.retrievedAt}`).join('\n') : lastReply.sourceStatus === 'unavailable' ? 'Live source search was unavailable or found no match.' : 'No live source search was performed for this reply.'}\n\nEdited after generation: ${draft !== lastReply.reply ? 'yes' : 'no'}\nNot sent, lodged, published or approved. Check the draft before use.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `${slug}-draft.txt`; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000); setSaved(true);
  }

  const phone = <div ref={frame} className={`va-phone-stage ${native ? 'va-phone-native' : ''} ${expanded ? 'va-phone-expanded' : ''}`} data-lenis-prevent={expanded || undefined} role={expanded ? 'dialog' : undefined} aria-modal={expanded || undefined} aria-label={expanded ? `${v.name} expanded chat` : undefined}>
    <div className="va-phone" data-agent={v.agent}>
      {!native && <div className="va-hardware" aria-hidden="true"><span>9:41</span><i className="va-island" /><span><Signal size={14} /><Wifi size={15} /><i className="va-battery" /></span></div>}
      <header className="va-phone-header">
        <Image unoptimized src={`/brand/vertical-apps/${slug}/icon-192.png`} width={44} height={44} alt="" />
        <div><strong>{v.name}</strong><span>{v.agentName === v.name ? 'NZ specialist' : `with ${v.agentName}`}</span></div>
        {!native && <button ref={expandButton} type="button" className="va-icon-button" aria-label={expanded ? 'Close expanded chat' : 'Expand chat'} onClick={toggleExpanded}>{expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>}
        <button type="button" className="va-icon-button" disabled={busy || messages.length === 0} aria-label="Start a new conversation" onClick={reset}><RotateCcw size={17} /></button>
      </header>
      <div className="va-connection" role="status" data-state={!online || error ? 'offline' : busy ? 'busy' : lastReply ? 'live' : 'ready'}><i /><span>{state}</span><span>Drafts for review</span></div>
      {tab === 'chat' ? <>
        <div className="va-conversation" ref={scroll} data-lenis-prevent tabIndex={0} aria-label={`${v.name} conversation`}>
          <p className="va-session-label">Your conversation · this session</p>
          <div className="va-welcome"><span className="va-small">{v.agentName}</span><p>{v.greeting}</p></div>
          {messages.length === 0 && <div className="va-starters"><p>Try a sample</p>{v.starters.map(s => <button type="button" key={s.label} onClick={() => { setInput(s.prompt); composer.current?.focus(); }}>{s.label}<ArrowUpRight size={15} aria-hidden /></button>)}</div>}
          <div role="log" aria-live="polite" aria-relevant="additions text">
            {messages.map((m, i) => <div className={`va-message va-message-${m.role}`} key={i}>
              <span className="va-message-by">{m.role === 'user' ? 'You' : v.agentName}</span>
              <div className="va-bubble">{m.role === 'user' ? <p>{m.content}</p> : <AgentMarkdown text={m.content} />}</div>
              {m.receipt && <span className="va-message-receipt"><Check size={12} aria-hidden />Live response · draft</span>}
            </div>)}
          </div>
          {busy && <div className="va-thinking" role="status"><i /><i /><i /><span>{v.agentName} is preparing a reply</span></div>}
          {!online && <p className="va-chat-alert" role="status">You are offline. Reconnect to send a message; nothing is queued.</p>}
          {error && <div className="va-chat-alert" role="alert"><p>{error}</p><button type="button" disabled={!online || busy} onClick={() => void send(failed, true)}>Try again</button></div>}
          {lastReply && !busy && !error && <button type="button" className="va-review-link" onClick={() => setTab('review')}><FileText size={15} />Review the latest draft<ArrowUpRight size={15} /></button>}
        </div>
        <form className="va-composer" onSubmit={e => { e.preventDefault(); void send(input); }}>
          <label className="sr-only" htmlFor={`va-message-${slug}`}>Message {v.agentName}</label>
          <textarea id={`va-message-${slug}`} ref={composer} rows={2} maxLength={1000} value={input} placeholder={`Message ${v.agentName}…`} disabled={busy} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(input); } }} />
          {busy ? <button type="button" className="va-send" aria-label="Stop reply" onClick={() => controller.current?.abort()}><Square size={15} fill="currentColor" /></button> : <button className="va-send" type="submit" aria-label="Send message" disabled={!online || !input.trim()}><ArrowUp size={21} /></button>}
          <p>Use sample details. Messages are processed to prepare a reply.</p>
        </form>
      </> : <div className="va-review-pane" data-lenis-prevent>
        <button type="button" className="va-back" onClick={() => setTab('chat')}><ChevronLeft size={16} />Conversation</button>
        <p className="va-eyebrow">{v.output}</p><h3>Yours to check.</h3>
        {lastReply ? <>
          <p className="va-small">Edit the draft and name who should review it. Downloading does not send or approve it.</p>
          <label>Prepared draft<textarea value={draft} onChange={e => { setDraft(e.target.value); setSaved(false); }} rows={10} /></label>
          <label>Reviewer<input value={reviewer} maxLength={100} placeholder={v.reviewer} onChange={e => { setReviewer(e.target.value); setSaved(false); }} /></label>
          <div className="va-sources"><strong>Source record</strong><p>{lastReply.sourceStatus === 'retrieved' ? 'Sources retrieved for this reply. Check the draft against them.' : lastReply.sourceStatus === 'unavailable' ? 'Live sources could not be verified for this reply.' : 'Prepared from this conversation. No live source search was requested.'}</p>
            {lastReply.sources.map((s, i) => <div key={`${s.url}-${i}`}>{s.url && /^https?:\/\//i.test(s.url) ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a> : <span>{s.title}</span>}<small>Retrieved {s.retrievedAt}</small></div>)}
            {!!lastReply.sourceFailures?.length && <p>Not verified this time: {lastReply.sourceFailures.join('; ')}.</p>}
          </div>
          <button type="button" className="va-button va-button-primary" disabled={!draft.trim()} onClick={saveDraft}>{saved ? <Check size={17} /> : <FileDown size={17} />}{saved ? 'Draft downloaded' : 'Download draft'}</button>
        </> : <p className="va-small">Your live reply will appear here. Ask a question to start.</p>}
      </div>}
      <nav className="va-phone-tabs" aria-label="Agent workspace">
        <button type="button" aria-current={tab === 'chat' ? 'page' : undefined} onClick={() => setTab('chat')}><MessageCircle size={17} />Chat</button>
        <button type="button" aria-current={tab === 'review' ? 'page' : undefined} onClick={() => setTab('review')}><FileText size={17} />Review{lastReply && <i aria-label="Draft ready" />}</button>
        {native && <a href={`/agents/${slug}#${tool.anchor}`}><Layers size={17} />{tool.label}</a>}
        {isSpecialist(slug) ? <a href="#workspace" onClick={() => setExpanded(false)}><Layers size={17}/>{tool.label}</a> : <a href={`/agents/${slug}${native ? '#top' : '/app'}`}><ArrowUpRight size={17} />{native ? 'Story' : 'Open app'}</a>}
      </nav>
      {!native && <div className="va-home-indicator" aria-hidden="true"><i /></div>}
    </div>
  </div>;

  return expanded ? <><div aria-hidden="true" style={{ height: collapsedHeight }} />{createPortal(phone, document.body)}</> : phone;
}
