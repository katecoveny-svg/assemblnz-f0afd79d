import type { ReactNode } from 'react';

// Suppress the site chrome for the studio — it wants the full viewport.
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[color:var(--assembl-paper)]">{children}</div>;
}
