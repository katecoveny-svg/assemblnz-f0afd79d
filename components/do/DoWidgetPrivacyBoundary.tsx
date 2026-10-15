'use client';

import { useEffect, useState } from 'react';
import { readWritingOwner, WRITING_OWNER_CHANGED_EVENT } from '@/apps/do/shared/use-writing-owner';
import { createClient } from '@/lib/supabase/client';
import { replacePersonalLoad, shouldRevalidatePersonalOwner } from '@/apps/do/personal/session';
import { DoFocusWorkspace } from './DoFocusWorkspace';
import type { DoTask } from '@/apps/do/shared/preparation';

/** Identity events only invalidate. The existing server contract verifies ownership. */
export function DoWidgetPrivacyBoundary({ initialTask }: { initialTask: DoTask }) {
  const [scope, setScope] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let mounted = true;
    let verified: string | null = null;
    let generation = 0;
    let request: AbortController | null = null;
    async function revalidate() {
      setChecking(true);
      const attempt = ++generation;
      const controller = replacePersonalLoad(request);
      request = controller;
      try {
        const next = await readWritingOwner(AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]));
        if (!mounted || controller.signal.aborted || attempt !== generation) return;
        verified = next; setScope(next); setError(false); setChecking(false);
      } catch {
        if (!mounted || controller.signal.aborted || attempt !== generation) return;
        verified = null; setScope(null); setError(true); setChecking(false);
      }
    }
    const invalidate = () => {
      generation++; request?.abort(); verified = null;
      setScope(null); setError(false); void revalidate();
    };
    // Focusing the embedded editor is not an account transition; hiding it here steals keystrokes.
    const focus = () => { if (window === window.top) void revalidate(); };
    void revalidate();
    const retry = () => { void revalidate(); };
    window.addEventListener('assembl:do-widget-owner-retry', retry);
    const storage = (event: StorageEvent) => {
      if (event.key === null || (event.key.startsWith('sb-') && event.key.endsWith('-auth-token'))) invalidate();
      else void revalidate();
    };
    window.addEventListener('storage', storage);
    window.addEventListener('focus', focus);
    window.addEventListener(WRITING_OWNER_CHANGED_EVENT, invalidate);
    let unsubscribe: (() => void) | undefined;
    try {
      const subscription = createClient().auth.onAuthStateChange((event, session) => {
        if (!shouldRevalidatePersonalOwner(event, verified, session?.user?.id ?? 'guest')) return;
        // Unmount now, before asynchronous verification can finish: abort child work.
        invalidate();
      });
      unsubscribe = () => subscription.data.subscription.unsubscribe();
    } catch { /* Existing local guest contract still verifies through the server. */ }
    return () => { mounted = false; generation++; request?.abort(); unsubscribe?.(); window.removeEventListener('focus', focus); window.removeEventListener('storage', storage); window.removeEventListener('assembl:do-widget-owner-retry', retry); window.removeEventListener(WRITING_OWNER_CHANGED_EVENT, invalidate); };
  }, []);
  if (!scope) return <div role="status">{error ? <>DO could not verify this workspace. <button onClick={() => window.dispatchEvent(new Event('assembl:do-widget-owner-retry'))}>Retry workspace</button></> : 'Checking this workspace…'}</div>;
  return <><div hidden={checking} inert={checking}><DoFocusWorkspace key={scope} initialTask={initialTask} expectedWorkspace={checking ? undefined : scope} /></div>{checking && <div role="status">Checking this workspace…</div>}</>;
}
