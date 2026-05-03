import { createContext, useContext, ReactNode } from "react";
import { KeteSlug, MaramaTokens, maramaTokens } from "./tokens";

const MaramaKeteContext = createContext<MaramaTokens>(maramaTokens("admin"));

interface ProviderProps {
  kete?: KeteSlug;
  children: ReactNode;
}

/**
 * Wrap a dashboard subtree to give every Mārama primitive (Card, Stat,
 * Badge, Button, Shell sidebar) the correct kete accent without prop
 * drilling.
 */
export function MaramaKeteProvider({ kete = "admin", children }: ProviderProps) {
  return (
    <MaramaKeteContext.Provider value={maramaTokens(kete)}>
      {children}
    </MaramaKeteContext.Provider>
  );
}

export function useMaramaTokens(): MaramaTokens {
  return useContext(MaramaKeteContext);
}
