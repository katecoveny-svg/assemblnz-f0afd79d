import Link from 'next/link';
import { PALETTE } from '@/lib/marketplace/agents';

/**
 * The marketplace wordmark: lowercase `assembl` with a gold full-stop —
 * mirrors the `dash.` lockup from the Dash work.
 */
export function Wordmark({
  className,
  href = '/agents',
}: {
  className?: string;
  href?: string | null;
}) {
  const mark = (
    <span
      className={`font-display lowercase tracking-tight ${className ?? ''}`}
      style={{ color: PALETTE.forest }}
    >
      assembl
      <span style={{ color: PALETTE.gold }}>.</span>
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} aria-label="assembl agent marketplace" className="inline-flex items-baseline">
      {mark}
    </Link>
  );
}
