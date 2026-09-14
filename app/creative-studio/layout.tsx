import type { ReactNode } from 'react';

/** Full-viewport creative director — suppress competing chrome density. */
export default function CreativeStudioLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[color:var(--assembl-paper,#FFFDFB)]">{children}</div>;
}
