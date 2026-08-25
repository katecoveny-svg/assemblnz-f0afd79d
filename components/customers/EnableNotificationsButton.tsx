'use client';

import { useEffect, useState } from 'react';
import { pwaBaseForPath } from '@/lib/pwa/tenants';

/**
 * A quiet "enable notifications" micro-label button for the pilot workspaces.
 *
 * Subscribes this browser to web push through the tenant-scoped service
 * worker and stores the subscription via /api/push/subscribe. Notifications
 * are pointers only ("new draft reply waiting") — the draft-only send rules
 * are untouched.
 *
 * Renders nothing when push isn't supported (or no VAPID key is configured),
 * so the workspace stays clean on unsupported browsers.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = 'hidden' | 'idle' | 'working' | 'enabled' | 'denied' | 'error';

export function EnableNotificationsButton({ slug }: { slug: string }) {
  const [state, setState] = useState<State>('hidden');

  useEffect(() => {
    if (
      !VAPID_PUBLIC_KEY ||
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    // Already subscribed? Show the quiet "on" state.
    navigator.serviceWorker.getRegistrations().then(async (regs) => {
      for (const reg of regs) {
        try {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            setState('enabled');
            return;
          }
        } catch {
          /* keep looking */
        }
      }
      setState('idle');
    });
  }, []);

  const enable = async () => {
    if (state === 'working' || state === 'enabled') return;
    setState('working');
    try {
      const hit = pwaBaseForPath(window.location.pathname);
      const base = hit?.base ?? `/customers/${slug}`;
      const reg =
        (await navigator.serviceWorker.getRegistration(`${base}/`)) ??
        (await navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }));
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'idle');
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY as string),
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantSlug: slug, subscription: subscription.toJSON() }),
      });
      setState(res.ok ? 'enabled' : 'error');
    } catch {
      setState('error');
    }
  };

  if (state === 'hidden') return null;

  const label =
    state === 'enabled'
      ? 'notifications on'
      : state === 'working'
        ? 'enabling…'
        : state === 'denied'
          ? 'notifications blocked in browser settings'
          : state === 'error'
            ? 'notifications — try again'
            : 'enable notifications';

  return (
    <button
      type="button"
      onClick={enable}
      disabled={state === 'working' || state === 'enabled' || state === 'denied'}
      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-1 transition-colors hover:bg-black/5 disabled:cursor-default disabled:hover:bg-white/70"
      style={{
        fontSize: 12,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: '#5A5850',
      }}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: state === 'enabled' ? '#BFA37A' : '#D8D6CE' }}
      />
      {label}
    </button>
  );
}
