'use client';

import { useState } from 'react';

/**
 * Inline reply box on a thread. Sends FROM the agent's address via the
 * token-gated /api/admin/agent-email/reply route.
 */
export function ReplyForm({
  threadId,
  token,
  toEmail,
}: {
  threadId: string;
  token: string;
  toEmail: string;
}) {
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function send() {
    if (!body.trim()) return;
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/admin/agent-email/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ threadId, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setError(data?.error || `Send failed (${res.status})`);
        return;
      }
      setStatus('sent');
      setBody('');
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Send failed');
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Reply to ${toEmail}…`}
        rows={3}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 12px',
          borderRadius: 12,
          border: '1px solid #EFEADC',
          fontFamily: "'Lato', system-ui, sans-serif",
          fontSize: 14,
          resize: 'vertical',
          color: '#3A3832',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <button
          type="button"
          onClick={send}
          disabled={status === 'sending' || !body.trim()}
          style={{
            border: 'none',
            borderRadius: 999,
            padding: '9px 20px',
            background: '#FFD42A',
            color: '#3A3832',
            fontFamily: "'Lato', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            cursor: status === 'sending' || !body.trim() ? 'default' : 'pointer',
            opacity: status === 'sending' || !body.trim() ? 0.6 : 1,
          }}
        >
          {status === 'sending' ? 'Sending…' : 'Send reply'}
        </button>
        {status === 'sent' && <span style={{ color: '#3A7D6E', fontSize: 13 }}>Sent.</span>}
        {status === 'error' && <span style={{ color: '#B5533A', fontSize: 13 }}>{error}</span>}
      </div>
    </div>
  );
}
