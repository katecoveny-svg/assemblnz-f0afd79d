'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

const identity = z.object({ workspaceKey: z.union([z.literal('guest'), z.string().uuid()]) });
export async function readWritingOwner(signal?: AbortSignal): Promise<string> {
  const response = await fetch('/api/do/session', { cache: 'no-store', credentials: 'same-origin', signal });
  if (!response.ok) throw new Error('Reconnect to verify whose drafts to open.');
  return identity.parse(await response.json()).workspaceKey;
}

/** Auth events invalidate; only a cookie-verified server response grants access. */
export function useWritingOwner(enabled: boolean) {
  const [state, setState] = useState<{ owner: string | null; initialOwner: string | null; ready: boolean; failed: boolean }>({ owner: null, initialOwner: null, ready: false, failed: false });
  useEffect(() => {
    if (!enabled) return;
    let active = true, generation = 0;
    let verified: string | null = null;
    let request: AbortController | null = null;
    const refresh = () => {
      const attempt = ++generation;
      request?.abort(); request = new AbortController();
      setState(previous => ({ ...previous, ready: false, failed: false }));
      void readWritingOwner(AbortSignal.any([request.signal, AbortSignal.timeout(10_000)])).then(owner => {
        if (!active || generation !== attempt) return;
        verified = owner; setState(previous => ({ owner, initialOwner: previous.initialOwner ?? owner, ready: true, failed: false }));
      }).catch(() => {
        if (!active || generation !== attempt) return;
        // Keep the old editor hidden for same-owner reconnect, never reclassify as guest.
        setState(previous => ({ ...previous, ready: false, failed: true }));
      });
    };
    const invalidate = () => { verified = null; setState(previous => ({ ...previous, owner: null, ready: false, failed: false })); refresh(); };
    const storage = (event: StorageEvent) => {
      if (event.key === null) invalidate();
      else refresh();
    };
    refresh();
    // Moving focus from a same-page launcher into its iframe must not hide the input mid-keystroke.
    // Embedded auth/storage events and page visibility still invalidate ownership.
    const focus = () => { if (window === window.top) refresh(); };
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', visible);
    const events = ['pageshow', 'online', 'assembl:do-writing-retry'] as const;
    events.forEach(event => window.addEventListener(event, refresh));
    window.addEventListener('storage', storage);
    let unsubscribe = () => {};
    try {
      const { data } = createClient().auth.onAuthStateChange((event, session) => {
        const hinted = session?.user && !session.user.is_anonymous ? session.user.id : 'guest';
        if (event === 'SIGNED_OUT' || (verified !== null && hinted !== verified)) invalidate();
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch { /* Cookie verification remains required even without client auth configuration. */ }
    return () => { active = false; generation++; request?.abort(); unsubscribe(); events.forEach(event => window.removeEventListener(event, refresh)); window.removeEventListener('storage', storage); window.removeEventListener('focus', focus); document.removeEventListener('visibilitychange', visible); };
  }, [enabled]);
  return state;
}
