'use client';

import { useEffect, useState } from 'react';

/**
 * A stable per-browser session id, shared across the Bills console so a bill
 * parsed on the Bills tab is visible to the advisor chat (which grounds its
 * answers in the user's own parsed bills). Demo-scoped — no account needed.
 */
export function useBillsSession(): string {
  const [id, setId] = useState('');
  useEffect(() => {
    let s = '';
    try {
      s = localStorage.getItem('assembl_bills_session') ?? '';
      if (!s) {
        s = `bs_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
        localStorage.setItem('assembl_bills_session', s);
      }
    } catch {
      s = 'bs_ephemeral';
    }
    setId(s);
  }, []);
  return id;
}
