'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { WALLET } from '@/lib/customers/contact-energy/data';

/**
 * Session-scoped Assembling credit tally for the pitch demo. Starts at the
 * fictional month-to-date figure; wait-state demos increment it live so the
 * viewer watches cents land as bill credits. Demo only — nothing persists,
 * no real credits exist.
 */

type CreditsState = {
  credits: number;
  /** Bumps every time credits land — used to trigger the tally pulse. */
  pulseKey: number;
  addCredits: (amount: number) => void;
};

const CreditsContext = createContext<CreditsState | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState(WALLET.thisMonth);
  const [pulseKey, setPulseKey] = useState(0);

  const addCredits = useCallback((amount: number) => {
    setCredits((c) => Math.round((c + amount) * 100) / 100);
    setPulseKey((k) => k + 1);
  }, []);

  const value = useMemo(() => ({ credits, pulseKey, addCredits }), [credits, pulseKey, addCredits]);

  return <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>;
}

export function useCredits(): CreditsState {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error('useCredits must be used inside <CreditsProvider>');
  return ctx;
}
