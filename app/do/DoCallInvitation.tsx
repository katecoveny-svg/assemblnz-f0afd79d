'use client';
import { useEffect, useRef } from 'react';
import { startCallRing } from '@/apps/do/shared/call-ring';

/** Local invitation only. Answer delegates to the existing consent/token checks. */
export function DoCallInvitation({ displayName, onAnswer, onDecline }: {
  displayName: string; onAnswer: () => void; onDecline: () => void;
}) {
  const settled = useRef(false);
  const stop = useRef<() => void>(() => {});
  const decline = useRef(onDecline);
  useEffect(() => { decline.current = onDecline; }, [onDecline]);
  useEffect(() => {
    stop.current = startCallRing();
    const cancel = () => {
      if (settled.current) return;
      settled.current = true;
      stop.current();
      decline.current();
    };
    const hidden = () => { if (document.hidden) cancel(); };
    const timer = window.setTimeout(cancel, 30_000);
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', cancel);
    window.addEventListener('offline', cancel);
    return () => {
      stop.current();
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', cancel);
      window.removeEventListener('offline', cancel);
    };
  }, []);
  function finish(answer: boolean) {
    if (settled.current) return;
    settled.current = true;
    stop.current();
    if (answer) onAnswer(); else onDecline();
  }
  return <section className="do-call-invitation" aria-label="Answer your DO call">
    <span className="do-call-ring" aria-hidden="true">↗</span>
    <h3>{displayName} is ready to talk</h3>
    <p role="status">Ringing on this device · microphone off</p>
    <p>Answer to connect your reviewed Google Gemini call. This is an in-app call, not a phone call.</p>
    <div className="do-live-controls">
      <button type="button" autoFocus onClick={() => finish(true)}>Answer call</button>
      <button type="button" onClick={() => finish(false)}>Decline call</button>
    </div>
    <p>Once connected, keep talking naturally and interrupt when needed. Leaving this tab ends the call.</p>
  </section>;
}
