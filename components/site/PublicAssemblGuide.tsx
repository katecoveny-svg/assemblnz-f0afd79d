'use client';

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
    focus();
    return () => { window.removeEventListener('assembl:do-focus', focus); request.current?.abort(); };
  }, []);
  function cancel() {
    request.current?.abort(); request.current = null; setBusy(false);
    setError('Stopped waiting. Your question may already have reached the guide; no task was created.');
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
        throw new Error(response.status === 429 ? 'The guide has reached its limit. Please email assembl@assembl.co.nz.' : 'The guide could not answer. Try again or email assembl@assembl.co.nz.');
      session.current = typeof result.sessionId === 'string' ? result.sessionId : undefined;
      setTurns(previous => [...previous, { role: 'user', content: question }, { role: 'assistant', content: result.reply }]);
      setMessage('');
    } catch (cause) {
      if (request.current === controller) setError(cause instanceof Error && cause.name !== 'AbortError' ? cause.message : 'The guide took too long. Your question is still here; try again when ready.');
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) { request.current = null; setBusy(false); }
    }
  }
  return <>
    <p>Ask about assembl, our work or how to start. This guide uses public company information, not your account or anyone’s private memory.</p>
    <div role="log" aria-label="Conversation with the assembl guide" aria-live="polite">
      {turns.map((turn, index) => <p key={index}><strong>{turn.role === 'user' ? 'You' : 'DO'}: </strong>{turn.content}</p>)}
    </div>
    <form onSubmit={send}>
      <label htmlFor="assembl-guide-question">Your question about assembl</label>
      <textarea ref={input} id="assembl-guide-question" maxLength={1000} value={message} onChange={event => setMessage(event.target.value)} disabled={busy} rows={3} />
      <label><input type="checkbox" checked={consent} disabled={busy} onChange={event => setConsent(event.target.checked)} /> Share this conversation with assembl’s model provider to answer. Questions and replies may be logged by assembl. Please leave out private information.</label>
      <button type="submit" disabled={!consent || busy || !message.trim()}>{busy ? 'Answering…' : 'Ask DO'}</button>
      {busy && <button type="button" onClick={cancel}>Cancel</button>}
    </form>
    {error && <p role="alert">{error}</p>}
    <p>Text questions only here. No shopping, bookings or account actions. <a href="mailto:assembl@assembl.co.nz">Email assembl</a></p>
  </>;
}
