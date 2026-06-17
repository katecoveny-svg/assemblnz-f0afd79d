'use client';

/**
 * useToolGate — drop-in access gating for any HAPAI tool.
 *
 * Wraps a tool's `fetch` so the shared funnel (anonymous: 1 free run → email
 * capture → 5 runs/day) works with a ~2-line change per tool:
 *
 *   const gate = useToolGate('9am-brief');
 *   const res = await gate.fetch('/api/hapai/9am-brief', { ... });
 *   if (!res) return;            // gated — capture modal is showing, stop here
 *   // ...use res as normal...
 *   // render {gate.counter} near the CTA and {gate.modal} once in the tree
 *
 * On a 402 `limit_reached` with `capture: true`, the capture modal opens and the
 * original request is replayed automatically once the email lifts the limit, so
 * the visitor's run completes without them re-clicking. Everything is fail-soft:
 * a peek/network error just hides the counter, it never blocks the tool.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CaptureModal } from '@/components/gating/CaptureModal';
import { RemainingCounter } from '@/components/gating/RemainingCounter';

type Remaining = number | 'unlimited' | null;

export type ToolGate = {
  /** Drop-in replacement for fetch(). Resolves to a Response, or null if the
   *  request was gated (the capture modal is now showing — stop your handler). */
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response | null>;
  /** The "X runs remaining" pill. Render it near the run button. */
  counter: React.ReactNode;
  /** The email-capture modal. Render it once anywhere in the tree. */
  modal: React.ReactNode;
  /** Current remaining runs (number), 'unlimited', or null while unknown. */
  remaining: Remaining;
};

export function useToolGate(slug: string, opts?: { noun?: string }): ToolGate {
  const surface = `hapai:${slug}`;
  const [remaining, setRemaining] = useState<Remaining>(null);
  const [captureOpen, setCaptureOpen] = useState(false);

  // Holds the in-flight gated request so we can replay it after the email lifts
  // the limit, and resolve the caller's original promise with the real Response.
  const pending = useRef<{
    input: RequestInfo | URL;
    init?: RequestInit;
    resolve: (res: Response | null) => void;
  } | null>(null);

  // Read remaining quota without consuming a run. Used on mount and to resync
  // after an email lifts the limit. Fail-soft: errors leave the counter hidden.
  const peek = useCallback(() => {
    fetch(`/api/gating/peek?surface=${encodeURIComponent(surface)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { remaining?: Remaining } | null) => {
        if (data && data.remaining !== undefined) setRemaining(data.remaining);
      })
      .catch(() => {
        /* fail-soft: counter stays hidden */
      });
  }, [surface]);

  useEffect(() => {
    peek();
  }, [peek]);

  // Prefer the server's exact figure when present; otherwise mirror the server's
  // consume optimistically so the counter ticks down after each run.
  const readRemaining = useCallback((res: Response) => {
    const header = res.headers.get('X-Gate-Remaining');
    if (header) {
      setRemaining(header === 'unlimited' ? 'unlimited' : Number(header));
    } else if (res.ok) {
      setRemaining((r) => (typeof r === 'number' ? Math.max(0, r - 1) : r));
    }
  }, []);

  const run = useCallback(
    async (
      input: RequestInfo | URL,
      init: RequestInit | undefined,
      resolve: (res: Response | null) => void,
    ) => {
      let res: Response;
      try {
        res = await fetch(input, init);
      } catch (err) {
        // Network error — let the caller's own try/catch handle it.
        resolve(Promise.reject(err) as unknown as Response);
        return;
      }
      readRemaining(res);
      if (res.status === 402) {
        const data = (await res
          .clone()
          .json()
          .catch(() => null)) as { capture?: boolean } | null;
        if (data?.capture) {
          pending.current = { input, init, resolve };
          setRemaining(0);
          setCaptureOpen(true);
          return; // resolve happens after capture (replay) or modal close (null)
        }
      }
      resolve(res);
    },
    [readRemaining],
  );

  const gatedFetch = useCallback(
    (input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response | null>((resolve) => {
        void run(input, init, resolve);
      }),
    [run],
  );

  const onUnlocked = useCallback(() => {
    setCaptureOpen(false);
    peek(); // email tier just unlocked — resync the counter to the new limit
    const job = pending.current;
    pending.current = null;
    if (job) void run(job.input, job.init, job.resolve);
  }, [run, peek]);

  const onClose = useCallback(() => {
    setCaptureOpen(false);
    const job = pending.current;
    pending.current = null;
    job?.resolve(null); // caller stops its handler; result already on screen
  }, []);

  return {
    fetch: gatedFetch,
    remaining,
    counter: <RemainingCounter remaining={remaining} noun={opts?.noun ?? 'run'} />,
    modal: (
      <CaptureModal open={captureOpen} surface={surface} onClose={onClose} onUnlocked={onUnlocked} />
    ),
  };
}
