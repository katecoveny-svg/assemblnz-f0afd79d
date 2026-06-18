'use client';

/**
 * DashLoaderProvider — optional context for global consumer opt-in state.
 *
 * Hydrates ConsumerSettings from localStorage (`dash_loader_settings_v1`) once
 * on mount so every <DashLoader mode="consumer"> in a session shares one
 * opt-in decision, and re-persists whenever it changes. If the key is absent
 * or cleared, settings fall back to the brand default (opted OUT, SPCA NZ) so
 * the opt-in surface re-shows — exactly the "no dark patterns" requirement.
 *
 * Usage is opt-in: a bare <DashLoader> works without this provider (the parent
 * just owns settings itself). Nothing here reads page content.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ConsumerSettings } from './types';
import { LOCALSTORAGE_KEY } from './types';
import { defaultSettings, parseSettings, serializeSettings } from './logic';

interface DashLoaderContextValue {
  settings: ConsumerSettings;
  setSettings: (next: ConsumerSettings) => void;
  /** True once localStorage has been read (avoids an opt-in flash on hydrate). */
  hydrated: boolean;
}

const DashLoaderContext = createContext<DashLoaderContextValue | null>(null);

export function DashLoaderProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<ConsumerSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = parseSettings(window.localStorage.getItem(LOCALSTORAGE_KEY));
      if (stored) setSettingsState(stored);
    } catch {
      /* storage disabled — keep defaults (opted out) */
    }
    setHydrated(true);
  }, []);

  const setSettings = useCallback((next: ConsumerSettings) => {
    setSettingsState(next);
    try {
      window.localStorage.setItem(LOCALSTORAGE_KEY, serializeSettings(next));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ settings, setSettings, hydrated }),
    [settings, setSettings, hydrated],
  );

  return <DashLoaderContext.Provider value={value}>{children}</DashLoaderContext.Provider>;
}

export function useDashLoaderSettings(): DashLoaderContextValue {
  const ctx = useContext(DashLoaderContext);
  if (!ctx) {
    throw new Error('useDashLoaderSettings must be used within a <DashLoaderProvider>');
  }
  return ctx;
}
