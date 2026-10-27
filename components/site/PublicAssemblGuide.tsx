'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';

type Turn = { role: 'user' | 'assistant'; content: string };

/** Public house guide only. Never loads an account, page context or personal DO. */
export function PublicAssemblGuide() {
  const [message, setMessage] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  const session = useRef<string | undefined>(undefined);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const focus = () => input.current?.focus();
    window.addEventListener('assembl:do-focus', focus);
    document.getElementById('assembl-guide-heading')?.focus();
    return () => { window.removeEventListener('assembl:do-focus', focus); request.current?.abort(); };
  }, []);
  function cancel() {
    request.current?.abort(); request.current = null; setBusy(false);
    setError('Stopped waiting. Your question may already have reached the guide; no task was created. You can still use the prepared company guide above.');
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    if (!consent || request.current || !message.trim()) return;
    const controller = new AbortController(); request.current = controller;
    const question = message.trim(); setBusy(true); setError('');
    const timeout = setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await fetch('/api/home/agent', {
        method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: turns.slice(-12), sessionId: session.current, agent: 'assembl' }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (request.current !== controller) return;
      if (!response.ok || typeof result.reply !== 'string' || !result.reply.trim())
        throw new Error(response.status === 429 ? 'The guide has reached its limit. Please email assembl@assembl.co.nz.' : 'Live answers are unavailable right now. Use the prepared company guide above, or email assembl@assembl.co.nz.');
      session.current = typeof result.sessionId === 'string' ? result.sessionId : undefined;
      setTurns(previous => [...previous, { role: 'user', content: question }, { role: 'assistant', content: result.reply }]);
      setMessage('');
    } catch (cause) {
      if (request.current === controller) setError(cause instanceof Error && cause.name !== 'AbortError' ? cause.message : 'Live answers took too long. Your question is still here. Use the prepared company guide above, or try again when ready.');
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) { request.current = null; setBusy(false); }
    }
  }
  return <>
    <p>Ask about assembl, our work or how to start. This guide uses public company information, not your account or anyone’s private memory.</p>
    <section aria-label="Prepared company guide" className="prepared-company-guide">
      <p id="assembl-guide-heading" tabIndex={-1}><strong>Prepared company guide · not a live AI answer</strong></p>
      <details open><summary>What is assembl?</summary><p>assembl is a New Zealand software business building useful digital experiences, agent-assisted workflows and interactive demonstrations. We start with one concrete piece of work and agree how the result will be checked.</p></details>
      <details><summary>What can I explore now?</summary><p><Link href="/lab">Explore Lab</Link> for interactive worlds and demonstrations. A demonstration shows an idea; it is not proof of a connected customer workflow.</p></details>
      <details><summary>How could assembl help my business?</summary><p>Bring a brief, an opportunity or a task that needs better thinking. Websites, campaigns, image, film and workflows are starting points for a conversation. Scope, availability, cost and delivery are agreed with you, not promised by this guide.</p></details>
      <details><summary>What can this guide actually do?</summary><p>Explain public information about assembl. It cannot access your account, private memory, inbox or calendar, or shop, book, pay or send messages. No live voice is offered here.</p></details>
      <p><a href="mailto:assembl@assembl.co.nz">Discuss your project with assembl</a></p>
    </section>
    {error && <p role="alert">{error}</p>}
    <div role="log" aria-label="Conversation with the assembl guide" aria-live="polite">
      {turns.map((turn, index) => <p key={index}><strong>{turn.role === 'user' ? 'You' : 'AI answer'}: </strong>{turn.content}</p>)}
    </div>
    <form onSubmit={send}>
      <p><strong>Optional live question</strong> · AI-generated answers may be unavailable. Review any answer before relying on it.</p>
      <label htmlFor="assembl-guide-question">Your question about assembl</label>
      <textarea ref={input} id="assembl-guide-question" maxLength={1000} value={message} onChange={event => setMessage(event.target.value)} disabled={busy} rows={3} />
      <label><input type="checkbox" checked={consent} disabled={busy} onChange={event => setConsent(event.target.checked)} /> Share this conversation with assembl’s model provider to answer. Questions and replies may be logged by assembl. Please leave out private information.</label>
      <button type="submit" disabled={!consent || busy || !message.trim()}>{busy ? 'Answering…' : 'Ask DO'}</button>
      {busy && <button type="button" onClick={cancel}>Cancel</button>}
    </form>
    <p>Text questions only here. No shopping, bookings or account actions. <a href="mailto:assembl@assembl.co.nz">Email assembl</a></p>
  </>;
}
