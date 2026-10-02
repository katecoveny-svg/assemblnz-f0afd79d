'use client';
import { useEffect, useLayoutEffect, useRef, type MutableRefObject } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NativeReviewBridge, NativeRecipientLookupError, nativeRecipientSchema, nativeReviewDocumentAllowed, type NativeBinding, type NativeReviewRequest, type NativeResponse } from './native-review-bridge';

declare global { interface Window { assemblDoNativeReview?: (request: NativeReviewRequest) => Promise<NativeResponse> } }
type Options = {
  enabled: boolean;
  source: string;
  occupied: boolean;
  revision: MutableRefObject<number>;
  onCommit(text: string, owner: string): void;
  onReset(): void;
  onReveal?(): void;
};

/** Native-v1 is a transient editor. This hook never reads/writes a draft store. */
export function useNativeReview(options: Options) {
  const latest = useRef(options);
  useLayoutEffect(() => { latest.current = options; });
  const bridge = useRef<NativeReviewBridge | null>(null);
  const owner = useRef<string | null>(null);
  const pending = useRef<{ text: string; binding: NativeBinding; committed: (revision: number) => void } | null>(null);
  useLayoutEffect(() => {
    const offer = pending.current;
    if (!offer || options.source !== offer.text || options.revision.current !== offer.binding.editorRevision + 1) return;
    pending.current = null;
    offer.committed(options.revision.current);
  });

  useEffect(() => {
    if (!options.enabled || !nativeReviewDocumentAllowed(location.href, window === window.top)) return;
    const controller = new AbortController();
    const reset = () => { owner.current = null; pending.current = null; latest.current.onReset(); };
    const receiver = new NativeReviewBridge({
      allowedDocument: () => nativeReviewDocumentAllowed(location.href, window === window.top),
      resolveRecipient: async () => {
        // No text, query, token or request body; page-owned cookies only.
        const response = await fetch('/api/do/native-recipient', { method: 'GET', credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]) });
        if (!response.ok) throw new NativeRecipientLookupError(response.status === 401 ? 'sign_in_required' : response.status === 404 ? 'workspace_version_required' : 'recipient_unavailable');
        const parsed = nativeRecipientSchema.safeParse(await response.json());
        return parsed.success ? parsed.data : null;
      },
      editor: () => ({ revision: latest.current.revision.current, occupied: latest.current.occupied }),
      commit: (text, binding, committed) => {
        owner.current = binding.owner;
        pending.current = { text, binding, committed };
        latest.current.onCommit(text, binding.owner);
        latest.current.onReveal?.();
      },
      clear: reset,
    });
    bridge.current = receiver;
    const receive = (request: NativeReviewRequest) => receiver.request(request);
    window.assemblDoNativeReview = receive;
    const invalidate = () => receiver.invalidate();
    const pagehide = () => receiver.dispose();
    window.addEventListener('assembl:do-native-scope-changed', invalidate);
    window.addEventListener('popstate', invalidate);
    window.addEventListener('pagehide', pagehide);
    let unsubscribe = () => {};
    try {
      let seenOwner: string | null = null;
      const { data } = createClient().auth.onAuthStateChange((event, session) => {
        const next = session?.user?.id ?? null; // Session/token material never leaves the page.
        if (event === 'INITIAL_SESSION') { seenOwner = next; return; }
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || next !== seenOwner) receiver.invalidate();
        seenOwner = next;
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch { receiver.invalidate(); } // Missing configuration cannot establish a recipient.
    return () => {
      controller.abort(); unsubscribe(); receiver.dispose();
      if (window.assemblDoNativeReview === receive) delete window.assemblDoNativeReview;
      if (bridge.current === receiver) bridge.current = null;
      window.removeEventListener('assembl:do-native-scope-changed', invalidate);
      window.removeEventListener('popstate', invalidate);
      window.removeEventListener('pagehide', pagehide);
    };
  }, [options.enabled]);
  return { owner, bridge };
}
