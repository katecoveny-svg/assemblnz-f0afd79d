'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type AssemblAccentContextValue = {
  /** Currently-hovered accent (hex), or null for the default */
  accent: string | null;
  setAccent: (hex: string | null) => void;
};

const AssemblAccentContext = createContext<AssemblAccentContextValue>({
  accent: null,
  setAccent: () => {},
});

export function AssemblAccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccent] = useState<string | null>(null);
  return (
    <AssemblAccentContext.Provider value={{ accent, setAccent }}>
      {children}
    </AssemblAccentContext.Provider>
  );
}

export function useAssemblAccent() {
  return useContext(AssemblAccentContext);
}
