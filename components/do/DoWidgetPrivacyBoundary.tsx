'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { replacePersonalLoad, shouldRevalidatePersonalOwner } from '@/apps/do/personal/session';
import { DoFocusWorkspace } from './DoFocusWorkspace';
import type { DoTask } from '@/apps/do/shared/preparation';

/** Identity events only invalidate. The existing server contract verifies ownership. */
export function DoWidgetPrivacyBoundary({ initialTask }: { initialTask: DoTask }) {
  const [scope, setScope] = useState<string | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let mounted = true;
    let verified: string | null = null;
    let generation = 0;
    let request: AbortController | null = null;
    async function revalidate() {
      const attempt = ++generation;
      const controller = replacePersonalLoad(request);
      request = controller;
      try {
        const response = await fetch('/api/do/personal', { cache: 'no-store', signal: controller.signal });
        const data = await response.json();
        if (!mounted || controller.signal.aborted || attempt !== generation) return;
        const next = response.status === 401 && data.workspaceKey === 'guest' ? 'guest'
          : response.ok && typeof data.workspaceKey === 'string' && /^[a-f0-9-]{36}$/i.test(data.workspaceKey) ? data.workspaceKey : null;
        if (!next) throw new Error('Identity unavailable');
        verified = next; setScope(next); setError(false);
      } catch {
        if (!mounted || controller.signal.aborted || attempt !== generation) return;
        verified = null; setScope(null); setError(true);
      }
    }
    const focus = () => { void revalidate(); };
    void revalidate();
    window.addEventListener('focus', focus);
    let unsubscribe: (() => void) | undefined;
    try {
      const subscription = createClient().auth.onAuthStateChange((event, session) => {
        if (!shouldRevalidatePersonalOwner(event, verified, session?.user?.id ?? 'guest')) return;
        // Unmount now, before asynchronous verification can finish: abort child work.
        generation++; request?.abort(); verified = null;
        setScope(null); setError(false); void revalidate();
      });
      unsubscribe = () => subscription.data.subscription.unsubscribe();
    } catch { /* Existing local guest contract still verifies through the server. */ }
    return () => { mounted = false; generation++; request?.abort(); unsubscribe?.(); window.removeEventListener('focus', focus); };
  }, []);
  if (!scope) return <div role="status">{error ? <>DO could not verify this workspace. <button onClick={() => window.dispatchEvent(new Event('focus'))}>Retry workspace</button></> : 'Checking this workspace…'}</div>;
  return <DoFocusWorkspace key={scope} initialTask={initialTask} />;
}
