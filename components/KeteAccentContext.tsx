'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type KeteAccentContextValue = {
  /** Currently-hovered kete accent (hex), or null for default gold */
  accent: string | null;
  setAccent: (hex: string | null) => void;
};

const KeteAccentContext = createContext<KeteAccentContextValue>({
  accent: null,
  setAccent: () => {},
});

export function KeteAccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccent] = useState<string | null>(null);
  return (
    <KeteAccentContext.Provider value={{ accent, setAccent }}>
      {children}
    </KeteAccentContext.Provider>
  );
}

export function useKeteAccent() {
  return useContext(KeteAccentContext);
}
