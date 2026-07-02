import type { Metadata } from 'next';
// Server-safe token entry — proves `@assembl/canvas/tokens` imports cleanly
// from a React Server Component (plain data, no "use client" directive).
import { tokens } from '@assembl/canvas/tokens';
import { CanvasDemo } from './CanvasDemo';

export const metadata: Metadata = {
  title: 'canvas — assembl design system',
  robots: { index: false, follow: false },
};

/**
 * /dev/canvas — consumer smoke test for the `@assembl/canvas` workspace
 * package. Renders every export so the Next build proves the workspace
 * wiring compiles end to end. Not linked from anywhere; never indexed.
 */
export default function CanvasDevPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: tokens.palette.paper }}>
      <CanvasDemo />
    </main>
  );
}
