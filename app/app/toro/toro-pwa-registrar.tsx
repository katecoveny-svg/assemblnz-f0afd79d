'use client';

import { useEffect } from 'react';

export function ToroPwaRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js', { scope: '/app/toro' }).catch(() => {
      // Installability is progressive enhancement; the app remains usable.
    });
  }, []);

  return null;
}
