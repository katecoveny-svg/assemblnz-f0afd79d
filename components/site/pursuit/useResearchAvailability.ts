'use client';

import { useEffect, useState } from 'react';

export type ResearchAvailability = {
  ready: boolean;
  typesafeReady: boolean;
  message?: string;
};

const EVENT = 'pursuit-research-updated';
export function refreshResearchAvailability() {
  window.dispatchEvent(new Event(EVENT));
}

/** Both public forms share one allowance; refresh both after either makes a request. */
export function useResearchAvailability() {
  const [status, setStatus] = useState<ResearchAvailability | null>(null);
  useEffect(() => {
    let controller: AbortController;
    const refresh = () => {
      controller?.abort();
      controller = new AbortController();
      const current = controller;
      fetch('/api/pursuit/research', { cache: 'no-store', signal: AbortSignal.any([current.signal, AbortSignal.timeout(12000)]) })
        .then(response => response.ok ? response.json() : null)
        .then(value => { if (!current.signal.aborted) setStatus(value ?? { ready: false, typesafeReady: false }); })
        .catch(() => { if (!current.signal.aborted) setStatus({ ready: false, typesafeReady: false }); });
    };
    refresh();
    window.addEventListener(EVENT, refresh);
    return () => { controller?.abort(); window.removeEventListener(EVENT, refresh); };
  }, []);
  return status;
}
